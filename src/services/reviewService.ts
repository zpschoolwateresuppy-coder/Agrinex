import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Booking, Review, UserProfile } from '../types';
import { notificationService } from './notificationService';

const REVIEWS_COLLECTION = 'reviews';

export const reviewService = {
  async submitReview(data: {
    bookingId: string;
    reviewerId: string;
    reviewerName: string;
    targetUserId: string;
    rating: number;
    workQuality: string;
    punctuality: string;
    behavior: string;
    comment: string;
  }): Promise<string> {
    // 1. Fetch booking to verify state and participants
    const bookingRef = doc(db, 'bookings', data.bookingId);
    const bookingSnap = await getDoc(bookingRef);
    if (!bookingSnap.exists()) {
      throw new Error('संबंधित बुकिंग सापडले नाही.');
    }

    const booking = bookingSnap.data() as Booking;
    if (booking.status !== 'completed') {
      throw new Error('केवळ पूर्ण झालेल्या कामांसाठीच रेटिंग व अभिप्राय देता येतो.');
    }

    const isPoster = booking.posterId === data.reviewerId;
    const isRequester = booking.requesterId === data.reviewerId;
    if (!isPoster && !isRequester) {
      throw new Error('तुम्ही या कामाचे भागीदार नसल्याने रिव्ह्यू देऊ शकत नाही.');
    }

    if (isPoster && booking.hasPosterRated) {
      throw new Error('तुम्ही या कामासाठी आधीच रेटिंग दिली आहे.');
    }
    if (isRequester && booking.hasRequesterRated) {
      throw new Error('तुम्ही या कामासाठी आधीच रेटिंग दिली आहे.');
    }

    const reviewRef = doc(collection(db, REVIEWS_COLLECTION));
    const now = new Date().toISOString();

    const newReview: Review = {
      ...data,
      id: reviewRef.id,
      createdAt: now,
    };

    try {
      // Save review document
      await setDoc(reviewRef, newReview);

      // Update booking rated flag
      await updateDoc(bookingRef, {
        [isPoster ? 'hasPosterRated' : 'hasRequesterRated']: true,
        updatedAt: now,
      });

      // Update target user's average rating
      const targetUserRef = doc(db, 'users', data.targetUserId);
      const targetSnap = await getDoc(targetUserRef);
      if (targetSnap.exists()) {
        const profile = targetSnap.data() as UserProfile;
        const currentCount = profile.reviewCount || 0;
        const currentAvg = profile.rating || 5.0;

        const newCount = currentCount + 1;
        const newAvg = Number(((currentAvg * currentCount + data.rating) / newCount).toFixed(1));

        await updateDoc(targetUserRef, {
          rating: newAvg,
          reviewCount: newCount,
          updatedAt: now,
        });
      }

      // Send notification to the rated user
      await notificationService.sendNotification({
        userId: data.targetUserId,
        type: 'new_review',
        title: 'नवीन रेटिंग व अभिप्राय मिळाला! ⭐',
        message: `${data.reviewerName} यांनी तुम्हाला ${data.rating} स्टार रेटिंग व अभिप्राय दिला आहे.`,
        bookingId: data.bookingId,
      });

      return reviewRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${REVIEWS_COLLECTION}/${reviewRef.id}`);
      throw error;
    }
  },

  async getUserReviews(targetUserId: string): Promise<Review[]> {
    try {
      const q = query(
        collection(db, REVIEWS_COLLECTION),
        where('targetUserId', '==', targetUserId)
      );
      const snap = await getDocs(q);
      const reviews: Review[] = [];
      snap.forEach((d) => reviews.push(d.data() as Review));
      reviews.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      return reviews;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, REVIEWS_COLLECTION);
      return [];
    }
  },
};

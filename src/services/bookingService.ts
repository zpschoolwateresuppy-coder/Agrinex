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
import { db, handleFirestoreError, OperationType, sanitizeFirestoreData } from '../firebase';
import { Booking, BookingStatus, Post } from '../types';
import { notificationService } from './notificationService';

const BOOKINGS_COLLECTION = 'bookings';

export const bookingService = {
  async createBooking(bookingData: {
    postId: string;
    postTitle: string;
    postType: Post['postType'];
    posterId: string;
    posterName: string;
    posterPhone?: string;
    requesterId: string;
    requesterName: string;
    requesterPhone?: string;
    village: string;
    workDate: string;
    agreedRate: number;
    rateType?: string;
    requestedWorkersCount?: number;
    note?: string;
  }): Promise<string> {
    if (bookingData.posterId === bookingData.requesterId) {
      throw new Error('तुम्ही तुमच्या स्वतःच्या पोस्टवर बुकिंग विनंती पाठवू शकत नाही.');
    }

    // Check for existing active booking from this requester for this post
    const existingQ = query(
      collection(db, BOOKINGS_COLLECTION),
      where('postId', '==', bookingData.postId),
      where('requesterId', '==', bookingData.requesterId)
    );
    const existingSnap = await getDocs(existingQ);
    const hasActive = existingSnap.docs.some((d) => {
      const st = d.data().status;
      return st === 'pending' || st === 'accepted' || st === 'in_progress';
    });
    if (hasActive) {
      throw new Error('तुम्ही या पोस्टसाठी आधीच विनंती पाठवली आहे.');
    }

    const bookingRef = doc(collection(db, BOOKINGS_COLLECTION));
    const now = new Date().toISOString();

    const rawBooking: Record<string, any> = {
      ...bookingData,
      id: bookingRef.id,
      status: 'pending',
      requestedWorkersCount: bookingData.requestedWorkersCount || 1,
      hasPosterRated: false,
      hasRequesterRated: false,
      createdAt: now,
      updatedAt: now,
    };

    const newBooking = sanitizeFirestoreData(rawBooking);

    try {
      await setDoc(bookingRef, newBooking);

      // Notify the poster
      await notificationService.sendNotification({
        userId: bookingData.posterId,
        type: 'booking_request',
        title: 'नवीन बुकिंग विनंती आली आहे!',
        message: `${bookingData.requesterName} यांनी तुमच्या "${bookingData.postTitle}" पोस्टसाठी विनंती पाठवली आहे.`,
        bookingId: bookingRef.id,
      });

      return bookingRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${BOOKINGS_COLLECTION}/${bookingRef.id}`);
      throw error;
    }
  },

  async getUserBookings(userId: string): Promise<{
    asRequester: Booking[];
    asPoster: Booking[];
  }> {
    try {
      // Query bookings where user is requester
      const reqQ = query(
        collection(db, BOOKINGS_COLLECTION),
        where('requesterId', '==', userId)
      );
      const reqSnap = await getDocs(reqQ);
      const asRequester: Booking[] = [];
      reqSnap.forEach((doc) => asRequester.push(doc.data() as Booking));

      // Query bookings where user is poster
      const postQ = query(
        collection(db, BOOKINGS_COLLECTION),
        where('posterId', '==', userId)
      );
      const postSnap = await getDocs(postQ);
      const asPoster: Booking[] = [];
      postSnap.forEach((doc) => asPoster.push(doc.data() as Booking));

      // Sort descending by updated date
      const sorter = (a: Booking, b: Booking) =>
        new Date(b.updatedAt || b.createdAt || 0).getTime() -
        new Date(a.updatedAt || a.createdAt || 0).getTime();

      asRequester.sort(sorter);
      asPoster.sort(sorter);

      return { asRequester, asPoster };
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, BOOKINGS_COLLECTION);
      return { asRequester: [], asPoster: [] };
    }
  },

  async getBookingById(bookingId: string): Promise<Booking | null> {
    try {
      const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as Booking;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${BOOKINGS_COLLECTION}/${bookingId}`);
      return null;
    }
  },

  async updateBookingStatus(
    bookingId: string,
    newStatus: BookingStatus,
    currentUserId: string
  ): Promise<void> {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    const snap = await getDoc(bookingRef);
    if (!snap.exists()) {
      throw new Error('बुकिंग सापडले नाही.');
    }

    const booking = snap.data() as Booking;
    const isPoster = booking.posterId === currentUserId;
    const isRequester = booking.requesterId === currentUserId;

    if (!isPoster && !isRequester) {
      throw new Error('तुम्हाला या बुकिंगची स्थिती बदलण्याची परवानगी नाही.');
    }

    // State machine check
    const currentStatus = booking.status;
    if (['completed', 'rejected', 'cancelled'].includes(currentStatus)) {
      throw new Error('ही बुकिंग आधीच पूर्ण, रद्द किंवा नाकारलेली आहे.');
    }

    // Role-based status transitions
    if (newStatus === 'accepted' || newStatus === 'rejected') {
      if (!isPoster) {
        throw new Error('फक्त पोस्ट मालकच विनंती स्वीकारू किंवा नाकारू शकतात.');
      }
    }

    const now = new Date().toISOString();
    try {
      await updateDoc(bookingRef, {
        status: newStatus,
        updatedAt: now,
      });

      // If accepted and post is workers_needed, update accepted count
      if (newStatus === 'accepted' && booking.postType === 'workers_needed') {
        const postRef = doc(db, 'posts', booking.postId);
        const postSnap = await getDoc(postRef);
        if (postSnap.exists()) {
          const postData = postSnap.data() as Post;
          const currentAccepted = postData.acceptedWorkersCount || 0;
          const workersAdded = booking.requestedWorkersCount || 1;
          const totalAccepted = currentAccepted + workersAdded;
          const isFilled = postData.requiredWorkers ? totalAccepted >= postData.requiredWorkers : false;

          await updateDoc(postRef, {
            acceptedWorkersCount: totalAccepted,
            status: isFilled ? 'filled' : 'active',
            updatedAt: now,
          });
        }
      }

      // Send status notifications
      const recipientId = isPoster ? booking.requesterId : booking.posterId;
      const statusTitleMap: Record<BookingStatus, string> = {
        accepted: 'बुकिंग स्वीकारली गेली आहे! 🎉',
        rejected: 'बुकिंग नाकारली गेली आहे',
        cancelled: 'बुकिंग रद्द करण्यात आली आहे',
        in_progress: 'कामास सुरुवात झाली आहे 🚜',
        completed: 'काम यशस्वीरीत्या पूर्ण झाले! 🌟',
        pending: 'बुकिंग प्रलंबित आहे',
      };

      const statusMsgMap: Record<BookingStatus, string> = {
        accepted: `तुमची "${booking.postTitle}" साठीची विनंती स्वीकारली आहे. आता तुम्ही फोनवरून संपर्क करू शकता.`,
        rejected: `तुमची "${booking.postTitle}" साठीची विनंती नाकारण्यात आली आहे.`,
        cancelled: `"${booking.postTitle}" साठीची बुकिंग रद्द करण्यात आली आहे.`,
        in_progress: `"${booking.postTitle}" चे काम सुरू झाले आहे.`,
        completed: `"${booking.postTitle}" चे काम पूर्ण झाले आहे. कृपया एकमेकांना रेटिंग व अभिप्राय द्या.`,
        pending: 'बुकिंग विनंती प्रलंबित आहे.',
      };

      await notificationService.sendNotification({
        userId: recipientId,
        type: `booking_${newStatus}`,
        title: statusTitleMap[newStatus],
        message: statusMsgMap[newStatus],
        bookingId: bookingId,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${BOOKINGS_COLLECTION}/${bookingId}`);
      throw error;
    }
  },
};

import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  updateDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, sanitizeFirestoreData } from '../firebase';
import { AppNotification } from '../types';

const NOTIFICATIONS_COLLECTION = 'notifications';

export const notificationService = {
  async sendNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    bookingId?: string;
  }): Promise<void> {
    const notifRef = doc(collection(db, NOTIFICATIONS_COLLECTION));
    const rawNotif: Record<string, any> = {
      ...data,
      id: notifRef.id,
      read: false,
      createdAt: new Date().toISOString(),
    };

    const notif = sanitizeFirestoreData(rawNotif);

    try {
      await setDoc(notifRef, notif);
    } catch (error) {
      console.warn('Notification send notice:', error);
    }
  },

  async getUserNotifications(userId: string): Promise<AppNotification[]> {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId)
      );
      const snap = await getDocs(q);
      const list: AppNotification[] = [];
      snap.forEach((d) => list.push(d.data() as AppNotification));
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, NOTIFICATIONS_COLLECTION);
      return [];
    }
  },

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const docRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
      await updateDoc(docRef, { read: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${NOTIFICATIONS_COLLECTION}/${notificationId}`);
    }
  },
};

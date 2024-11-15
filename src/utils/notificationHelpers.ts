import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';

export interface Notification {
  id: string;
  userId: string;
  type: 'verification' | 'share' | 'access';
  message: string;
  documentId?: string;
  createdAt: string;
  read: boolean;
}

export const NotificationService = {
  subscribeToNotifications: (userId: string, callback: (notifications: Notification[]) => void) => {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      callback(notifications);
    });
  },

  markAsRead: async (notificationId: string) => {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, { read: true });
  },

  markAllAsRead: async (userId: string) => {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const snapshot = await q.get();
    const batch = db.batch();
    
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });
    
    await batch.commit();
  }
};
import { db, auth, realtimeDb } from '../firebase';
import { ref, onDisconnect, set, serverTimestamp, onValue, off } from 'firebase/database';
import { doc, updateDoc } from 'firebase/firestore';

export const PresenceService = {
  initializePresence: async (userId: string) => {
    // Create a reference to this user's presence node
    const userStatusRef = ref(realtimeDb, `status/${userId}`);
    const userPresenceRef = ref(realtimeDb, `presence/${userId}`);
    
    // Create a reference to the last online timestamp
    const userLastOnlineRef = doc(db, 'users', userId);

    // When the client's connection state changes
    const connectedRef = ref(realtimeDb, '.info/connected');
    onValue(connectedRef, async (snapshot) => {
      if (snapshot.val() === false) {
        return;
      }

      // When user disconnects, update the presence state
      await onDisconnect(userStatusRef).set('offline');
      await onDisconnect(userPresenceRef).update({
        isOnline: false,
        lastOnline: serverTimestamp()
      });
      await onDisconnect(userLastOnlineRef).update({
        lastOnline: serverTimestamp()
      });

      // Set the user as online
      await set(userStatusRef, 'online');
      await set(userPresenceRef, {
        isOnline: true,
        lastOnline: serverTimestamp()
      });
      await updateDoc(userLastOnlineRef, {
        lastOnline: serverTimestamp()
      });
    });
  },

  subscribeToUserPresence: (userId: string, callback: (status: { isOnline: boolean; lastOnline: number }) => void) => {
    const userPresenceRef = ref(realtimeDb, `presence/${userId}`);
    
    onValue(userPresenceRef, (snapshot) => {
      const presence = snapshot.val() || { isOnline: false, lastOnline: null };
      callback(presence);
    });

    return () => off(userPresenceRef);
  },

  cleanup: (userId: string) => {
    const userStatusRef = ref(realtimeDb, `status/${userId}`);
    const userPresenceRef = ref(realtimeDb, `presence/${userId}`);
    
    // Remove all listeners
    off(userStatusRef);
    off(userPresenceRef);
    
    // Set offline status
    set(userStatusRef, 'offline');
    set(userPresenceRef, {
      isOnline: false,
      lastOnline: serverTimestamp()
    });
  }
};
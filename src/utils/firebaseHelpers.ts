import { analytics, db, storage } from '../firebase';
import { logEvent } from 'firebase/analytics';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

// Analytics Helpers
export const Analytics = {
  logUpload: (documentType: string) => {
    logEvent(analytics, 'document_upload', {
      document_type: documentType,
      timestamp: new Date().toISOString()
    });
  },

  logBlockCreation: (blockName: string, fieldCount: number) => {
    logEvent(analytics, 'block_creation', {
      block_name: blockName,
      field_count: fieldCount,
      timestamp: new Date().toISOString()
    });
  },

  logShareCreation: (expiryHours: number) => {
    logEvent(analytics, 'share_creation', {
      expiry_hours: expiryHours,
      timestamp: new Date().toISOString()
    });
  }
};

// Document Helpers
export const Documents = {
  upload: async (userId: string, file: File, documentType: string, metadata: any) => {
    const fileName = `${userId}/${documentType}/${file.name}`;
    const storageRef = ref(storage, fileName);
    
    try {
      const uploadTask = uploadBytesResumable(storageRef, file);
      const snapshot = await uploadTask;
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      const docRef = await addDoc(collection(db, 'users', userId, 'documents'), {
        type: documentType,
        name: file.name,
        url: downloadURL,
        metadata,
        uploadedAt: new Date().toISOString(),
        verified: false
      });

      Analytics.logUpload(documentType);
      return docRef.id;
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  },

  delete: async (userId: string, documentId: string, filePath: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId, 'documents', documentId));
      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);
    } catch (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }
};

// Block Helpers
export const Blocks = {
  create: async (userId: string, blockName: string, fields: any[]) => {
    try {
      const docRef = await addDoc(collection(db, 'users', userId, 'blocks'), {
        name: blockName,
        fields,
        createdAt: new Date().toISOString()
      });

      Analytics.logBlockCreation(blockName, fields.length);
      return docRef.id;
    } catch (error) {
      throw new Error(`Block creation failed: ${error.message}`);
    }
  },

  update: async (userId: string, blockId: string, updates: any) => {
    try {
      await updateDoc(doc(db, 'users', userId, 'blocks', blockId), updates);
    } catch (error) {
      throw new Error(`Block update failed: ${error.message}`);
    }
  }
};

// Share Helpers
export const Shares = {
  create: async (userId: string, blockId: string, recipientEmail: string, expiryHours: number) => {
    try {
      const docRef = await addDoc(collection(db, 'shares'), {
        userId,
        blockId,
        recipientEmail,
        expiresAt: new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        accessed: false
      });

      Analytics.logShareCreation(expiryHours);
      return docRef.id;
    } catch (error) {
      throw new Error(`Share creation failed: ${error.message}`);
    }
  },

  getActive: async (userId: string) => {
    try {
      const q = query(
        collection(db, 'shares'),
        where('userId', '==', userId),
        where('expiresAt', '>', new Date().toISOString())
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(`Failed to fetch shares: ${error.message}`);
    }
  }
};

// Error Handler
export const handleFirebaseError = (error: any) => {
  console.error('Firebase operation failed:', error);
  
  // Map common Firebase errors to user-friendly messages
  const errorMessages: { [key: string]: string } = {
    'permission-denied': 'You don\'t have permission to perform this action.',
    'not-found': 'The requested resource was not found.',
    'already-exists': 'This resource already exists.',
    'unauthenticated': 'Please sign in to continue.',
    'resource-exhausted': 'Operation rate limit exceeded. Please try again later.',
    'failed-precondition': 'The operation failed. Please check your input and try again.',
    'cancelled': 'The operation was cancelled.',
    'unknown': 'An unknown error occurred. Please try again.'
  };

  return errorMessages[error.code] || error.message;
};
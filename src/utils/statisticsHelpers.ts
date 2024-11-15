import { db } from '../firebase';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';

export interface DocumentStatistics {
  total: number;
  byType: { [key: string]: number };
}

export interface UserStatistics {
  totalDocuments: number;
  verifiedDocuments: number;
  activeShares: number;
  blocksCreated: number;
}

export const StatisticsService = {
  subscribeToGlobalStats: (callback: (stats: DocumentStatistics) => void) => {
    const statsRef = doc(db, 'statistics', 'documents');
    
    return onSnapshot(statsRef, (snapshot) => {
      callback(snapshot.data() as DocumentStatistics);
    });
  },

  getUserStatistics: async (userId: string): Promise<UserStatistics> => {
    const [documents, shares, blocks] = await Promise.all([
      getDocs(query(collection(db, 'users', userId, 'documents'))),
      getDocs(query(collection(db, 'shares'), where('userId', '==', userId))),
      getDocs(query(collection(db, 'users', userId, 'blocks')))
    ]);

    const verifiedDocs = documents.docs.filter(doc => doc.data().verified);

    return {
      totalDocuments: documents.size,
      verifiedDocuments: verifiedDocs.length,
      activeShares: shares.size,
      blocksCreated: blocks.size
    };
  }
};
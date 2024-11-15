import { db, auth } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export enum UserRole {
  USER = 1,      // Basic user - can upload and manage own documents
  ISSUER = 2,    // Can issue digital identities
  ADMIN = 3      // Full system access
}

export const RoleService = {
  getUserRole: async (userId: string): Promise<UserRole> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.data()?.role || UserRole.USER;
    } catch (error) {
      console.error('Error getting user role:', error);
      return UserRole.USER;
    }
  },

  requireRole: (requiredRole: UserRole) => {
    return async () => {
      if (!auth.currentUser) return false;
      
      const userRole = await RoleService.getUserRole(auth.currentUser.uid);
      return userRole >= requiredRole;
    };
  },

  isAuthorized: async (requiredRole: UserRole): Promise<boolean> => {
    if (!auth.currentUser) return false;
    const userRole = await RoleService.getUserRole(auth.currentUser.uid);
    return userRole >= requiredRole;
  }
};
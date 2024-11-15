import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { UserRole, RoleService } from '../utils/roleHelpers';
import { auth } from '../firebase';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: UserRole;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ children, requiredRole }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuthorization = async () => {
      if (!auth.currentUser) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      const isAuthorized = await RoleService.isAuthorized(requiredRole);
      setAuthorized(isAuthorized);
      setLoading(false);
    };

    checkAuthorization();
  }, [requiredRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authorized) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
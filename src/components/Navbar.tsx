import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Upload, Vault, Edit3, Share2, LogOut, Building2, Key, LogIn, Info } from 'lucide-react';
import { auth } from '../firebase';
import NotificationBell from './NotificationBell';
import { UserRole, RoleService } from '../utils/roleHelpers';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState<UserRole>(UserRole.USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
      if (user) {
        RoleService.getUserRole(user.uid).then(setUserRole);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Hide navbar on login and signup pages
  if (['/login', '/signup'].includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="bg-gray-800 border-b border-cyan-500/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-cyan-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Digital ID
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <NavLink to="/about" icon={<Info className="w-4 h-4" />} text="About" />
            {isAuthenticated ? (
              <>
                {userRole >= UserRole.ISSUER ? (
                  <NavLink to="/issuer" icon={<Building2 className="w-4 h-4" />} text="Issuer Portal" />
                ) : (
                  <>
                    <NavLink to="/upload" icon={<Upload className="w-4 h-4" />} text="Upload" />
                    <NavLink to="/vault" icon={<Vault className="w-4 h-4" />} text="Vault" />
                    <NavLink to="/editor" icon={<Edit3 className="w-4 h-4" />} text="Editor" />
                    <NavLink to="/share" icon={<Share2 className="w-4 h-4" />} text="Share" />
                    <NavLink to="/claim" icon={<Key className="w-4 h-4" />} text="Claim" />
                  </>
                )}
                <NotificationBell />
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, icon, text }: { to: string; icon: React.ReactNode; text: string }) => (
  <Link
    to={to}
    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
  >
    {icon}
    <span>{text}</span>
  </Link>
);

export default Navbar;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Key, FileCheck } from 'lucide-react';
import { auth } from '../firebase';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/vault');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,183,255,0.15),transparent_50%)] cyberpunk-grid -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Secure Digital Identity Platform
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Store and share your verified credentials securely using blockchain technology
          </p>
          
          <div className="mt-8">
            <button
              onClick={handleGetStarted}
              disabled={loading}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isAuthenticated ? (
                'Go to Vault'
              ) : (
                'Get Started'
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          <FeatureCard
            icon={<Shield className="w-8 h-8 text-cyan-400" />}
            title="Secure Storage"
            description="Your documents are encrypted and stored securely in your personal vault"
          />
          <FeatureCard
            icon={<Lock className="w-8 h-8 text-cyan-400" />}
            title="Privacy First"
            description="You control who sees your information and what they can access"
          />
          <FeatureCard
            icon={<Key className="w-8 h-8 text-cyan-400" />}
            title="Custom Blocks"
            description="Create custom credential blocks tailored to specific needs"
          />
          <FeatureCard
            icon={<FileCheck className="w-8 h-8 text-cyan-400" />}
            title="Verified Identity"
            description="Upload and verify your official documents securely"
          />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-cyan-500/50 transition-colors">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

export default LandingPage;
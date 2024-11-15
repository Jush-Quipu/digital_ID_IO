import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Upload from './pages/Upload';
import Vault from './pages/Vault';
import BlockEditor from './pages/BlockEditor';
import ShareBlock from './pages/ShareBlock';
import IssuerPortal from './pages/IssuerPortal';
import ClaimIdentity from './pages/ClaimIdentity';
import About from './pages/About';
import RoleGuard from './components/RoleGuard';
import { UserRole } from './utils/roleHelpers';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/vault" element={<Vault />} />
          <Route path="/editor" element={<BlockEditor />} />
          <Route path="/share" element={<ShareBlock />} />
          <Route path="/claim" element={<ClaimIdentity />} />
          <Route 
            path="/issuer" 
            element={
              <RoleGuard requiredRole={UserRole.ISSUER}>
                <IssuerPortal />
              </RoleGuard>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
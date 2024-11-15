import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';

interface Document {
  id: string;
  type: string;
  name: string;
  url: string;
  uploadedAt: string;
  verified: boolean;
}

const Vault = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/signup');
      return;
    }

    const q = query(collection(db, 'users', auth.currentUser.uid, 'documents'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Document[];
      
      setDocuments(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-[calc(100vh-4rem)] p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,183,255,0.15),transparent_50%)] cyberpunk-grid -z-10" />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Secure Document Vault
            </h1>
            <p className="text-gray-400 mt-2">
              Your verified documents are stored securely in blockchain-style blocks
            </p>
          </div>
          
          <button
            onClick={() => navigate('/upload')}
            className="btn-primary"
          >
            Upload New Document
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/50 rounded-lg border border-gray-700">
            <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">No Documents Yet</h3>
            <p className="text-gray-400 mb-4">Start by uploading your first document</p>
            <button
              onClick={() => navigate('/upload')}
              className="btn-primary"
            >
              Upload Document
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-gray-800/50 rounded-lg border border-gray-700 hover:border-cyan-500/50 transition-colors p-6 relative overflow-hidden group"
              >
                {/* Blockchain-style connection lines */}
                <div className="absolute -right-4 top-1/2 w-8 h-px bg-cyan-500/30 group-hover:bg-cyan-500/50 transition-colors" />
                <div className="absolute left-1/2 -bottom-4 w-px h-8 bg-cyan-500/30 group-hover:bg-cyan-500/50 transition-colors" />
                
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-white">{doc.name}</h3>
                  {doc.verified ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-400" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">
                    Type: {doc.type}
                  </p>
                  <p className="text-sm text-gray-400">
                    Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-400">
                    Status: {doc.verified ? 'Verified' : 'Pending Verification'}
                  </p>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => window.open(doc.url, '_blank')}
                    className="btn-primary text-sm py-1 px-3"
                  >
                    View Document
                  </button>
                  <button
                    onClick={() => navigate('/editor')}
                    className="text-sm py-1 px-3 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Create Block
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Vault;
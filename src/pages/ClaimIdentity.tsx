import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { Analytics } from '../utils/firebaseHelpers';

interface PendingIdentity {
  id: string;
  type: string;
  issuerEmail: string;
  issuedAt: string;
  expiresAt: string;
  metadata: {
    [key: string]: string;
  };
}

const ClaimIdentity = () => {
  const navigate = useNavigate();
  const [pendingIdentities, setPendingIdentities] = useState<PendingIdentity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/signup');
      return;
    }

    loadPendingIdentities();
  }, [navigate]);

  const loadPendingIdentities = async () => {
    try {
      const q = query(
        collection(db, 'issuedIdentities'),
        where('recipientEmail', '==', auth.currentUser?.email),
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(q);
      setPendingIdentities(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PendingIdentity[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (identityId: string) => {
    try {
      setLoading(true);
      
      // Update the issued identity status
      await updateDoc(doc(db, 'issuedIdentities', identityId), {
        status: 'claimed',
        claimedAt: new Date().toISOString(),
        claimedBy: auth.currentUser?.uid
      });

      // Add to user's vault
      const identity = pendingIdentities.find(i => i.id === identityId);
      await addDoc(collection(db, 'users', auth.currentUser!.uid, 'documents'), {
        type: identity?.type,
        issuer: identity?.issuerEmail,
        issuedAt: identity?.issuedAt,
        metadata: identity?.metadata,
        verified: true,
        createdAt: new Date().toISOString()
      });

      Analytics.logIdentityClaim(identity?.type || '');
      
      // Refresh the list
      await loadPendingIdentities();
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,183,255,0.15),transparent_50%)] cyberpunk-grid -z-10" />
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Claim Your Digital Identity
          </h1>
          <p className="text-gray-400 mt-2">
            Review and claim your pending digital identities
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-md mb-6">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pendingIdentities.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/50 rounded-lg border border-gray-700">
            <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">No Pending Identities</h3>
            <p className="text-gray-400">
              You don't have any digital identities to claim at the moment
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingIdentities.map((identity) => (
              <div
                key={identity.id}
                className="bg-gray-800/50 rounded-lg border border-gray-700 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {identity.type.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Issued by: {identity.issuerEmail}
                    </p>
                  </div>
                  <Shield className="w-5 h-5 text-cyan-400" />
                </div>

                <div className="space-y-3 mb-4">
                  {Object.entries(identity.metadata).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-sm text-gray-400">{key}</p>
                      <p className="text-sm font-medium">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div className="text-xs text-gray-400">
                    <p>Issued: {new Date(identity.issuedAt).toLocaleDateString()}</p>
                    <p>Expires: {new Date(identity.expiresAt).toLocaleDateString()}</p>
                  </div>
                  
                  <button
                    onClick={() => handleClaim(identity.id)}
                    disabled={loading}
                    className="btn-primary text-sm py-2"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Claim Identity
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

export default ClaimIdentity;
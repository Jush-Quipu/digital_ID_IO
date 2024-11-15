import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, UserPlus, Shield, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, addDoc, orderBy } from 'firebase/firestore';
import { Analytics } from '../utils/firebaseHelpers';

interface IssuedIdentity {
  id: string;
  type: string;
  recipientEmail: string;
  status: 'pending' | 'claimed';
  issuedAt: string;
  expiresAt: string;
  metadata: {
    [key: string]: string;
  };
}

const IDENTITY_TYPES = {
  'government-id': {
    name: 'Government ID',
    fields: ['Full Name', 'Date of Birth', 'ID Number', 'Issuing Authority']
  },
  'professional-license': {
    name: 'Professional License',
    fields: ['License Number', 'Profession', 'Issue Date', 'Valid Until']
  },
  'educational-credential': {
    name: 'Educational Credential',
    fields: ['Degree', 'Institution', 'Graduation Date', 'Student ID']
  },
  'employment-verification': {
    name: 'Employment Verification',
    fields: ['Company Name', 'Position', 'Start Date', 'Employee ID']
  }
};

const IssuerPortal = () => {
  const navigate = useNavigate();
  const [issuedIdentities, setIssuedIdentities] = useState<IssuedIdentity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    type: '',
    recipientEmail: '',
    metadata: {} as { [key: string]: string }
  });

  useEffect(() => {
    loadIssuedIdentities();
  }, []);

  const loadIssuedIdentities = async () => {
    try {
      const q = query(
        collection(db, 'issuedIdentities'),
        where('issuerEmail', '==', auth.currentUser?.email),
        orderBy('issuedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      setIssuedIdentities(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as IssuedIdentity[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (type: string) => {
    setFormData(prev => ({
      ...prev,
      type,
      metadata: IDENTITY_TYPES[type as keyof typeof IDENTITY_TYPES].fields.reduce(
        (acc, field) => ({ ...acc, [field]: '' }),
        {}
      )
    }));
  };

  const handleMetadataChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: { ...prev.metadata, [field]: value }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.type || !formData.recipientEmail) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      await addDoc(collection(db, 'issuedIdentities'), {
        type: formData.type,
        recipientEmail: formData.recipientEmail,
        issuerEmail: auth.currentUser?.email,
        metadata: formData.metadata,
        status: 'pending',
        issuedAt: new Date().toISOString(),
        expiresAt: expiryDate.toISOString()
      });

      Analytics.logIdentityIssuance(formData.type);
      
      setShowForm(false);
      setFormData({ type: '', recipientEmail: '', metadata: {} });
      loadIssuedIdentities();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredIdentities = issuedIdentities.filter(identity =>
    identity.recipientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    identity.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,183,255,0.15),transparent_50%)] cyberpunk-grid -z-10" />
      
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Identity Issuer Portal
            </h1>
            <p className="text-gray-400 mt-2">
              Issue and manage digital identities
            </p>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Issue New Identity
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-md mb-6">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {showForm && (
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Issue New Digital Identity</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Identity Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select type</option>
                  {Object.entries(IDENTITY_TYPES).map(([key, { name }]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={formData.recipientEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, recipientEmail: e.target.value }))}
                  className="input-field"
                  required
                  placeholder="Enter recipient's email"
                />
              </div>

              {formData.type && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Identity Details</h3>
                  {IDENTITY_TYPES[formData.type as keyof typeof IDENTITY_TYPES].fields.map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {field}
                      </label>
                      <input
                        type="text"
                        value={formData.metadata[field] || ''}
                        onChange={(e) => handleMetadataChange(field, e.target.value)}
                        className="input-field"
                        required
                        placeholder={`Enter ${field.toLowerCase()}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Issue Identity
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Issued Identities</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search identities..."
                className="pl-10 input-field w-64"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredIdentities.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-300 mb-2">No Identities Issued</h3>
              <p className="text-gray-400">
                Start by issuing a new digital identity
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredIdentities.map((identity) => (
                <div
                  key={identity.id}
                  className="flex items-center justify-between bg-gray-700/50 rounded-lg p-4"
                >
                  <div className="flex items-center gap-4">
                    <Shield className="w-8 h-8 text-cyan-400" />
                    <div>
                      <h3 className="font-medium">
                        {IDENTITY_TYPES[identity.type as keyof typeof IDENTITY_TYPES]?.name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Issued to: {identity.recipientEmail}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <p className="text-gray-400">
                        Issued: {new Date(identity.issuedAt).toLocaleDateString()}
                      </p>
                      <p className="text-gray-400">
                        Status: {identity.status === 'claimed' ? (
                          <span className="text-green-400">Claimed</span>
                        ) : (
                          <span className="text-yellow-400">Pending</span>
                        )}
                      </p>
                    </div>
                    {identity.status === 'claimed' && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssuerPortal;
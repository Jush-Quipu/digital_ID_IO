import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, Plus, X, Save, AlertCircle } from 'lucide-react';
import { collection, query, onSnapshot, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

interface Document {
  id: string;
  type: string;
  name: string;
  verified: boolean;
}

interface Field {
  id: string;
  docId: string;
  fieldName: string;
}

const BlockEditor = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedFields, setSelectedFields] = useState<Field[]>([]);
  const [blockName, setBlockName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      
      setDocuments(docs.filter(doc => doc.verified));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleAddField = (docId: string, fieldName: string) => {
    const newField: Field = {
      id: Math.random().toString(36).substr(2, 9),
      docId,
      fieldName
    };
    setSelectedFields(prev => [...prev, newField]);
  };

  const handleRemoveField = (fieldId: string) => {
    setSelectedFields(prev => prev.filter(field => field.id !== fieldId));
  };

  const handleSaveBlock = async () => {
    if (!blockName.trim()) {
      setError('Please enter a block name');
      return;
    }

    if (selectedFields.length === 0) {
      setError('Please select at least one field');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await addDoc(collection(db, 'users', auth.currentUser!.uid, 'blocks'), {
        name: blockName,
        fields: selectedFields,
        createdAt: new Date().toISOString()
      });

      navigate('/vault');
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  const getDocumentById = (id: string) => documents.find(doc => doc.id === id);

  return (
    <div className="min-h-[calc(100vh-4rem)] p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,183,255,0.15),transparent_50%)] cyberpunk-grid -z-10" />
      
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Create Custom Block
            </h1>
            <p className="text-gray-400 mt-2">
              Combine verified credentials into a custom block
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-md mb-6">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Block Name
            </label>
            <input
              type="text"
              value={blockName}
              onChange={(e) => setBlockName(e.target.value)}
              placeholder="Enter block name"
              className="input-field"
            />
          </div>

          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Selected Fields</h2>
            {selectedFields.length === 0 ? (
              <p className="text-gray-400 text-sm">No fields selected</p>
            ) : (
              <div className="space-y-2">
                {selectedFields.map((field) => {
                  const doc = getDocumentById(field.docId);
                  return (
                    <div
                      key={field.id}
                      className="flex items-center justify-between bg-gray-700/50 rounded-md p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{field.fieldName}</p>
                        <p className="text-xs text-gray-400">from {doc?.name}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveField(field.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Available Documents</h2>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : documents.length === 0 ? (
              <p className="text-gray-400 text-sm">No verified documents available</p>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="border border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">{doc.name}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {getFieldsForDocType(doc.type).map((field) => (
                        <button
                          key={field}
                          onClick={() => handleAddField(doc.id, field)}
                          className="flex items-center gap-2 text-sm py-2 px-3 rounded-md border border-gray-600 hover:bg-gray-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          {field}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleSaveBlock}
            disabled={saving}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Block
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to get available fields based on document type
const getFieldsForDocType = (type: string): string[] => {
  switch (type) {
    case 'drivers-license':
      return ['Full Name', 'License Number', 'Date of Birth', 'Address'];
    case 'social-security':
      return ['Full Name', 'SSN', 'Date of Birth'];
    case 'birth-certificate':
      return ['Full Name', 'Date of Birth', 'Place of Birth', 'Parents Names'];
    case 'passport':
      return ['Full Name', 'Passport Number', 'Date of Birth', 'Nationality'];
    default:
      return ['Full Name', 'Document Number', 'Date of Issue'];
  }
};

export default BlockEditor;
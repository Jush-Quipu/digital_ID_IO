import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, Lock, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { collection, query, onSnapshot, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

interface Block {
  id: string;
  name: string;
  fields: {
    id: string;
    docId: string;
    fieldName: string;
  }[];
  createdAt: string;
}

const ShareBlock = () => {
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string>('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [expiryHours, setExpiryHours] = useState('24');
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/signup');
      return;
    }

    const q = query(collection(db, 'users', auth.currentUser.uid, 'blocks'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const blockData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Block[];
      
      setBlocks(blockData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleShare = async () => {
    if (!selectedBlock) {
      setError('Please select a block to share');
      return;
    }

    if (!recipientEmail) {
      setError('Please enter recipient email');
      return;
    }

    setSharing(true);
    setError('');

    try {
      const block = blocks.find(b => b.id === selectedBlock);
      const shareDoc = await addDoc(collection(db, 'shares'), {
        blockId: selectedBlock,
        userId: auth.currentUser!.uid,
        recipientEmail,
        expiresAt: new Date(Date.now() + parseInt(expiryHours) * 60 * 60 * 1000).toISOString(),
        blockData: block,
        accessed: false,
        createdAt: new Date().toISOString()
      });

      const url = `${window.location.origin}/verify/${shareDoc.id}`;
      setShareUrl(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSharing(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,183,255,0.15),transparent_50%)] cyberpunk-grid -z-10" />
      
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Share Credential Block
          </h1>
          <p className="text-gray-400 mt-2">
            Securely share your verified credentials with others
          </p>
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
              Select Block
            </label>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="input-field"
            >
              <option value="">Choose a block</option>
              {blocks.map((block) => (
                <option key={block.id} value={block.id}>
                  {block.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Recipient Email
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="Enter recipient's email"
              className="input-field"
            />
          </div>

          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Expiry Time
            </label>
            <select
              value={expiryHours}
              onChange={(e) => setExpiryHours(e.target.value)}
              className="input-field"
            >
              <option value="24">24 hours</option>
              <option value="48">48 hours</option>
              <option value="72">72 hours</option>
              <option value="168">7 days</option>
            </select>
          </div>

          <button
            onClick={handleShare}
            disabled={sharing}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            {sharing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Share2 className="w-5 h-5" />
                Generate Share Link
              </>
            )}
          </button>

          {shareUrl && (
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 truncate font-mono text-sm bg-gray-900 rounded p-3">
                  {shareUrl}
                </div>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                >
                  {copied ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-400 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Link expires in {expiryHours} hours
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareBlock;
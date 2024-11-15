import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileText, Shield, AlertCircle } from 'lucide-react';
import { storage, db, auth } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';

const ACCEPTED_FILE_TYPES = {
  'image/jpeg': 'JPEG Image',
  'image/png': 'PNG Image',
  'image/gif': 'GIF Image',
  'application/pdf': 'PDF Document'
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const Upload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const validateFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size must be less than 5MB');
    }
    if (!ACCEPTED_FILE_TYPES[file.type as keyof typeof ACCEPTED_FILE_TYPES]) {
      throw new Error('Invalid file type. Please upload an image or PDF.');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      try {
        validateFile(selectedFile);
        setFile(selectedFile);
        
        if (selectedFile.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreview(reader.result as string);
          };
          reader.readAsDataURL(selectedFile);
        } else {
          setPreview('');
        }
      } catch (err: any) {
        setError(err.message);
        setFile(null);
        setPreview('');
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !auth.currentUser) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Create a unique filename
      const timestamp = Date.now();
      const fileName = `uploads/${auth.currentUser.uid}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);

      // Upload file to Firebase Storage
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          setError('Error uploading file. Please try again.');
          setUploading(false);
        },
        async () => {
          try {
            // Get the download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Save document metadata to Firestore
            await addDoc(collection(db, 'users', auth.currentUser.uid, 'documents'), {
              name: file.name,
              type: file.type,
              size: file.size,
              url: downloadURL,
              path: fileName,
              uploadedAt: new Date().toISOString(),
              status: 'pending'
            });

            navigate('/vault');
          } catch (err: any) {
            console.error('Firestore error:', err);
            setError('Error saving document metadata. Please try again.');
            setUploading(false);
          }
        }
      );
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="max-w-xl w-full space-y-8 bg-gray-800/50 p-8 rounded-xl border border-cyan-500/30">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-cyan-400" />
          <h2 className="mt-6 text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Upload Document
          </h2>
          <p className="mt-2 text-gray-400">
            Select a file to upload to your secure vault
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-md">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${file ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-gray-700 hover:border-gray-600'}
          `}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept={Object.keys(ACCEPTED_FILE_TYPES).join(',')}
            className="hidden"
          />
          
          {preview ? (
            <div className="space-y-4">
              <img
                src={preview}
                alt="File preview"
                className="max-h-48 mx-auto rounded-lg"
              />
              <p className="text-sm text-gray-400">Click to change file</p>
            </div>
          ) : (
            <div className="space-y-2">
              <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="text-sm text-gray-400">
                <p className="font-semibold">Click to upload</p>
                <p>or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                Supported formats: Images (JPEG, PNG, GIF), PDF
              </p>
              <p className="text-xs text-gray-500">
                Maximum file size: 5MB
              </p>
            </div>
          )}
        </div>

        {file && (
          <div className="space-y-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-gray-400">
                {ACCEPTED_FILE_TYPES[file.type as keyof typeof ACCEPTED_FILE_TYPES]} • {(file.size / 1024 / 1024).toFixed(2)}MB
              </p>
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 text-center">
                  Uploading... {Math.round(progress)}%
                </p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <FileText className="w-5 h-5" />
              Upload Document
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Upload;
import React, { useState, useCallback } from 'react';
import { Upload as UploadIcon } from 'lucide-react';

interface DragAndDropProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
}

const DragAndDrop: React.FC<DragAndDropProps> = ({
  onFileSelect,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024 // 5MB
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];

    if (file && file.size <= maxSize && file.type.match(accept)) {
      onFileSelect(file);
    }
  }, [onFileSelect, accept, maxSize]);

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
        ${isDragging ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-700 hover:border-gray-600'}
      `}
    >
      <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
      <div className="mt-4 text-sm text-gray-400">
        <p className="font-semibold">Drop your file here</p>
        <p>or click to browse</p>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        PNG, JPG up to 5MB
      </p>
    </div>
  );
};

export default DragAndDrop;
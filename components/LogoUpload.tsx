'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useStore } from '@/store/useStore';
import toast from 'react-hot-toast';

export default function LogoUpload() {
  const { getCurrentFloorplan, updateFloorplan } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const floorplan = getCurrentFloorplan();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !floorplan) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        updateFloorplan(floorplan.id, {
          logo: base64,
        });
        toast.success('Logo uploaded');
        setIsUploading(false);
      };
      reader.onerror = () => {
        toast.error('Failed to read image');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to upload logo');
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    if (!floorplan) return;
    updateFloorplan(floorplan.id, {
      logo: undefined,
    });
    toast.success('Logo removed');
  };

  if (!floorplan) return null;

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Logo
        </label>
        {floorplan.logo && (
          <button
            onClick={handleRemove}
            className="text-red-600 hover:text-red-700 text-sm"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {floorplan.logo ? (
        <div className="relative">
          <img
            src={floorplan.logo}
            alt="Logo"
            className="w-full h-24 object-contain border border-gray-200 rounded"
          />
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-500 transition-colors disabled:opacity-50"
        >
          <Upload className="w-5 h-5 mx-auto mb-2 text-gray-400" />
          <span className="text-sm text-gray-600">
            {isUploading ? 'Uploading...' : 'Upload Logo'}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </button>
      )}
    </div>
  );
}


'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useStore } from '@/store/useStore';
import toast from 'react-hot-toast';

export default function BackgroundImageUpload() {
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
          baseImage: base64,
        });
        toast.success('Background image uploaded');
        setIsUploading(false);
        // Trigger canvas refresh without page reload
        const event = new CustomEvent('backgroundImageUpdated', { detail: { base64 } });
        window.dispatchEvent(event);
      };
      reader.onerror = () => {
        toast.error('Failed to read image');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to upload image');
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    if (!floorplan) return;
    updateFloorplan(floorplan.id, {
      baseImage: undefined,
    });
    toast.success('Background image removed');
    // Trigger canvas refresh without page reload
    const event = new CustomEvent('backgroundImageUpdated', { detail: { base64: null } });
    window.dispatchEvent(event);
  };

  if (!floorplan) return null;

  return (
    <div className="p-4 border-b border-neutral-200">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Background Image
        </label>
        {floorplan.baseImage && (
          <button
            onClick={handleRemove}
            className="text-accent-terracotta hover:text-accent-terracotta/80 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent-terracotta/50 rounded"
            aria-label="Remove background image"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {floorplan.baseImage ? (
        <div className="relative">
          <img
            src={floorplan.baseImage}
            alt="Background"
            className="w-full h-32 object-contain border border-neutral-200 rounded-boho"
          />
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full border-2 border-dashed border-neutral-300 rounded-boho-lg p-4 text-center hover:border-charcoal transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-charcoal-400 focus:ring-offset-2"
          aria-label="Upload background image"
        >
          <Upload className="w-5 h-5 mx-auto mb-2 text-neutral-400" />
          <span className="text-sm text-neutral-600">
            {isUploading ? 'Uploading...' : 'Upload Background Image'}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Background image file input"
          />
        </button>
      )}
    </div>
  );
}


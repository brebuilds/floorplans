'use client';

import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  zoomLevel: number;
}

export default function ZoomControls({ onZoomIn, onZoomOut, onResetZoom, zoomLevel }: ZoomControlsProps) {
  return (
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
      <button
        onClick={onZoomOut}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title="Zoom Out (Ctrl+-)"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      <span className="px-3 py-1 text-sm font-medium text-gray-700 min-w-[60px] text-center">
        {Math.round(zoomLevel * 100)}%
      </span>
      <button
        onClick={onZoomIn}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title="Zoom In (Ctrl++)"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1" />
      <button
        onClick={onResetZoom}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title="Reset Zoom (Ctrl+0)"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
    </div>
  );
}


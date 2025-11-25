'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, FileImage, FileText, File, Eye } from 'lucide-react';
import { useStore } from '@/store/useStore';
import toast from 'react-hot-toast';

interface ExportMenuProps {
  onClose?: () => void;
  onShowPreview?: () => void;
}

export default function ExportMenu({ onClose, onShowPreview }: ExportMenuProps) {
  const { getCurrentFloorplan } = useStore();
  const [isExporting, setIsExporting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const floorplan = getCurrentFloorplan();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const getCanvas = (): HTMLCanvasElement | null => {
    // Find the fabric canvas element
    const canvas = document.querySelector('canvas');
    return canvas || null;
  };

  const exportPNG = async () => {
    if (!floorplan) return;
    setIsExporting(true);
    
    try {
      const fabricCanvas = (window as any).fabricCanvas;
      if (!fabricCanvas) {
        toast.error('Canvas not found');
        return;
      }

      const dataURL = fabricCanvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2, // Higher resolution
      });
      
      const link = document.createElement('a');
      link.download = `${floorplan.metadata.floorplanType || 'floorplan'}.png`;
      link.href = dataURL;
      link.click();
      toast.success('Exported as PNG');
      onClose?.();
    } catch (error) {
      toast.error('Failed to export PNG');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportSVG = async () => {
    if (!floorplan) return;
    setIsExporting(true);
    
    try {
      // Create SVG manually from floorplan data
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">`;
      
      // Add background if exists
      if (floorplan.baseImage) {
        svg += `<image href="${floorplan.baseImage}" width="1200" height="800"/>`;
      }
      
      // Add walls
      floorplan.walls.forEach((wall) => {
        svg += `<line x1="${wall.x1}" y1="${wall.y1}" x2="${wall.x2}" y2="${wall.y2}" stroke="#000" stroke-width="${wall.thickness || 3}"/>`;
      });
      
      // Add rooms
      floorplan.rooms.forEach((room) => {
        svg += `<rect x="${room.x}" y="${room.y}" width="${room.width}" height="${room.height}" fill="rgba(99, 102, 241, 0.1)" stroke="#6366f1" stroke-width="2"/>`;
        svg += `<text x="${room.x + 10}" y="${room.y + 20}" fill="#6366f1" font-size="14">${room.name}</text>`;
      });
      
      // Add doors
      floorplan.doors.forEach((door) => {
        svg += `<rect x="${door.x - (door.width || 30) / 2}" y="${door.y - 2.5}" width="${door.width || 30}" height="5" fill="#8B4513" stroke="#000"/>`;
      });
      
      // Add windows
      floorplan.windows.forEach((window) => {
        svg += `<rect x="${window.x}" y="${window.y}" width="${window.width}" height="10" fill="#87CEEB" stroke="#000"/>`;
      });
      
      // Add labels
      floorplan.labels.forEach((label) => {
        svg += `<text x="${label.x}" y="${label.y}" fill="#000" font-size="${label.fontSize || 16}">${label.text}</text>`;
      });
      
      svg += `</svg>`;
      
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${floorplan.metadata.floorplanType || 'floorplan'}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Exported as SVG');
      onClose?.();
    } catch (error) {
      toast.error('Failed to export SVG');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportPDF = async () => {
    if (!floorplan) return;
    setIsExporting(true);
    
    try {
      const { jsPDF } = await import('jspdf');
      const canvas = getCanvas();
      if (!canvas) {
        toast.error('Canvas not found');
        return;
      }

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${floorplan.metadata.floorplanType || 'floorplan'}.pdf`);
      toast.success('Exported as PDF');
      onClose?.();
    } catch (error) {
      toast.error('Failed to export PDF');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-full mt-2 panel p-2 z-50 min-w-[180px]"
    >
      {onShowPreview && (
        <button
          onClick={() => {
            onShowPreview();
            onClose?.();
          }}
          className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-neutral-100 rounded-boho transition-colors"
          aria-label="Print preview"
        >
          <Eye className="w-4 h-4" />
          Print Preview
        </button>
      )}
      <button
        onClick={exportPNG}
        disabled={isExporting}
        className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-neutral-100 rounded-boho transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-charcoal-400"
        aria-label="Export as PNG"
      >
        <FileImage className="w-4 h-4" />
        Export as PNG
      </button>
      <button
        onClick={exportSVG}
        disabled={isExporting}
        className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-neutral-100 rounded-boho transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-charcoal-400"
        aria-label="Export as SVG"
      >
        <File className="w-4 h-4" />
        Export as SVG
      </button>
      <button
        onClick={exportPDF}
        disabled={isExporting}
        className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-neutral-100 rounded-boho transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-charcoal-400"
        aria-label="Export as PDF"
      >
        <FileText className="w-4 h-4" />
        Export as PDF
      </button>
    </div>
  );
}


'use client';

import { useState, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { X, Download, FileText, Printer } from 'lucide-react';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

interface PrintPreviewProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrintPreview({ isOpen, onClose }: PrintPreviewProps) {
  const { getCurrentFloorplan } = useStore();
  const [scale, setScale] = useState(100);
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const previewRef = useRef<HTMLDivElement>(null);
  const floorplan = getCurrentFloorplan();

  if (!isOpen || !floorplan) return null;

  const handleExportPDF = async () => {
    try {
      const fabricCanvas = (window as any).fabricCanvas;
      if (!fabricCanvas) {
        toast.error('Canvas not found');
        return;
      }

      const dataURL = fabricCanvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: Math.max(scale / 100, 0.5), // Ensure minimum quality
      });

      const pdf = new jsPDF({
        orientation,
        unit: 'px',
        format: orientation === 'landscape' ? [1200, 800] : [800, 1200],
      });

      pdf.addImage(dataURL, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
      
      // Add metadata
      pdf.setFontSize(12);
      pdf.setTextColor(54, 69, 79);
      const metadataY = orientation === 'landscape' ? 780 : 1180;
      if (floorplan.metadata.floorplanType) {
        pdf.text(`Type: ${floorplan.metadata.floorplanType}`, 20, metadataY);
      }
      if (floorplan.metadata.bedrooms) {
        pdf.text(`${floorplan.metadata.bedrooms} Bed`, 200, metadataY);
      }
      if (floorplan.metadata.bathrooms) {
        pdf.text(`${floorplan.metadata.bathrooms} Bath`, 300, metadataY);
      }

      pdf.save(`${floorplan.metadata.floorplanType || 'floorplan'}.pdf`);
      toast.success('Exported as PDF');
      onClose();
    } catch (error) {
      toast.error('Failed to export PDF');
      console.error(error);
    }
  };

  // Load canvas into preview on mount/update
  React.useEffect(() => {
    if (!isOpen) return;
    
    const fabricCanvas = (window as any).fabricCanvas;
    const previewCanvas = document.getElementById('preview-canvas') as HTMLCanvasElement;
    
    if (fabricCanvas && previewCanvas) {
      const ctx = previewCanvas.getContext('2d');
      if (ctx) {
        const dataURL = fabricCanvas.toDataURL({
          format: 'png',
          quality: 1,
          multiplier: 1,
        });
        
        const img = new Image();
        img.onload = () => {
          previewCanvas.width = img.width;
          previewCanvas.height = img.height;
          ctx.drawImage(img, 0, 0);
        };
        img.src = dataURL;
      }
    }
  }, [isOpen, scale, orientation]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print');
      return;
    }

    const fabricCanvas = (window as any).fabricCanvas;
    if (!fabricCanvas) {
      toast.error('Canvas not found');
      return;
    }

    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: scale / 100,
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>${floorplan.metadata.floorplanType || 'Floorplan'}</title>
          <style>
            body { margin: 0; padding: 20px; text-align: center; }
            img { max-width: 100%; height: auto; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h1>${floorplan.metadata.floorplanType || 'Floorplan'}</h1>
          <img src="${dataURL}" alt="Floorplan" />
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-charcoal-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="card max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <h2 className="text-xl font-serif font-semibold text-neutral-900">Print Preview</h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-charcoal-400 rounded"
            aria-label="Close preview"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="mb-4 flex gap-4 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-neutral-700">Scale:</label>
              <input
                type="range"
                min="50"
                max="200"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-32"
              />
              <span className="text-sm text-neutral-600 w-12">{scale}%</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-neutral-700">Orientation:</label>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as 'landscape' | 'portrait')}
                className="input text-sm"
              >
                <option value="landscape">Landscape</option>
                <option value="portrait">Portrait</option>
              </select>
            </div>
          </div>

          <div
            ref={previewRef}
            className="bg-white border-2 border-neutral-200 rounded-boho-lg p-4 overflow-auto flex items-center justify-center"
            style={{
              minHeight: '400px',
            }}
          >
            <div className="relative bg-neutral-50 rounded-boho p-2">
              <div
                style={{
                  transform: `scale(${scale / 100})`,
                  transformOrigin: 'center',
                  width: orientation === 'landscape' ? '1200px' : '800px',
                  height: orientation === 'landscape' ? '800px' : '1200px',
                }}
              >
                <canvas
                  id="preview-canvas"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: '1px solid #d4cfc7',
                    borderRadius: '0.5rem',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-neutral-200 bg-neutral-50">
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button
            onClick={handlePrint}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
            aria-label="Print"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handleExportPDF}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
            aria-label="Export PDF"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}


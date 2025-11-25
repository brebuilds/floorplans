'use client';

import { useState, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { FileText, Image as ImageIcon, Type, Download, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';

interface DocumentElement {
  id: string;
  type: 'text' | 'image';
  content: string; // text content or image base64
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

export default function PrintReadyDocument() {
  const { getCurrentFloorplan } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [elements, setElements] = useState<DocumentElement[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingElement, setEditingElement] = useState<DocumentElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const floorplan = getCurrentFloorplan();

  if (!floorplan) return null;

  const handleAddText = () => {
    const newElement: DocumentElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'New Text',
      x: 50,
      y: 50,
      fontSize: 16,
      fontFamily: 'Arial',
      color: '#000000',
    };
    setElements([...elements, newElement]);
    setEditingElement(newElement);
    setIsEditing(true);
  };

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newElement: DocumentElement = {
        id: `image-${Date.now()}`,
        type: 'image',
        content: reader.result as string,
        x: 50,
        y: 100,
        width: 200,
        height: 150,
      };
      setElements([...elements, newElement]);
    };
    reader.readAsDataURL(file);
  };

  const handleExportPDF = async () => {
    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1200, 800],
      });

      // Add floorplan
      const fabricCanvas = (window as any).fabricCanvas;
      if (fabricCanvas) {
        const floorplanDataURL = fabricCanvas.toDataURL({
          format: 'png',
          quality: 1,
          multiplier: 2,
        });
        pdf.addImage(floorplanDataURL, 'PNG', 0, 0, 1200, 800);
      }

      // Add logo if exists
      if (floorplan.logo) {
        pdf.addImage(floorplan.logo, 'PNG', 20, 20, 80, 40);
      }

      // Add text elements
      elements.filter(e => e.type === 'text').forEach((element) => {
        pdf.setFontSize(element.fontSize || 16);
        pdf.setTextColor(element.color || '#000000');
        pdf.text(element.content, element.x, element.y);
      });

      // Add image elements
      elements.filter(e => e.type === 'image').forEach((element) => {
        pdf.addImage(
          element.content,
          'PNG',
          element.x,
          element.y,
          element.width || 200,
          element.height || 150
        );
      });

      // Add metadata
      const metadataY = 750;
      pdf.setFontSize(12);
      pdf.setTextColor('#666666');
      if (floorplan.metadata.floorplanType) {
        pdf.text(`Type: ${floorplan.metadata.floorplanType}`, 20, metadataY);
      }
      if (floorplan.metadata.bedrooms) {
        pdf.text(`${floorplan.metadata.bedrooms} Bed`, 200, metadataY);
      }
      if (floorplan.metadata.bathrooms) {
        pdf.text(`${floorplan.metadata.bathrooms} Bath`, 300, metadataY);
      }
      if (floorplan.metadata.squareFootage) {
        pdf.text(`${floorplan.metadata.squareFootage} sq ft`, 400, metadataY);
      }

      pdf.save(`${floorplan.metadata.floorplanType || 'floorplan'}-marketing.pdf`);
      toast.success('Marketing document exported!');
    } catch (error) {
      toast.error('Failed to export PDF');
      console.error(error);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
      >
        <FileText className="w-4 h-4" />
        Create Marketing Doc
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Create Marketing Document</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="mb-4 flex gap-2">
            <button
              onClick={handleAddText}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Type className="w-4 h-4" />
              Add Text
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <ImageIcon className="w-4 h-4" />
              Add Image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAddImage}
              className="hidden"
            />
          </div>

          <div className="bg-gray-100 rounded-lg p-4 mb-4 relative" style={{ width: '1200px', height: '800px' }}>
            {/* Preview area */}
            {elements.map((element) => (
              <div
                key={element.id}
                onClick={() => {
                  setEditingElement(element);
                  setIsEditing(true);
                }}
                className="absolute border-2 border-dashed border-transparent hover:border-indigo-500 cursor-move"
                style={{
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  width: element.width ? `${element.width}px` : 'auto',
                  height: element.height ? `${element.height}px` : 'auto',
                }}
              >
                {element.type === 'text' ? (
                  <div
                    style={{
                      fontSize: `${element.fontSize || 16}px`,
                      color: element.color || '#000000',
                      fontFamily: element.fontFamily || 'Arial',
                    }}
                  >
                    {element.content}
                  </div>
                ) : (
                  <img
                    src={element.content}
                    alt="Document image"
                    style={{
                      width: element.width ? `${element.width}px` : '200px',
                      height: element.height ? `${element.height}px` : '150px',
                      objectFit: 'contain',
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {isEditing && editingElement && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Edit Element</h3>
              {editingElement.type === 'text' ? (
                <div className="space-y-3">
                  <textarea
                    value={editingElement.content}
                    onChange={(e) => {
                      setEditingElement({ ...editingElement, content: e.target.value });
                      setElements(elements.map(el => el.id === editingElement.id ? { ...editingElement, content: e.target.value } : el));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={editingElement.fontSize || 16}
                      onChange={(e) => {
                        const updated = { ...editingElement, fontSize: parseInt(e.target.value) || 16 };
                        setEditingElement(updated);
                        setElements(elements.map(el => el.id === editingElement.id ? updated : el));
                      }}
                      placeholder="Font Size"
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="color"
                      value={editingElement.color || '#000000'}
                      onChange={(e) => {
                        const updated = { ...editingElement, color: e.target.value };
                        setEditingElement(updated);
                        setElements(elements.map(el => el.id === editingElement.id ? updated : el));
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={editingElement.width || 200}
                      onChange={(e) => {
                        const updated = { ...editingElement, width: parseInt(e.target.value) || 200 };
                        setEditingElement(updated);
                        setElements(elements.map(el => el.id === editingElement.id ? updated : el));
                      }}
                      placeholder="Width"
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      value={editingElement.height || 150}
                      onChange={(e) => {
                        const updated = { ...editingElement, height: parseInt(e.target.value) || 150 };
                        setEditingElement(updated);
                        setElements(elements.map(el => el.id === editingElement.id ? updated : el));
                      }}
                      placeholder="Height"
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              )}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditingElement(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Done
                </button>
                <button
                  onClick={() => {
                    setElements(elements.filter(el => el.id !== editingElement.id));
                    setIsEditing(false);
                    setEditingElement(null);
                  }}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => setIsOpen(false)}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExportPDF}
            className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}


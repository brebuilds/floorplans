'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { ToolType, Floorplan } from '@/types';
import {
  ArrowLeft,
  Save,
  Download,
  Undo,
  Redo,
  Grid,
  MousePointer,
  Minus,
  Square,
  DoorOpen,
  SquareStack,
  Type,
  Pencil,
  Eraser,
  Sparkles,
  Loader2,
  Copy,
  HelpCircle,
  Clock,
  Printer,
} from 'lucide-react';
import DrawingCanvas from './DrawingCanvas';
import MetadataPanel from './MetadataPanel';
import ExportMenu from './ExportMenu';
import BackgroundImageUpload from './BackgroundImageUpload';
import ZoomControls from './ZoomControls';
import FurnitureLibrary from './FurnitureLibrary';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';
import PrintReadyDocument from './PrintReadyDocument';
import PrintPreview from './PrintPreview';
import VersionHistory from './VersionHistory';
import PropertiesPanel from './PropertiesPanel';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import toast from 'react-hot-toast';
import { cleanupImage, canvasToBase64 } from '@/lib/services/aiService';

export default function FloorplanEditor() {
  const {
    currentFloorplanId,
    getCurrentFloorplan,
    updateFloorplan,
    setCurrentFloorplan,
    editorState,
    setEditorTool,
    setEditorState,
  } = useStore();
  
  const { canUndo, canRedo, undo, redo } = useHistoryStore();
  const floorplan = getCurrentFloorplan();
  const [showMetadata, setShowMetadata] = useState(true);
  const [isCleaning, setIsCleaning] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showFurniture, setShowFurniture] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedFurniture, setSelectedFurniture] = useState<any>(null);

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  if (!floorplan) {
    return <div>No floorplan selected</div>;
  }

  const tools: { id: ToolType; icon: React.ReactNode; label: string }[] = [
    { id: 'select', icon: <MousePointer className="w-5 h-5" />, label: 'Select' },
    { id: 'line', icon: <Minus className="w-5 h-5" />, label: 'Wall' },
    { id: 'rectangle', icon: <Square className="w-5 h-5" />, label: 'Room' },
    { id: 'door', icon: <DoorOpen className="w-5 h-5" />, label: 'Door' },
    { id: 'window', icon: <SquareStack className="w-5 h-5" />, label: 'Window' },
    { id: 'label', icon: <Type className="w-5 h-5" />, label: 'Label' },
    { id: 'measure', icon: <Minus className="w-5 h-5" />, label: 'Measure' },
    { id: 'pencil', icon: <Pencil className="w-5 h-5" />, label: 'Draw' },
    { id: 'eraser', icon: <Eraser className="w-5 h-5" />, label: 'Erase' },
  ];

  const handleSave = () => {
    updateFloorplan(floorplan.id, {
      updatedAt: new Date().toISOString(),
    });
    toast.success('Saved!');
  };

  const handleUndo = () => {
    if (!floorplan) return;
    const restored = undo(floorplan.id);
    if (restored) {
      updateFloorplan(floorplan.id, restored);
      toast.success('Undone');
    }
  };

  const handleRedo = () => {
    if (!floorplan) return;
    const restored = redo(floorplan.id);
    if (restored) {
      updateFloorplan(floorplan.id, restored);
      toast.success('Redone');
    }
  };

  const handleCleanup = async () => {
    if (!floorplan) return;
    setIsCleaning(true);
    toast.loading('Cleaning floorplan...', { id: 'cleanup' });
    
    try {
      // Get canvas image
      const fabricCanvas = (window as any).fabricCanvas;
      if (!fabricCanvas) {
        toast.error('Canvas not available', { id: 'cleanup' });
        setIsCleaning(false);
        return;
      }

      // Convert canvas to base64
      const canvasElement = fabricCanvas.getElement();
      const imageBase64 = canvasToBase64(canvasElement);

      // Call AI cleanup service
      const result = await cleanupImage(imageBase64, 'floorplan');

      if (!result.success) {
        toast.error(result.error || 'Failed to cleanup floorplan', { id: 'cleanup' });
        setIsCleaning(false);
        return;
      }

      // TODO: Parse the description and apply changes to canvas
      // For now, we'll just show success
      // In a full implementation, you would:
      // 1. Parse the AI description
      // 2. Generate SVG or structured data
      // 3. Apply changes to the canvas
      
      toast.success('Floorplan cleaned! Check the description for details.', { id: 'cleanup' });
      console.log('Cleanup description:', result.description);
      
      setIsCleaning(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to cleanup floorplan', { id: 'cleanup' });
      setIsCleaning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentFloorplan('')}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-800">
              {floorplan.metadata.floorplanType || 'Untitled Floorplan'}
            </h1>
            <p className="text-xs text-gray-500">
              {floorplan.metadata.floorNumber && `Floor ${floorplan.metadata.floorNumber} • `}
              {floorplan.metadata.bedrooms && `${floorplan.metadata.bedrooms} bed • `}
              {floorplan.metadata.bathrooms && `${floorplan.metadata.bathrooms} bath`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={!canUndo(floorplan.id)}
            className={`p-2 rounded-boho transition-colors focus:outline-none focus:ring-2 focus:ring-charcoal-400 ${
              canUndo(floorplan.id)
                ? 'text-neutral-600 hover:bg-neutral-100'
                : 'text-neutral-300 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <Undo className="w-5 h-5" />
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo(floorplan.id)}
            className={`p-2 rounded-boho transition-colors focus:outline-none focus:ring-2 focus:ring-charcoal-400 ${
              canRedo(floorplan.id)
                ? 'text-neutral-600 hover:bg-neutral-100'
                : 'text-neutral-300 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Shift+Z)"
            aria-label="Redo"
          >
            <Redo className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-neutral-300" />
          <button
            onClick={() => setEditorState({ showGrid: !editorState.showGrid })}
            className={`p-2 rounded-boho transition-colors focus:outline-none focus:ring-2 focus:ring-charcoal-400 ${
              editorState.showGrid ? 'bg-charcoal-100 text-charcoal-700' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
            title="Toggle Grid (G)"
            aria-label="Toggle grid"
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setEditorState({ snapToGrid: !editorState.snapToGrid })}
            className={`p-2 rounded-boho transition-colors focus:outline-none focus:ring-2 focus:ring-charcoal-400 ${
              editorState.snapToGrid ? 'bg-charcoal-100 text-charcoal-700' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
            title="Snap to Grid (S)"
            aria-label="Toggle snap to grid"
          >
            Snap
          </button>
          <ZoomControls
            onZoomIn={() => {
              const zoomIn = (window as any).canvasZoom?.zoomIn;
              if (zoomIn) zoomIn();
            }}
            onZoomOut={() => {
              const zoomOut = (window as any).canvasZoom?.zoomOut;
              if (zoomOut) zoomOut();
            }}
            onResetZoom={() => {
              const reset = (window as any).canvasZoom?.reset;
              if (reset) reset();
            }}
            zoomLevel={zoomLevel}
          />
          <button
            onClick={() => setShowShortcuts(true)}
            className="p-2 rounded-boho text-neutral-600 hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-charcoal-400"
            title="Keyboard Shortcuts (Ctrl+/)"
            aria-label="Show keyboard shortcuts"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowFurniture(!showFurniture)}
            className={`p-2 rounded-boho transition-colors focus:outline-none focus:ring-2 focus:ring-charcoal-400 ${
              showFurniture ? 'bg-charcoal-100 text-charcoal-700' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
            title="Toggle Furniture Library"
            aria-label="Toggle furniture library"
          >
            <Square className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-neutral-300" />
          <button
            onClick={handleCleanup}
            disabled={isCleaning}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
            aria-label="Clean up floorplan"
          >
            {isCleaning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Cleanup
          </button>
          <button
            onClick={handleSave}
            className="bg-accent-sage text-white px-4 py-2 rounded-boho hover:bg-accent-sage/90 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent-sage/50"
            title="Save (Ctrl+S)"
            aria-label="Save floorplan"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="btn-secondary flex items-center gap-2"
              title="Export (Ctrl+E)"
              aria-label="Export menu"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            {showExportMenu && (
              <ExportMenu 
                onClose={() => setShowExportMenu(false)}
                onShowPreview={() => {
                  setShowExportMenu(false);
                  setShowPrintPreview(true);
                }}
              />
            )}
          </div>
          <button
            onClick={() => setShowPrintPreview(true)}
            className="btn-secondary flex items-center gap-2"
            title="Print Preview"
            aria-label="Print preview"
          >
            <Printer className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={() => setShowVersionHistory(true)}
            className="btn-ghost flex items-center gap-2"
            title="Version History"
            aria-label="View version history"
          >
            <Clock className="w-4 h-4" />
          </button>
          <PrintReadyDocument />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Furniture Library */}
        {showFurniture && (
          <FurnitureLibrary
            onSelectFurniture={(item) => {
              setSelectedFurniture(item);
              setEditorTool('select');
              // Furniture will be placed on canvas click
            }}
          />
        )}
        
        {/* Left Toolbar */}
        <div className="bg-white border-r border-gray-200 p-3 w-20 flex flex-col items-center gap-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setEditorTool(tool.id)}
              className={`p-3 rounded-lg transition-colors ${
                editorState.currentTool === tool.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={tool.label}
            >
              {tool.icon}
            </button>
          ))}
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          <DrawingCanvas 
            floorplan={floorplan} 
            zoomLevel={zoomLevel}
            onZoomChange={setZoomLevel}
            onFurnitureSelect={selectedFurniture}
          />
        </div>

        {/* Right Panel - Metadata or Properties */}
        {selectedObject ? (
          <PropertiesPanel
            selectedObject={selectedObject}
            onClose={() => setSelectedObject(null)}
          />
        ) : showMetadata ? (
          <div className="w-80 bg-white border-l border-neutral-200 overflow-y-auto flex flex-col">
            <BackgroundImageUpload />
            <MetadataPanel floorplan={floorplan} />
          </div>
        ) : null}
      </div>

      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
}


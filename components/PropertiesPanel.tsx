'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { X, RotateCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface PropertiesPanelProps {
  selectedObject: any;
  onClose: () => void;
}

export default function PropertiesPanel({ selectedObject, onClose }: PropertiesPanelProps) {
  const { getCurrentFloorplan, updateFloorplan } = useStore();
  const [properties, setProperties] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
    swing: 'left',
  });

  const floorplan = getCurrentFloorplan();

  useEffect(() => {
    if (selectedObject) {
      const fabricObj = selectedObject;
      setProperties({
        x: Math.round(fabricObj.left || 0),
        y: Math.round(fabricObj.top || 0),
        width: Math.round(fabricObj.width || 0),
        height: Math.round(fabricObj.height || 0),
        rotation: Math.round(fabricObj.angle || 0),
        swing: (fabricObj as any).doorSwing || 'left',
      });
    }
  }, [selectedObject]);

  const handleUpdate = () => {
    if (!selectedObject || !floorplan) return;

    const fabricCanvas = (window as any).fabricCanvas;
    if (!fabricCanvas) return;

    const obj = selectedObject;
    obj.set({
      left: properties.x,
      top: properties.y,
      width: properties.width,
      height: properties.height,
      angle: properties.rotation,
    });

    if ((obj as any).doorSwing !== undefined) {
      (obj as any).doorSwing = properties.swing;
    }

    fabricCanvas.renderAll();
    toast.success('Properties updated');
  };

  const handleDelete = () => {
    if (!selectedObject || !floorplan) return;

    const fabricCanvas = (window as any).fabricCanvas;
    if (!fabricCanvas) return;

    const elementId = (selectedObject as any).elementId;
    if (elementId) {
      // Delete from floorplan data
      const currentFloorplan = useStore.getState().getCurrentFloorplan();
      if (currentFloorplan) {
        const updates: any = {};
        
        if (elementId.startsWith('wall-')) {
          updates.walls = currentFloorplan.walls.filter(w => w.id !== elementId);
        } else if (elementId.startsWith('room-')) {
          updates.rooms = currentFloorplan.rooms.filter(r => r.id !== elementId);
        } else if (elementId.startsWith('door-')) {
          updates.doors = currentFloorplan.doors.filter(d => d.id !== elementId);
        } else if (elementId.startsWith('window-')) {
          updates.windows = currentFloorplan.windows.filter(w => w.id !== elementId);
        } else if (elementId.startsWith('label-')) {
          updates.labels = currentFloorplan.labels.filter(l => l.id !== elementId);
        } else if (elementId.startsWith('furniture-')) {
          updates.furniture = (currentFloorplan.furniture || []).filter(f => f.id !== elementId);
        }

        updateFloorplan(currentFloorplan.id, updates);
      }
    }

    fabricCanvas.remove(selectedObject);
    fabricCanvas.renderAll();
    toast.success('Deleted');
    onClose();
  };

  if (!selectedObject) return null;

  const elementType = (selectedObject as any).elementType || 'unknown';

  return (
    <div className="w-80 bg-white border-l border-neutral-200 overflow-y-auto">
      <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
        <h3 className="text-lg font-serif font-semibold text-neutral-900">
          Properties
        </h3>
        <button
          onClick={onClose}
          className="text-neutral-500 hover:text-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-charcoal-400 rounded"
          aria-label="Close properties panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Type
          </label>
          <p className="text-sm text-neutral-600 capitalize">{elementType}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              X Position
            </label>
            <input
              type="number"
              value={properties.x}
              onChange={(e) => setProperties({ ...properties, x: Number(e.target.value) })}
              className="input text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Y Position
            </label>
            <input
              type="number"
              value={properties.y}
              onChange={(e) => setProperties({ ...properties, y: Number(e.target.value) })}
              className="input text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Width
            </label>
            <input
              type="number"
              value={properties.width}
              onChange={(e) => setProperties({ ...properties, width: Number(e.target.value) })}
              className="input text-sm"
              disabled={elementType === 'wall' || elementType === 'label'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Height
            </label>
            <input
              type="number"
              value={properties.height}
              onChange={(e) => setProperties({ ...properties, height: Number(e.target.value) })}
              className="input text-sm"
              disabled={elementType === 'wall' || elementType === 'label'}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Rotation
          </label>
          <div className="flex gap-2">
            <input
              type="range"
              min="0"
              max="360"
              value={properties.rotation}
              onChange={(e) => setProperties({ ...properties, rotation: Number(e.target.value) })}
              className="flex-1"
            />
            <input
              type="number"
              value={properties.rotation}
              onChange={(e) => setProperties({ ...properties, rotation: Number(e.target.value) })}
              className="input text-sm w-20"
            />
          </div>
        </div>

        {elementType === 'door' && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Door Swing
            </label>
            <select
              value={properties.swing}
              onChange={(e) => setProperties({ ...properties, swing: e.target.value })}
              className="input text-sm"
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t border-neutral-200">
          <button
            onClick={handleUpdate}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
            aria-label="Apply changes"
          >
            <RotateCw className="w-4 h-4" />
            Apply
          </button>
          <button
            onClick={handleDelete}
            className="btn-secondary text-accent-terracotta hover:bg-accent-terracotta/10 flex-1"
            aria-label="Delete object"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}


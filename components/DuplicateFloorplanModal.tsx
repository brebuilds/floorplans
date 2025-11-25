'use client';

import { useState } from 'react';
import { Copy, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Floorplan, FloorplanMetadata } from '@/types';
import toast from 'react-hot-toast';

interface DuplicateFloorplanModalProps {
  isOpen: boolean;
  onClose: () => void;
  floorplan: Floorplan;
}

export default function DuplicateFloorplanModal({ isOpen, onClose, floorplan }: DuplicateFloorplanModalProps) {
  const { getCurrentBuilding, addFloorplan } = useStore();
  const [newMetadata, setNewMetadata] = useState<Partial<FloorplanMetadata>>({
    floorNumber: floorplan.metadata.floorNumber,
    floorplanType: floorplan.metadata.floorplanType,
    bedrooms: floorplan.metadata.bedrooms,
    bathrooms: floorplan.metadata.bathrooms,
    unitNumbers: [],
  });

  if (!isOpen) return null;

  const building = getCurrentBuilding();

  const handleDuplicate = () => {
    if (!building) {
      toast.error('No building selected');
      return;
    }

    const duplicated: Floorplan = {
      ...floorplan,
      id: `floorplan-${Date.now()}`,
      metadata: {
        ...floorplan.metadata,
        ...newMetadata,
      } as FloorplanMetadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addFloorplan(building.id, duplicated);
    toast.success('Floorplan duplicated!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Copy className="w-5 h-5" />
            Duplicate Floorplan
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Floor Number
            </label>
            <input
              type="text"
              value={newMetadata.floorNumber || ''}
              onChange={(e) => setNewMetadata({ ...newMetadata, floorNumber: e.target.value })}
              placeholder="e.g., 1, 2, basement"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Floorplan Type
            </label>
            <input
              type="text"
              value={newMetadata.floorplanType || ''}
              onChange={(e) => setNewMetadata({ ...newMetadata, floorplanType: e.target.value })}
              placeholder="e.g., A, B, C, D"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit Numbers (comma-separated)
            </label>
            <input
              type="text"
              value={newMetadata.unitNumbers?.join(', ') || ''}
              onChange={(e) =>
                setNewMetadata({
                  ...newMetadata,
                  unitNumbers: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                })
              }
              placeholder="e.g., 201, 202, 203"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms
              </label>
              <input
                type="number"
                value={newMetadata.bedrooms || 0}
                onChange={(e) =>
                  setNewMetadata({ ...newMetadata, bedrooms: parseInt(e.target.value) || 0 })
                }
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bathrooms
              </label>
              <input
                type="number"
                value={newMetadata.bathrooms || 0}
                onChange={(e) =>
                  setNewMetadata({
                    ...newMetadata,
                    bathrooms: parseFloat(e.target.value) || 0,
                  })
                }
                min="0"
                step="0.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDuplicate}
            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Duplicate
          </button>
        </div>
      </div>
    </div>
  );
}


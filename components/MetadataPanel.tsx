'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Floorplan, FloorplanMetadata } from '@/types';
import { FileText, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import LogoUpload from './LogoUpload';

interface MetadataPanelProps {
  floorplan: Floorplan;
}

export default function MetadataPanel({ floorplan }: MetadataPanelProps) {
  const { updateFloorplan } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [metadata, setMetadata] = useState<FloorplanMetadata>(floorplan.metadata);

  const handleSave = () => {
    updateFloorplan(floorplan.id, { metadata });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setMetadata(floorplan.metadata);
    setIsEditing(false);
  };

  return (
    <div className="p-6">
      <LogoUpload />
      <div className="flex items-center justify-between mb-6 mt-6">
        <h2 className="text-lg font-serif font-semibold text-neutral-900 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Metadata
        </h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-charcoal hover:text-charcoal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-charcoal-400 rounded"
            aria-label="Edit metadata"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="text-accent-sage hover:text-accent-sage/80 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent-sage/50 rounded"
              aria-label="Save metadata"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="text-neutral-600 hover:text-neutral-700 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-charcoal-400 rounded"
              aria-label="Cancel editing"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Building ID
          </label>
          {isEditing ? (
            <input
              type="text"
              value={metadata.buildingId || ''}
              onChange={(e) => setMetadata({ ...metadata, buildingId: e.target.value })}
              className="input"
              aria-label="Building ID"
            />
          ) : (
            <p className="text-neutral-800">{metadata.buildingId || '—'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Floor Number
          </label>
          {isEditing ? (
            <input
              type="text"
              value={metadata.floorNumber || ''}
              onChange={(e) => setMetadata({ ...metadata, floorNumber: e.target.value })}
              placeholder="e.g., 1, 2, basement"
              className="input"
            />
          ) : (
            <p className="text-neutral-800">{metadata.floorNumber || '—'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Unit Numbers
          </label>
          {isEditing ? (
            <input
              type="text"
              value={metadata.unitNumbers?.join(', ') || ''}
              onChange={(e) =>
                setMetadata({
                  ...metadata,
                  unitNumbers: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                })
              }
              placeholder="e.g., 201, 202, 203"
              className="input"
            />
          ) : (
            <p className="text-neutral-800">{metadata.unitNumbers?.join(', ') || '—'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Address
          </label>
          {isEditing ? (
            <input
              type="text"
              value={metadata.address || ''}
              onChange={(e) => setMetadata({ ...metadata, address: e.target.value })}
              className="input"
            />
          ) : (
            <p className="text-neutral-800">{metadata.address || '—'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Floorplan Type
          </label>
          {isEditing ? (
            <input
              type="text"
              value={metadata.floorplanType || ''}
              onChange={(e) => setMetadata({ ...metadata, floorplanType: e.target.value })}
              placeholder="e.g., A, B, C, D"
              className="input"
            />
          ) : (
            <p className="text-neutral-800">{metadata.floorplanType || '—'}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Bedrooms
            </label>
            {isEditing ? (
              <input
                type="number"
                value={metadata.bedrooms || 0}
                onChange={(e) =>
                  setMetadata({ ...metadata, bedrooms: parseInt(e.target.value) || 0 })
                }
                min="0"
                className="input"
              />
            ) : (
              <p className="text-neutral-800">{metadata.bedrooms || '—'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Bathrooms
            </label>
            {isEditing ? (
              <input
                type="number"
                value={metadata.bathrooms || 0}
                onChange={(e) =>
                  setMetadata({
                    ...metadata,
                    bathrooms: parseFloat(e.target.value) || 0,
                  })
                }
                min="0"
                step="0.5"
                className="input"
              />
            ) : (
              <p className="text-neutral-800">{metadata.bathrooms || '—'}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Square Footage
          </label>
          {isEditing ? (
            <input
              type="number"
              value={metadata.squareFootage || ''}
              onChange={(e) =>
                setMetadata({
                  ...metadata,
                  squareFootage: parseInt(e.target.value) || undefined,
                })
              }
              className="input"
            />
          ) : (
            <p className="text-neutral-800">{metadata.squareFootage || '—'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Custom Notes
          </label>
          {isEditing ? (
            <textarea
              value={metadata.customNotes || ''}
              onChange={(e) => setMetadata({ ...metadata, customNotes: e.target.value })}
              rows={4}
              className="input"
              placeholder="Add any custom notes..."
            />
          ) : (
            <p className="text-gray-800 whitespace-pre-wrap">{metadata.customNotes || '—'}</p>
          )}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Rooms</h3>
          <span className="text-xs text-gray-500">{floorplan.rooms.length}</span>
        </div>
        <div className="space-y-2">
          {floorplan.rooms.length === 0 ? (
            <p className="text-sm text-gray-500">No rooms added yet. Use the Rectangle tool to add rooms.</p>
          ) : (
            floorplan.rooms.map((room) => {
              const area = Math.round((room.width * room.height) / 144); // Convert to sq ft (assuming pixels are inches)
              return (
                <div
                  key={room.id}
                  className="p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => {
                    // Focus on room in canvas
                    const event = new CustomEvent('focusRoom', { detail: { roomId: room.id } });
                    window.dispatchEvent(event);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{room.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {Math.round(room.width)}&quot; × {Math.round(room.height)}&quot; 
                        {area > 0 && ` • ~${area} sq ft`}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newName = prompt('Rename room:', room.name);
                        if (newName && newName !== room.name) {
                          updateFloorplan(floorplan.id, {
                            rooms: floorplan.rooms.map((r) =>
                              r.id === room.id ? { ...r, name: newName } : r
                            ),
                          });
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 text-indigo-600 hover:text-indigo-700 text-xs px-2 py-1"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}


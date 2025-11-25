'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Floorplan, FloorplanMetadata } from '@/types';
import { ArrowLeft, Plus, FileText, Copy } from 'lucide-react';
import DuplicateFloorplanModal from './DuplicateFloorplanModal';

export default function BuildingView() {
  const {
    currentBuildingId,
    getCurrentBuilding,
    addFloorplan,
    setCurrentFloorplan,
    setCurrentBuilding,
  } = useStore();

  const building = getCurrentBuilding();
  const [showNewFloorplan, setShowNewFloorplan] = useState(false);
  const [duplicatingFloorplan, setDuplicatingFloorplan] = useState<Floorplan | null>(null);
  const [newFloorplanMetadata, setNewFloorplanMetadata] = useState<Partial<FloorplanMetadata>>({
    floorNumber: '',
    floorplanType: '',
    bedrooms: 0,
    bathrooms: 0,
  });

  if (!building) {
    return <div>No building selected</div>;
  }

  const handleCreateFloorplan = () => {
    const floorplan: Floorplan = {
      id: `floorplan-${Date.now()}`,
      buildingId: building.id,
      metadata: {
        buildingId: building.id,
        ...newFloorplanMetadata,
      } as FloorplanMetadata,
      rooms: [],
      walls: [],
      doors: [],
      windows: [],
      labels: [],
      drawings: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addFloorplan(building.id, floorplan);
    setNewFloorplanMetadata({
      floorNumber: '',
      floorplanType: '',
      bedrooms: 0,
      bathrooms: 0,
    });
    setShowNewFloorplan(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentBuilding('')}
            className="text-neutral-600 hover:text-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-charcoal-400 rounded"
            aria-label="Back to site plan"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-semibold text-neutral-900">{building.name}</h1>
            <p className="text-sm text-neutral-500">{building.floorplans.length} floorplan{building.floorplans.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button
          onClick={() => setShowNewFloorplan(true)}
          className="btn-primary flex items-center gap-2"
          aria-label="Add floorplan"
        >
          <Plus className="w-4 h-4" />
          Add Floorplan
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {building.floorplans.length === 0 ? (
          <div className="card p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
            <h2 className="text-2xl font-serif font-semibold text-neutral-900 mb-2">
              No floorplans yet
            </h2>
            <p className="text-neutral-600 mb-6">
              Create your first floorplan to start editing
            </p>
            <button
              onClick={() => setShowNewFloorplan(true)}
              className="btn-primary"
              aria-label="Create floorplan"
            >
              Create Floorplan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {building.floorplans.map((floorplan) => (
              <div
                key={floorplan.id}
                className="card p-6 border-2 border-transparent hover:border-charcoal transition-all duration-200 group"
              >
                <div
                  onClick={() => setCurrentFloorplan(floorplan.id)}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setCurrentFloorplan(floorplan.id);
                    }
                  }}
                  aria-label={`Open ${floorplan.metadata.floorplanType || 'Untitled'} floorplan`}
                >
                  <FileText className="w-8 h-8 text-charcoal mb-3" />
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    {floorplan.metadata.floorplanType || 'Untitled'}
                    {floorplan.metadata.floorNumber && ` - Floor ${floorplan.metadata.floorNumber}`}
                  </h3>
                  <div className="text-sm text-neutral-600 space-y-1">
                    {floorplan.metadata.bedrooms && (
                      <p>{floorplan.metadata.bedrooms} bed{floorplan.metadata.bedrooms !== 1 ? 's' : ''}</p>
                    )}
                    {floorplan.metadata.bathrooms && (
                      <p>{floorplan.metadata.bathrooms} bath{floorplan.metadata.bathrooms !== 1 ? 's' : ''}</p>
                    )}
                    {floorplan.metadata.unitNumbers && floorplan.metadata.unitNumbers.length > 0 && (
                      <p>Units: {floorplan.metadata.unitNumbers.join(', ')}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDuplicatingFloorplan(floorplan);
                  }}
                  className="mt-3 w-full opacity-0 group-hover:opacity-100 btn-secondary text-sm flex items-center justify-center gap-2 transition-all"
                  aria-label={`Duplicate ${floorplan.metadata.floorplanType || 'Untitled'} floorplan`}
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Floorplan Modal */}
        {showNewFloorplan && (
          <div className="fixed inset-0 bg-charcoal-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="card p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-serif font-semibold mb-4 text-neutral-900">Create New Floorplan</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Floor Number
                </label>
                <input
                  type="text"
                  value={newFloorplanMetadata.floorNumber || ''}
                  onChange={(e) =>
                    setNewFloorplanMetadata({ ...newFloorplanMetadata, floorNumber: e.target.value })
                  }
                  placeholder="e.g., 1, 2, basement, loft"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Floorplan Type
                </label>
                <input
                  type="text"
                  value={newFloorplanMetadata.floorplanType || ''}
                  onChange={(e) =>
                    setNewFloorplanMetadata({ ...newFloorplanMetadata, floorplanType: e.target.value })
                  }
                  placeholder="e.g., A, B, C, D or 'Studio'"
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    value={newFloorplanMetadata.bedrooms || 0}
                    onChange={(e) =>
                      setNewFloorplanMetadata({ ...newFloorplanMetadata, bedrooms: parseInt(e.target.value) || 0 })
                    }
                    min="0"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    value={newFloorplanMetadata.bathrooms || 0}
                    onChange={(e) =>
                      setNewFloorplanMetadata({ ...newFloorplanMetadata, bathrooms: parseInt(e.target.value) || 0 })
                    }
                    min="0"
                    step="0.5"
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Numbers (comma-separated)
                </label>
                <input
                  type="text"
                  value={newFloorplanMetadata.unitNumbers?.join(', ') || ''}
                  onChange={(e) =>
                    setNewFloorplanMetadata({
                      ...newFloorplanMetadata,
                      unitNumbers: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="e.g., 201, 202, 203"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Square Footage (optional)
                </label>
                <input
                  type="number"
                  value={newFloorplanMetadata.squareFootage || ''}
                  onChange={(e) =>
                    setNewFloorplanMetadata({
                      ...newFloorplanMetadata,
                      squareFootage: parseInt(e.target.value) || undefined,
                    })
                  }
                  placeholder="e.g., 1200"
                  className="input"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreateFloorplan}
                  className="btn-primary flex-1"
                  aria-label="Create floorplan"
                >
                  Create & Edit
                </button>
                <button
                  onClick={() => {
                    setShowNewFloorplan(false);
                    setNewFloorplanMetadata({
                      floorNumber: '',
                      floorplanType: '',
                      bedrooms: 0,
                      bathrooms: 0,
                    });
                  }}
                  className="btn-secondary flex-1"
                  aria-label="Cancel"
                >
                  Cancel
                </button>
            </div>
          </div>
        </div>
      )}

      {duplicatingFloorplan && (
        <DuplicateFloorplanModal
          isOpen={!!duplicatingFloorplan}
          onClose={() => setDuplicatingFloorplan(null)}
          floorplan={duplicatingFloorplan}
        />
      )}
    </div>
  );
}


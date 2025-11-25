'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Clock, RotateCcw, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FloorplanVersion } from '@/types';

interface VersionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VersionHistory({ isOpen, onClose }: VersionHistoryProps) {
  const { getCurrentFloorplan, updateFloorplan } = useStore();
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const floorplan = getCurrentFloorplan();

  if (!isOpen || !floorplan) return null;

  const versions = floorplan.versionHistory || [];
  const sortedVersions = [...versions].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleRestore = (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (!version) return;

    if (confirm('Restore this version? This will replace your current floorplan.')) {
      updateFloorplan(floorplan.id, {
        ...version.data,
        updatedAt: new Date().toISOString(),
      });
      toast.success('Version restored');
      onClose();
    }
  };

  const handleView = (versionId: string) => {
    setSelectedVersion(selectedVersion === versionId ? null : versionId);
  };

  return (
    <div className="fixed inset-0 bg-charcoal-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="card max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <h2 className="text-xl font-serif font-semibold text-neutral-900 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Version History
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-charcoal-400 rounded"
            aria-label="Close version history"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {sortedVersions.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
              <p className="text-neutral-600">No version history yet</p>
              <p className="text-sm text-neutral-500 mt-2">
                Versions are automatically saved as you work
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Current version */}
              <div className="border-2 border-charcoal rounded-boho-lg p-4 bg-charcoal-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-charcoal bg-white px-2 py-1 rounded">
                        CURRENT
                      </span>
                      <span className="text-sm text-neutral-600">
                        {format(new Date(floorplan.updatedAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-700">
                      {floorplan.metadata.floorplanType || 'Untitled Floorplan'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Version history */}
              {sortedVersions.map((version, index) => (
                <div
                  key={version.id}
                  className="border border-neutral-200 rounded-boho-lg p-4 hover:border-charcoal transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-neutral-500">
                          Version {sortedVersions.length - index}
                        </span>
                        <span className="text-sm text-neutral-600">
                          {format(new Date(version.timestamp), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      {version.note && (
                        <p className="text-sm text-neutral-700 mb-2">{version.note}</p>
                      )}
                      {selectedVersion === version.id && (
                        <div className="mt-3 p-3 bg-neutral-50 rounded-boho text-xs text-neutral-600">
                          <p><strong>Rooms:</strong> {version.data.rooms?.length || 0}</p>
                          <p><strong>Walls:</strong> {version.data.walls?.length || 0}</p>
                          <p><strong>Doors:</strong> {version.data.doors?.length || 0}</p>
                          <p><strong>Windows:</strong> {version.data.windows?.length || 0}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleView(version.id)}
                        className="btn-ghost text-sm p-2"
                        aria-label={`View version ${sortedVersions.length - index} details`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRestore(version.id)}
                        className="btn-secondary text-sm p-2"
                        aria-label={`Restore version ${sortedVersions.length - index}`}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50">
          <button
            onClick={onClose}
            className="btn-primary w-full"
            aria-label="Close"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


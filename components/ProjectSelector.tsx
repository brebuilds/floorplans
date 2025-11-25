'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Complex, SitePlan } from '@/types';
import { Plus, FolderOpen, Upload } from 'lucide-react';
import FileUpload from './FileUpload';
import SearchBar from './SearchBar';

export default function ProjectSelector() {
  const { complexes, addComplex, setCurrentComplex, addSitePlan, setCurrentSitePlan } = useStore();
  const [showNewProject, setShowNewProject] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedComplexId, setSelectedComplexId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');

  const handleCreateProject = () => {
    if (!projectName.trim()) return;

    const newComplex: Complex = {
      id: `complex-${Date.now()}`,
      name: projectName,
      sitePlans: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addComplex(newComplex);
    setProjectName('');
    setShowNewProject(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-serif font-semibold text-neutral-900 mb-4">
            Floorplans Studio
          </h1>
          <p className="text-xl text-neutral-600 mb-6">
            Transform sketches into professional floorplans
          </p>
          <div className="max-w-md mx-auto">
            <SearchBar />
          </div>
        </div>

        {complexes.length === 0 ? (
          <div className="card p-12 text-center">
            <FolderOpen className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
            <h2 className="text-2xl font-serif font-semibold text-neutral-900 mb-2">
              No projects yet
            </h2>
            <p className="text-neutral-600 mb-6">
              Create your first project to get started
            </p>
            <button
              onClick={() => setShowNewProject(true)}
              className="btn-primary flex items-center gap-2 mx-auto"
              aria-label="Create new project"
            >
              <Plus className="w-5 h-5" />
              Create New Project
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif font-semibold text-neutral-900">Your Projects</h2>
              <button
                onClick={() => setShowNewProject(true)}
                className="btn-primary flex items-center gap-2"
                aria-label="Create new project"
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {complexes.map((complex) => (
                <div
                  key={complex.id}
                  className="card p-6 border-2 border-transparent hover:border-charcoal transition-all duration-200"
                >
                  <FolderOpen className="w-8 h-8 text-charcoal mb-3" />
                  <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                    {complex.name}
                  </h3>
                  <p className="text-sm text-neutral-500 mb-4">
                    {complex.sitePlans.length} site plan{complex.sitePlans.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setCurrentComplex(complex.id);
                        if (complex.sitePlans.length > 0) {
                          setCurrentSitePlan(complex.sitePlans[0].id);
                        }
                      }}
                      className="btn-primary flex-1 text-sm"
                      aria-label={`Open ${complex.name}`}
                    >
                      Open
                    </button>
                    <button
                      onClick={() => {
                        setSelectedComplexId(complex.id);
                        setShowUpload(true);
                      }}
                      className="btn-secondary flex-1 text-sm flex items-center justify-center gap-1"
                      aria-label={`Upload to ${complex.name}`}
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showNewProject && (
          <div className="fixed inset-0 bg-charcoal-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="card p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-serif font-semibold mb-4 text-neutral-900">Create New Project</h3>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project name (e.g., 'Sunset Apartments')"
                className="input mb-4"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateProject();
                  if (e.key === 'Escape') setShowNewProject(false);
                }}
                aria-label="Project name"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleCreateProject}
                  className="btn-primary flex-1"
                  aria-label="Create project"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowNewProject(false);
                    setProjectName('');
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
      </div>

      {showUpload && selectedComplexId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full">
            <FileUpload
              onUpload={(file, projectType) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  const base64 = reader.result as string;
                  const newSitePlan: SitePlan = {
                    id: `siteplan-${Date.now()}`,
                    name: file.name || 'Untitled Site Plan',
                    originalUpload: base64,
                    buildings: [],
                    projectType,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  };
                  addSitePlan(selectedComplexId, newSitePlan);
                  setCurrentComplex(selectedComplexId);
                  setCurrentSitePlan(newSitePlan.id);
                  setShowUpload(false);
                  setSelectedComplexId(null);
                };
                reader.readAsDataURL(file);
              }}
              onCancel={() => {
                setShowUpload(false);
                setSelectedComplexId(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}


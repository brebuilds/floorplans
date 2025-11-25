'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { SitePlan, Building, ProjectType } from '@/types';
import FileUpload from './FileUpload';
import { ArrowLeft, Download, Building2, Plus, Sparkles } from 'lucide-react';
import { cleanupImage, detectBuildings } from '@/lib/services/aiService';
import toast from 'react-hot-toast';

export default function SitePlanView() {
  const {
    currentSitePlanId,
    getCurrentSitePlan,
    updateSitePlan,
    addBuilding,
    setCurrentBuilding,
    setCurrentSitePlan,
    setCurrentComplex,
  } = useStore();

  const sitePlan = getCurrentSitePlan();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showUpload, setShowUpload] = useState(!sitePlan?.originalUpload);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [isCleaning, setIsCleaning] = useState(false);

  useEffect(() => {
    if (sitePlan?.originalUpload && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        drawBuildings(ctx);
      };
      img.src = sitePlan.originalUpload;
    }
  }, [sitePlan]);

  const drawBuildings = (ctx: CanvasRenderingContext2D) => {
    if (!sitePlan) return;

    sitePlan.buildings.forEach((building) => {
      ctx.strokeStyle = selectedBuildingId === building.id ? '#6366f1' : '#000000';
      ctx.lineWidth = selectedBuildingId === building.id ? 3 : 1;
      ctx.fillStyle = selectedBuildingId === building.id ? 'rgba(99, 102, 241, 0.2)' : 'transparent';
      
      // Draw building outline (simplified - would use actual path data)
      ctx.beginPath();
      ctx.rect(building.outline.x, building.outline.y, building.outline.width, building.outline.height);
      ctx.fill();
      ctx.stroke();
    });
  };

  const handleFileUpload = async (file: File, projectType: ProjectType) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const complex = useStore.getState().getCurrentComplex();
      
      if (sitePlan) {
        updateSitePlan(sitePlan.id, {
          originalUpload: base64,
          projectType,
        });
        setShowUpload(false);
      } else if (complex) {
        // Create new site plan
        const newSitePlan: SitePlan = {
          id: `siteplan-${Date.now()}`,
          name: file.name || 'Untitled Site Plan',
          originalUpload: base64,
          buildings: [],
          projectType,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        useStore.getState().addSitePlan(complex.id, newSitePlan);
        setShowUpload(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCleanSitePlan = async () => {
    if (!sitePlan || !sitePlan.originalUpload) return;
    setIsCleaning(true);
    toast.loading('Cleaning site plan...', { id: 'cleanup' });
    
    try {
      const result = await cleanupImage(sitePlan.originalUpload, 'site-plan');

      if (!result.success) {
        toast.error(result.error || 'Failed to cleanup site plan', { id: 'cleanup' });
        setIsCleaning(false);
        return;
      }

      // Update site plan with cleaned SVG (if available) or description
      updateSitePlan(sitePlan.id, {
        cleanedSVG: result.cleanedSVG || null,
        // Store description for reference
        // In a full implementation, you'd parse this and generate SVG
      });

      toast.success('Site plan cleaned!', { id: 'cleanup' });
      console.log('Cleanup description:', result.description);
      setIsCleaning(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to cleanup site plan', { id: 'cleanup' });
      setIsCleaning(false);
    }
  };

  const handleDetectBuildings = async () => {
    if (!sitePlan || !sitePlan.originalUpload) return;
    
    toast.loading('Detecting buildings...', { id: 'detect' });
    
    try {
      const result = await detectBuildings(sitePlan.originalUpload);

      if (!result.success) {
        toast.error(result.error || 'Failed to detect buildings', { id: 'detect' });
        return;
      }

      // Add detected buildings
      result.buildings.forEach((outline) => {
        const building: Building = {
          id: outline.id,
          name: outline.name,
          outline: {
            id: outline.id,
            name: outline.name,
            path: outline.path,
            x: outline.x,
            y: outline.y,
            width: outline.width,
            height: outline.height,
          },
          floorplans: [],
          sitePlanId: sitePlan.id,
        };
        addBuilding(sitePlan.id, building);
      });

      if (result.buildings.length === 0) {
        toast('No buildings detected. Try manual tracing.', { id: 'detect' });
      } else {
        toast.success(`Detected ${result.buildings.length} building(s)`, { id: 'detect' });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to detect buildings', { id: 'detect' });
    }
  };

  const handleBuildingClick = (buildingId: string) => {
    setSelectedBuildingId(buildingId);
    setCurrentBuilding(buildingId);
  };

  const handleExport = (format: 'svg' | 'png' | 'pdf') => {
    // Export functionality would go here
    console.log(`Exporting as ${format}`);
  };

  if (showUpload) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <FileUpload
          onUpload={handleFileUpload}
          onCancel={() => {
            setCurrentSitePlan('');
            setCurrentComplex('');
          }}
        />
      </div>
    );
  }

  if (!sitePlan) {
    return <div>No site plan selected</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentSitePlan('')}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-800">{sitePlan.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCleanSitePlan}
            disabled={isCleaning}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {isCleaning ? 'Cleaning...' : 'Clean Site Plan'}
          </button>
          <div className="relative">
            <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 p-6 overflow-auto bg-gray-100">
          <div className="bg-white rounded-lg shadow-md p-4 inline-block">
            <canvas
              ref={canvasRef}
              className="border border-gray-300 cursor-pointer"
              onClick={(e) => {
                // Handle building click detection
                const rect = canvasRef.current?.getBoundingClientRect();
                if (rect && sitePlan.buildings.length > 0) {
                  // Simple click detection (would be more sophisticated)
                  const building = sitePlan.buildings[0];
                  handleBuildingClick(building.id);
                }
              }}
            />
          </div>

          {sitePlan.buildings.length === 0 && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-blue-800 mb-4">
                No buildings detected yet. Click the button below to detect buildings automatically,
                or manually trace building outlines.
              </p>
              <button
                onClick={handleDetectBuildings}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Detect Buildings
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Buildings ({sitePlan.buildings.length})
          </h2>

          <div className="space-y-2">
            {sitePlan.buildings.map((building) => (
              <div
                key={building.id}
                onClick={() => handleBuildingClick(building.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedBuildingId === building.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-medium text-gray-800">{building.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {building.floorplans.length} floorplan{building.floorplans.length !== 1 ? 's' : ''}
                </p>
              </div>
            ))}
          </div>

          {selectedBuildingId && (
            <div className="mt-6">
              <button
                onClick={() => {
                  setCurrentBuilding(selectedBuildingId);
                }}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Open Building Editor
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


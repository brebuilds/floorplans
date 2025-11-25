import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Complex, SitePlan, Building, Floorplan, EditorState, ToolType } from '@/types';

interface AppState {
  // Projects
  complexes: Complex[];
  currentComplexId?: string;
  currentSitePlanId?: string;
  currentBuildingId?: string;
  currentFloorplanId?: string;
  
  // Editor state
  editorState: EditorState;
  
  // UI state
  isUploading: boolean;
  uploadProgress: number;
  
  // Actions
  setCurrentComplex: (id: string) => void;
  setCurrentSitePlan: (id: string) => void;
  setCurrentBuilding: (id: string) => void;
  setCurrentFloorplan: (id: string) => void;
  
  addComplex: (complex: Complex) => void;
  updateComplex: (id: string, updates: Partial<Complex>) => void;
  
  addSitePlan: (complexId: string, sitePlan: SitePlan) => void;
  updateSitePlan: (id: string, updates: Partial<SitePlan>) => void;
  
  addBuilding: (sitePlanId: string, building: Building) => void;
  updateBuilding: (id: string, updates: Partial<Building>) => void;
  
  addFloorplan: (buildingId: string, floorplan: Floorplan) => void;
  updateFloorplan: (id: string, updates: Partial<Floorplan>) => void;
  
  setEditorTool: (tool: ToolType) => void;
  setEditorState: (state: Partial<EditorState>) => void;
  
  setUploading: (isUploading: boolean, progress?: number) => void;
  
  // Getters
  getCurrentComplex: () => Complex | undefined;
  getCurrentSitePlan: () => SitePlan | undefined;
  getCurrentBuilding: () => Building | undefined;
  getCurrentFloorplan: () => Floorplan | undefined;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      complexes: [],
      editorState: {
        currentTool: 'select',
        showGrid: true,
        snapToGrid: true,
        gridSize: 20,
      },
      isUploading: false,
      uploadProgress: 0,
      
      setCurrentComplex: (id) => set({ currentComplexId: id }),
      setCurrentSitePlan: (id) => set({ currentSitePlanId: id }),
      setCurrentBuilding: (id) => set({ currentBuildingId: id }),
      setCurrentFloorplan: (id) => set({ currentFloorplanId: id }),
      
      addComplex: (complex) => set((state) => ({
        complexes: [...state.complexes, complex],
        currentComplexId: complex.id,
      })),
      
      updateComplex: (id, updates) => set((state) => ({
        complexes: state.complexes.map((c) =>
          c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
        ),
      })),
      
      addSitePlan: (complexId, sitePlan) => set((state) => ({
        complexes: state.complexes.map((c) =>
          c.id === complexId
            ? { ...c, sitePlans: [...c.sitePlans, sitePlan], updatedAt: new Date().toISOString() }
            : c
        ),
        currentSitePlanId: sitePlan.id,
      })),
      
      updateSitePlan: (id, updates) => set((state) => ({
        complexes: state.complexes.map((c) => ({
          ...c,
          sitePlans: c.sitePlans.map((sp) =>
            sp.id === id ? { ...sp, ...updates, updatedAt: new Date().toISOString() } : sp
          ),
        })),
      })),
      
      addBuilding: (sitePlanId, building) => set((state) => ({
        complexes: state.complexes.map((c) => ({
          ...c,
          sitePlans: c.sitePlans.map((sp) =>
            sp.id === sitePlanId
              ? { ...sp, buildings: [...sp.buildings, building], updatedAt: new Date().toISOString() }
              : sp
          ),
        })),
      })),
      
      updateBuilding: (id, updates) => set((state) => ({
        complexes: state.complexes.map((c) => ({
          ...c,
          sitePlans: c.sitePlans.map((sp) => ({
            ...sp,
            buildings: sp.buildings.map((b) =>
              b.id === id ? { ...b, ...updates } : b
            ),
          })),
        })),
      })),
      
      addFloorplan: (buildingId, floorplan) => set((state) => ({
        complexes: state.complexes.map((c) => ({
          ...c,
          sitePlans: c.sitePlans.map((sp) => ({
            ...sp,
            buildings: sp.buildings.map((b) =>
              b.id === buildingId
                ? { ...b, floorplans: [...b.floorplans, floorplan] }
                : b
            ),
          })),
        })),
      })),
      
      updateFloorplan: (id, updates) => set((state) => ({
        complexes: state.complexes.map((c) => ({
          ...c,
          sitePlans: c.sitePlans.map((sp) => ({
            ...sp,
            buildings: sp.buildings.map((b) => ({
              ...b,
              floorplans: b.floorplans.map((fp) =>
                fp.id === id ? { ...fp, ...updates, updatedAt: new Date().toISOString() } : fp
              ),
            })),
          })),
        })),
      })),
      
      setEditorTool: (tool) => set((state) => ({
        editorState: { ...state.editorState, currentTool: tool },
      })),
      
      setEditorState: (newState) => set((state) => ({
        editorState: { ...state.editorState, ...newState },
      })),
      
      setUploading: (isUploading, progress = 0) => set({
        isUploading,
        uploadProgress: progress,
      }),
      
      getCurrentComplex: () => {
        const state = get();
        return state.complexes.find((c) => c.id === state.currentComplexId);
      },
      
      getCurrentSitePlan: () => {
        const complex = get().getCurrentComplex();
        const sitePlanId = get().currentSitePlanId;
        return complex?.sitePlans.find((sp) => sp.id === sitePlanId);
      },
      
      getCurrentBuilding: () => {
        const sitePlan = get().getCurrentSitePlan();
        const buildingId = get().currentBuildingId;
        return sitePlan?.buildings.find((b) => b.id === buildingId);
      },
      
      getCurrentFloorplan: () => {
        const building = get().getCurrentBuilding();
        const floorplanId = get().currentFloorplanId;
        return building?.floorplans.find((fp) => fp.id === floorplanId);
      },
    }),
    {
      name: 'floorplans-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        complexes: state.complexes,
        currentComplexId: state.currentComplexId,
        currentSitePlanId: state.currentSitePlanId,
        currentBuildingId: state.currentBuildingId,
        currentFloorplanId: state.currentFloorplanId,
      }),
    }
  )
);


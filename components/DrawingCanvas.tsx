'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { Floorplan, Wall, Door, Window, Room, Label, ToolType, Furniture } from '@/types';
import { fabric } from 'fabric';
import toast from 'react-hot-toast';
import { createVersion, addVersionToHistory, shouldAutoSave } from '@/utils/versionHistory';

interface DrawingCanvasProps {
  floorplan: Floorplan;
  zoomLevel?: number;
  onZoomChange?: (zoom: number) => void;
  onFurnitureSelect?: any; // Selected furniture item to place (not a callback)
  onObjectSelect?: (obj: fabric.Object | null) => void;
}

export default function DrawingCanvas({ floorplan, zoomLevel = 1, onZoomChange, onFurnitureSelect, onObjectSelect }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const { editorState, updateFloorplan } = useStore();
  const { addToHistory, undo, redo, canUndo, canRedo } = useHistoryStore();
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);
  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  const objectMapRef = useRef<Map<string, fabric.Object>>(new Map());
  const [currentZoom, setCurrentZoom] = useState(zoomLevel);

  // Save state to history
  const saveToHistory = useCallback(() => {
    const currentFloorplan = useStore.getState().getCurrentFloorplan();
    if (currentFloorplan) {
      addToHistory(currentFloorplan.id, currentFloorplan);
      
      // Auto-save version history
      if (shouldAutoSave(currentFloorplan.updatedAt)) {
        const version = createVersion(currentFloorplan);
        const updated = addVersionToHistory(currentFloorplan, version);
        useStore.getState().updateFloorplan(currentFloorplan.id, updated);
      }
    }
  }, [addToHistory]);

  // Snap to grid helper
  const snapToGrid = useCallback((value: number) => {
    if (!editorState.snapToGrid) return value;
    return Math.round(value / editorState.gridSize) * editorState.gridSize;
  }, [editorState.snapToGrid, editorState.gridSize]);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 1200,
      height: 800,
      backgroundColor: '#ffffff',
    });

    fabricCanvasRef.current = canvas;
    
    // Set initial zoom
    canvas.setZoom(currentZoom);
    
    // Expose canvas globally for export
    (window as any).fabricCanvas = canvas;

    // Load background image if exists
    if (floorplan.baseImage) {
      fabric.Image.fromURL(floorplan.baseImage, (img) => {
        img.set({
          selectable: false,
          evented: false,
          lockMovementX: true,
          lockMovementY: true,
        });
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
      });
    }

    // Load existing floorplan elements
    loadFloorplanElements(canvas);

    // Setup event handlers
    setupCanvasEvents(canvas);

    // Handle undo/redo events
    const handleUndo = () => {
      const restored = undo(floorplan.id);
      if (restored) {
        canvas.clear();
        if (restored.baseImage) {
          fabric.Image.fromURL(restored.baseImage, (img) => {
            img.set({ selectable: false, evented: false });
            canvas.setBackgroundImage(img, () => {
              loadFloorplanElements(canvas);
            });
          });
        } else {
          loadFloorplanElements(canvas);
        }
        updateFloorplan(floorplan.id, restored);
        toast.success('Undone');
      }
    };

    const handleRedo = () => {
      const restored = redo(floorplan.id);
      if (restored) {
        canvas.clear();
        if (restored.baseImage) {
          fabric.Image.fromURL(restored.baseImage, (img) => {
            img.set({ selectable: false, evented: false });
            canvas.setBackgroundImage(img, () => {
              loadFloorplanElements(canvas);
            });
          });
        } else {
          loadFloorplanElements(canvas);
        }
        updateFloorplan(floorplan.id, restored);
        toast.success('Redone');
      }
    };

    const handleDelete = () => {
      const activeObjects = canvas.getActiveObjects();
      if (activeObjects.length > 0) {
        activeObjects.forEach((obj) => {
          const elementId = (obj as any).elementId;
          if (elementId) {
            deleteElement(elementId, obj);
          }
          canvas.remove(obj);
        });
        canvas.discardActiveObject();
        canvas.renderAll();
        saveToHistory();
        toast.success('Deleted');
      }
    };

    const handleExport = () => {
      const exportMenu = document.getElementById('export-menu');
      if (exportMenu) {
        exportMenu.style.display = exportMenu.style.display === 'block' ? 'none' : 'block';
      }
    };

    const handleCopy = () => {
      const activeObjects = canvas.getActiveObjects();
      if (activeObjects.length > 0) {
        canvas.setActiveObject(activeObjects[0]);
        canvas.getActiveObject()?.clone((cloned: fabric.Object) => {
          (window as any).clipboard = cloned;
          toast.success('Copied');
        });
      }
    };

    const handlePaste = () => {
      const clipboard = (window as any).clipboard;
      if (clipboard) {
        clipboard.clone((cloned: fabric.Object) => {
          cloned.set({
            left: (cloned.left || 0) + 20,
            top: (cloned.top || 0) + 20,
          });
          canvas.add(cloned);
          canvas.setActiveObject(cloned);
          canvas.renderAll();
          saveToHistory();
          toast.success('Pasted');
        });
      }
    };

    const handleDuplicate = () => {
      const activeObjects = canvas.getActiveObjects();
      if (activeObjects.length > 0) {
        activeObjects.forEach((obj) => {
          obj.clone((cloned: fabric.Object) => {
            cloned.set({
              left: (cloned.left || 0) + 20,
              top: (cloned.top || 0) + 20,
            });
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
          });
        });
        canvas.renderAll();
        saveToHistory();
        toast.success('Duplicated');
      }
    };

    window.addEventListener('undo', handleUndo);
    window.addEventListener('redo', handleRedo);
    window.addEventListener('deleteSelected', handleDelete);
    window.addEventListener('export', handleExport);
    window.addEventListener('copy', handleCopy);
    window.addEventListener('paste', handlePaste);
    window.addEventListener('duplicate', handleDuplicate);

    return () => {
      window.removeEventListener('undo', handleUndo);
      window.removeEventListener('redo', handleRedo);
      window.removeEventListener('deleteSelected', handleDelete);
      window.removeEventListener('export', handleExport);
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('duplicate', handleDuplicate);
      canvas.dispose();
    };
  }, [floorplan.id]);

  // Sync canvas when floorplan changes
  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;
    
    // Reload elements if floorplan data changed
    const currentObjects = canvas.getObjects().filter((obj) => !(obj as any).isBackground);
    if (currentObjects.length !== 
        floorplan.walls.length + floorplan.rooms.length + floorplan.doors.length + 
        floorplan.windows.length + floorplan.labels.length + (floorplan.furniture?.length || 0)) {
      canvas.clear();
      if (floorplan.baseImage) {
        fabric.Image.fromURL(floorplan.baseImage, (img) => {
          img.set({ selectable: false, evented: false });
          canvas.setBackgroundImage(img, () => {
            loadFloorplanElements(canvas);
          });
        });
      } else {
        loadFloorplanElements(canvas);
      }
    }
  }, [floorplan]);

  // Listen for background image updates (without page reload)
  useEffect(() => {
    const handleBackgroundUpdate = (e: CustomEvent) => {
      if (!fabricCanvasRef.current) return;
      const canvas = fabricCanvasRef.current;
      const base64 = e.detail?.base64;
      
      canvas.clear();
      if (base64) {
        fabric.Image.fromURL(base64, (img) => {
          img.set({ selectable: false, evented: false });
          canvas.setBackgroundImage(img, () => {
            loadFloorplanElements(canvas);
          });
        });
      } else {
        canvas.setBackgroundImage(null, () => {
          loadFloorplanElements(canvas);
        });
      }
    };

    window.addEventListener('backgroundImageUpdated', handleBackgroundUpdate as EventListener);
    return () => {
      window.removeEventListener('backgroundImageUpdated', handleBackgroundUpdate as EventListener);
    };
  }, []);

  const loadFloorplanElements = (canvas: fabric.Canvas) => {
    objectMapRef.current.clear();

    // Load walls
    floorplan.walls.forEach((wall) => {
      const line = new fabric.Line([wall.x1, wall.y1, wall.x2, wall.y2], {
        stroke: '#000000',
        strokeWidth: wall.thickness || 3,
        selectable: true,
        evented: true,
        lockRotation: false,
      });
      (line as any).elementId = wall.id;
      (line as any).elementType = 'wall';
      canvas.add(line);
      objectMapRef.current.set(wall.id, line);
    });

    // Load rooms
    floorplan.rooms.forEach((room) => {
      const rect = new fabric.Rect({
        left: room.x,
        top: room.y,
        width: room.width,
        height: room.height,
        fill: 'rgba(99, 102, 241, 0.1)',
        stroke: '#6366f1',
        strokeWidth: 2,
        selectable: true,
        evented: true,
      });
      (rect as any).elementId = room.id;
      (rect as any).elementType = 'room';
      (rect as any).roomName = room.name;
      canvas.add(rect);
      objectMapRef.current.set(room.id, rect);

      // Add room label
      const text = new fabric.Text(room.name, {
        left: room.x + 10,
        top: room.y + 10,
        fontSize: 14,
        fill: '#6366f1',
        selectable: false,
        evented: false,
      });
      (text as any).roomId = room.id;
      canvas.add(text);
    });

    // Load doors with swing arc
    floorplan.doors.forEach((door) => {
      const group = new fabric.Group([], {
        left: door.x,
        top: door.y,
        selectable: true,
        evented: true,
      });
      
      const doorRect = new fabric.Rect({
        width: door.width || 30,
        height: 5,
        fill: '#8B4513',
        stroke: '#000000',
        strokeWidth: 1,
        originX: 'center',
        originY: 'center',
      });

      const swingArc = new fabric.Circle({
        radius: door.width || 30,
        fill: 'transparent',
        stroke: '#000000',
        strokeWidth: 1,
        strokeDashArray: [5, 5],
        originX: 'center',
        originY: 'center',
      });

      group.addWithUpdate(doorRect);
      group.addWithUpdate(swingArc);
      (group as any).elementId = door.id;
      (group as any).elementType = 'door';
      (group as any).doorSwing = door.swing;
      
      canvas.add(group);
      objectMapRef.current.set(door.id, group);
    });

    // Load windows
    floorplan.windows.forEach((window) => {
      const windowRect = new fabric.Rect({
        left: window.x,
        top: window.y,
        width: window.width,
        height: 10,
        fill: '#87CEEB',
        stroke: '#000000',
        strokeWidth: 1,
        selectable: true,
        evented: true,
      });
      (windowRect as any).elementId = window.id;
      (windowRect as any).elementType = 'window';
      canvas.add(windowRect);
      objectMapRef.current.set(window.id, windowRect);
    });

    // Load labels
    floorplan.labels.forEach((label) => {
      const text = new fabric.Text(label.text, {
        left: label.x,
        top: label.y,
        fontSize: label.fontSize || 16,
        fill: '#000000',
        selectable: true,
        evented: true,
      });
      (text as any).elementId = label.id;
      (text as any).elementType = 'label';
      canvas.add(text);
      objectMapRef.current.set(label.id, text);
    });

    // Load furniture
    if (floorplan.furniture) {
      floorplan.furniture.forEach((furniture) => {
        const rect = new fabric.Rect({
          left: furniture.x,
          top: furniture.y,
          width: furniture.width,
          height: furniture.height,
          fill: 'rgba(139, 69, 19, 0.3)',
          stroke: '#8B4513',
          strokeWidth: 2,
          selectable: true,
          evented: true,
          angle: furniture.rotation || 0,
        });
        (rect as any).elementId = furniture.id;
        (rect as any).elementType = 'furniture';
        (rect as any).furnitureType = furniture.type;
        (rect as any).furnitureName = furniture.name;
        canvas.add(rect);
        objectMapRef.current.set(furniture.id, rect);
      });
    }

    canvas.renderAll();
  };

  const deleteElement = (elementId: string, obj: fabric.Object) => {
    const elementType = (obj as any).elementType;
    const currentFloorplan = useStore.getState().getCurrentFloorplan();
    if (!currentFloorplan) return;

    let updates: Partial<Floorplan> = {};

    switch (elementType) {
      case 'wall':
        updates = {
          walls: currentFloorplan.walls.filter((w) => w.id !== elementId),
        };
        break;
      case 'room':
        updates = {
          rooms: currentFloorplan.rooms.filter((r) => r.id !== elementId),
          labels: currentFloorplan.labels.filter((l) => (l as any).roomId !== elementId),
        };
        break;
      case 'door':
        updates = {
          doors: currentFloorplan.doors.filter((d) => d.id !== elementId),
        };
        break;
      case 'window':
        updates = {
          windows: currentFloorplan.windows.filter((w) => w.id !== elementId),
        };
        break;
      case 'label':
        updates = {
          labels: currentFloorplan.labels.filter((l) => l.id !== elementId),
        };
        break;
      case 'furniture':
        updates = {
          furniture: (currentFloorplan.furniture || []).filter((f) => f.id !== elementId),
        };
        break;
    }

    updateFloorplan(currentFloorplan.id, updates);
  };

  const setupCanvasEvents = (canvas: fabric.Canvas) => {
    // Object selection
    canvas.on('selection:created', (e) => {
      const activeObject = canvas.getActiveObject();
      setSelectedObjects(e.selected || []);
      onObjectSelect?.(activeObject || null);
    });

    canvas.on('selection:updated', (e) => {
      const activeObject = canvas.getActiveObject();
      setSelectedObjects(e.selected || []);
      onObjectSelect?.(activeObject || null);
    });

    canvas.on('selection:cleared', () => {
      setSelectedObjects([]);
      setEditingRoom(null);
      onObjectSelect?.(null);
    });

    // Object modification
    canvas.on('object:modified', (e) => {
      const obj = e.target;
      if (!obj) return;

      const elementId = (obj as any).elementId;
      const elementType = (obj as any).elementType;
      const currentFloorplan = useStore.getState().getCurrentFloorplan();
      if (!currentFloorplan) return;

      let updates: Partial<Floorplan> = {};

      if (elementType === 'wall' && obj instanceof fabric.Line) {
        const coords = obj.getCoords();
        updates = {
          walls: currentFloorplan.walls.map((w) =>
            w.id === elementId
              ? {
                  ...w,
                  x1: snapToGrid(coords[0].x),
                  y1: snapToGrid(coords[0].y),
                  x2: snapToGrid(coords[1].x),
                  y2: snapToGrid(coords[1].y),
                }
              : w
          ),
        };
      } else if (elementType === 'room' && obj instanceof fabric.Rect) {
        updates = {
          rooms: currentFloorplan.rooms.map((r) =>
            r.id === elementId
              ? {
                  ...r,
                  x: snapToGrid(obj.left!),
                  y: snapToGrid(obj.top!),
                  width: snapToGrid(obj.width!),
                  height: snapToGrid(obj.height!),
                }
              : r
          ),
        };
      } else if (elementType === 'door' && obj instanceof fabric.Group) {
        updates = {
          doors: currentFloorplan.doors.map((d) =>
            d.id === elementId
              ? {
                  ...d,
                  x: snapToGrid(obj.left!),
                  y: snapToGrid(obj.top!),
                  rotation: obj.angle || 0,
                }
              : d
          ),
        };
      } else if (elementType === 'window' && obj instanceof fabric.Rect) {
        updates = {
          windows: currentFloorplan.windows.map((w) =>
            w.id === elementId
              ? {
                  ...w,
                  x: snapToGrid(obj.left!),
                  y: snapToGrid(obj.top!),
                  width: snapToGrid(obj.width!),
                  rotation: obj.angle || 0,
                }
              : w
          ),
        };
      } else if (elementType === 'label' && obj instanceof fabric.Text) {
        updates = {
          labels: currentFloorplan.labels.map((l) =>
            l.id === elementId
              ? {
                  ...l,
                  x: snapToGrid(obj.left!),
                  y: snapToGrid(obj.top!),
                  text: obj.text || '',
                }
              : l
          ),
        };
      } else if (elementType === 'furniture' && obj instanceof fabric.Rect) {
        updates = {
          furniture: (currentFloorplan.furniture || []).map((f) =>
            f.id === elementId
              ? {
                  ...f,
                  x: snapToGrid(obj.left!),
                  y: snapToGrid(obj.top!),
                  width: snapToGrid(obj.width!),
                  height: snapToGrid(obj.height!),
                  rotation: obj.angle || 0,
                }
              : f
          ),
        };
      }

      if (Object.keys(updates).length > 0) {
        updateFloorplan(currentFloorplan.id, updates);
        saveToHistory();
      }
    });

    // Double-click to edit room name
    canvas.on('mouse:dblclick', (e) => {
      const obj = e.target;
      if (obj && (obj as any).elementType === 'room') {
        const roomId = (obj as any).elementId;
        const currentFloorplan = useStore.getState().getCurrentFloorplan();
        const room = currentFloorplan?.rooms.find((r) => r.id === roomId);
        if (room) {
          const newName = prompt('Room name:', room.name);
          if (newName && newName !== room.name) {
            updateFloorplan(currentFloorplan!.id, {
              rooms: currentFloorplan!.rooms.map((r) =>
                r.id === roomId ? { ...r, name: newName } : r
              ),
            });
            saveToHistory();
            toast.success('Room renamed');
          }
        }
      } else if (obj && (obj as any).elementType === 'label') {
        const labelId = (obj as any).elementId;
        const currentFloorplan = useStore.getState().getCurrentFloorplan();
        const label = currentFloorplan?.labels.find((l) => l.id === labelId);
        if (label && obj instanceof fabric.Text) {
          // Enable text editing
          canvas.setActiveObject(obj);
          (obj as any).enterEditing?.();
        }
      }
    });

    // Drawing tools
    canvas.on('mouse:down', (e) => {
      // Handle furniture placement
      if (onFurnitureSelect && onFurnitureSelect.id) {
        const pointer = canvas.getPointer(e.e);
        const snappedPoint = {
          x: snapToGrid(pointer.x),
          y: snapToGrid(pointer.y),
        };
        
        const furniture: Furniture = {
          id: `furniture-${Date.now()}`,
          type: onFurnitureSelect.id,
          name: onFurnitureSelect.name,
          x: snappedPoint.x,
          y: snappedPoint.y,
          width: onFurnitureSelect.width,
          height: onFurnitureSelect.height,
        };
        
        const rect = new fabric.Rect({
          left: furniture.x,
          top: furniture.y,
          width: furniture.width,
          height: furniture.height,
          fill: 'rgba(139, 69, 19, 0.3)',
          stroke: '#8B4513',
          strokeWidth: 2,
          selectable: true,
          evented: true,
        });
        (rect as any).elementId = furniture.id;
        (rect as any).elementType = 'furniture';
        (rect as any).furnitureType = furniture.type;
        (rect as any).furnitureName = furniture.name;
        canvas.add(rect);
        objectMapRef.current.set(furniture.id, rect);
        
        const currentFloorplan = useStore.getState().getCurrentFloorplan();
        if (currentFloorplan) {
          updateFloorplan(currentFloorplan.id, {
            furniture: [...(currentFloorplan.furniture || []), furniture],
          });
          saveToHistory();
          toast.success(`${furniture.name} placed`);
        }
        return;
      }
      
      if (editorState.currentTool === 'select') return;
      
      const pointer = canvas.getPointer(e.e);
      const snappedPoint = {
        x: snapToGrid(pointer.x),
        y: snapToGrid(pointer.y),
      };
      setStartPoint(snappedPoint);
      setIsDrawing(true);
    });

    canvas.on('mouse:move', (e) => {
      if (!isDrawing || !startPoint) return;
      const pointer = canvas.getPointer(e.e);
      const snappedPoint = {
        x: snapToGrid(pointer.x),
        y: snapToGrid(pointer.y),
      };

      // Remove temp objects
      canvas.remove(...canvas.getObjects().filter((obj) => (obj as any).isTemp));

      if (editorState.currentTool === 'line') {
        const line = new fabric.Line([startPoint.x, startPoint.y, snappedPoint.x, snappedPoint.y], {
          stroke: '#000000',
          strokeWidth: 3,
          selectable: false,
          evented: false,
        });
        (line as any).isTemp = true;
        canvas.add(line);
        canvas.renderAll();
      } else if (editorState.currentTool === 'measure') {
        const line = new fabric.Line([startPoint.x, startPoint.y, snappedPoint.x, snappedPoint.y], {
          stroke: '#ff6b6b',
          strokeWidth: 2,
          strokeDashArray: [5, 5],
          selectable: false,
          evented: false,
        });
        (line as any).isTemp = true;
        canvas.add(line);
        
        const dx = snappedPoint.x - startPoint.x;
        const dy = snappedPoint.y - startPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const inches = Math.round(distance);
        const feet = Math.floor(inches / 12);
        const remainingInches = inches % 12;
        const measurementText = remainingInches > 0 
          ? `${feet}' ${remainingInches}"`
          : `${feet}'`;
        
        const midX = (startPoint.x + snappedPoint.x) / 2;
        const midY = (startPoint.y + snappedPoint.y) / 2;
        const text = new fabric.Text(measurementText, {
          left: midX,
          top: midY - 20,
          fontSize: 12,
          fill: '#ff6b6b',
          backgroundColor: 'white',
          selectable: false,
          evented: false,
        });
        (text as any).isTemp = true;
        canvas.add(text);
        canvas.renderAll();
      } else if (editorState.currentTool === 'rectangle') {
        const width = snappedPoint.x - startPoint.x;
        const height = snappedPoint.y - startPoint.y;
        const rect = new fabric.Rect({
          left: startPoint.x,
          top: startPoint.y,
          width,
          height,
          fill: 'rgba(99, 102, 241, 0.1)',
          stroke: '#6366f1',
          strokeWidth: 2,
          selectable: false,
          evented: false,
        });
        (rect as any).isTemp = true;
        canvas.add(rect);
        canvas.renderAll();
      }
    });

    canvas.on('mouse:up', (e) => {
      if (!isDrawing || !startPoint) return;
      const pointer = canvas.getPointer(e.e);
      const snappedPoint = {
        x: snapToGrid(pointer.x),
        y: snapToGrid(pointer.y),
      };

      // Remove temp objects
      canvas.remove(...canvas.getObjects().filter((obj) => (obj as any).isTemp));

      const currentFloorplan = useStore.getState().getCurrentFloorplan();
      if (!currentFloorplan) return;

      if (editorState.currentTool === 'line') {
        const wall: Wall = {
          id: `wall-${Date.now()}`,
          x1: startPoint.x,
          y1: startPoint.y,
          x2: snappedPoint.x,
          y2: snappedPoint.y,
          thickness: 3,
        };
        const line = new fabric.Line([wall.x1, wall.y1, wall.x2, wall.y2], {
          stroke: '#000000',
          strokeWidth: 3,
          selectable: true,
          evented: true,
        });
        (line as any).elementId = wall.id;
        (line as any).elementType = 'wall';
        canvas.add(line);
        objectMapRef.current.set(wall.id, line);
        updateFloorplan(currentFloorplan.id, {
          walls: [...currentFloorplan.walls, wall],
        });
        saveToHistory();
      } else if (editorState.currentTool === 'rectangle') {
        const width = snappedPoint.x - startPoint.x;
        const height = snappedPoint.y - startPoint.y;
        const room: Room = {
          id: `room-${Date.now()}`,
          name: 'Room',
          x: startPoint.x,
          y: startPoint.y,
          width,
          height,
        };
        const rect = new fabric.Rect({
          left: room.x,
          top: room.y,
          width: room.width,
          height: room.height,
          fill: 'rgba(99, 102, 241, 0.1)',
          stroke: '#6366f1',
          strokeWidth: 2,
          selectable: true,
          evented: true,
        });
        (rect as any).elementId = room.id;
        (rect as any).elementType = 'room';
        (rect as any).roomName = room.name;
        canvas.add(rect);
        objectMapRef.current.set(room.id, rect);

        // Add room label
        const text = new fabric.Text(room.name, {
          left: room.x + 10,
          top: room.y + 10,
          fontSize: 14,
          fill: '#6366f1',
          selectable: false,
          evented: false,
        });
        (text as any).roomId = room.id;
        canvas.add(text);

        updateFloorplan(currentFloorplan.id, {
          rooms: [...currentFloorplan.rooms, room],
        });
        saveToHistory();
      } else if (editorState.currentTool === 'door') {
        const door: Door = {
          id: `door-${Date.now()}`,
          x: snappedPoint.x,
          y: snappedPoint.y,
          rotation: 0,
          swing: 'left',
          width: 30,
        };
        const group = new fabric.Group([], {
          left: door.x,
          top: door.y,
          selectable: true,
          evented: true,
        });
        
        const doorRect = new fabric.Rect({
          width: door.width,
          height: 5,
          fill: '#8B4513',
          stroke: '#000000',
          strokeWidth: 1,
          originX: 'center',
          originY: 'center',
        });

        const swingArc = new fabric.Circle({
          radius: door.width,
          fill: 'transparent',
          stroke: '#000000',
          strokeWidth: 1,
          strokeDashArray: [5, 5],
          originX: 'center',
          originY: 'center',
        });

        group.addWithUpdate(doorRect);
        group.addWithUpdate(swingArc);
        (group as any).elementId = door.id;
        (group as any).elementType = 'door';
        (group as any).doorSwing = door.swing;
        
        canvas.add(group);
        objectMapRef.current.set(door.id, group);
        updateFloorplan(currentFloorplan.id, {
          doors: [...currentFloorplan.doors, door],
        });
        saveToHistory();
      } else if (editorState.currentTool === 'window') {
        const window: Window = {
          id: `window-${Date.now()}`,
          x: snappedPoint.x,
          y: snappedPoint.y,
          width: 60,
          rotation: 0,
        };
        const windowRect = new fabric.Rect({
          left: window.x,
          top: window.y,
          width: window.width,
          height: 10,
          fill: '#87CEEB',
          stroke: '#000000',
          strokeWidth: 1,
          selectable: true,
          evented: true,
        });
        (windowRect as any).elementId = window.id;
        (windowRect as any).elementType = 'window';
        canvas.add(windowRect);
        objectMapRef.current.set(window.id, windowRect);
        updateFloorplan(currentFloorplan.id, {
          windows: [...currentFloorplan.windows, window],
        });
        saveToHistory();
      } else if (editorState.currentTool === 'label') {
        const text = prompt('Enter label text:');
        if (text) {
          const label: Label = {
            id: `label-${Date.now()}`,
            text,
            x: snappedPoint.x,
            y: snappedPoint.y,
            fontSize: 16,
          };
          const fabricText = new fabric.Text(label.text, {
            left: label.x,
            top: label.y,
            fontSize: 16,
            fill: '#000000',
            selectable: true,
            evented: true,
          });
          (fabricText as any).elementId = label.id;
          (fabricText as any).elementType = 'label';
          canvas.add(fabricText);
          objectMapRef.current.set(label.id, fabricText);
          updateFloorplan(currentFloorplan.id, {
            labels: [...currentFloorplan.labels, label],
          });
          saveToHistory();
        }
      } else if (editorState.currentTool === 'measure') {
        // Create measurement line
        const dx = snappedPoint.x - startPoint.x;
        const dy = snappedPoint.y - startPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const inches = Math.round(distance);
        const feet = Math.floor(inches / 12);
        const remainingInches = inches % 12;
        const measurementText = remainingInches > 0 
          ? `${feet}' ${remainingInches}"`
          : `${feet}'`;

        const line = new fabric.Line([startPoint.x, startPoint.y, snappedPoint.x, snappedPoint.y], {
          stroke: '#ff6b6b',
          strokeWidth: 2,
          strokeDashArray: [5, 5],
          selectable: true,
          evented: true,
        });
        (line as any).elementId = `measure-${Date.now()}`;
        (line as any).elementType = 'measure';
        (line as any).measurement = measurementText;
        canvas.add(line);

        // Add measurement label
        const midX = (startPoint.x + snappedPoint.x) / 2;
        const midY = (startPoint.y + snappedPoint.y) / 2;
        const text = new fabric.Text(measurementText, {
          left: midX,
          top: midY - 20,
          fontSize: 12,
          fill: '#ff6b6b',
          backgroundColor: 'white',
          selectable: false,
          evented: false,
        });
        (text as any).measureId = (line as any).elementId;
        canvas.add(text);
        canvas.renderAll();
        saveToHistory();
      }

      setIsDrawing(false);
      setStartPoint(null);
      canvas.renderAll();
    });
  };

  const updateCanvasForTool = (canvas: fabric.Canvas, tool: ToolType) => {
    if (tool === 'select') {
      canvas.isDrawingMode = false;
      canvas.selection = true;
      canvas.forEachObject((obj) => {
        if (!(obj as any).isBackground) {
          obj.selectable = true;
          obj.evented = true;
        }
      });
    } else if (tool === 'pencil') {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.width = 2;
      canvas.freeDrawingBrush.color = '#000000';
    } else if (tool === 'eraser') {
      canvas.isDrawingMode = false;
      canvas.selection = true;
    } else {
      canvas.isDrawingMode = false;
      canvas.selection = false;
    }
  };

  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    updateCanvasForTool(fabricCanvasRef.current, editorState.currentTool);
  }, [editorState.currentTool]);

  // Handle zoom changes
  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    fabricCanvasRef.current.setZoom(currentZoom);
    fabricCanvasRef.current.renderAll();
    onZoomChange?.(currentZoom);
  }, [currentZoom, onZoomChange]);

  // Handle furniture selection
  useEffect(() => {
    if (onFurnitureSelect && editorState.currentTool === 'select') {
      // Furniture placement will be handled in mouse events
    }
  }, [onFurnitureSelect, editorState.currentTool]);

  // Draw grid
  useEffect(() => {
    if (!fabricCanvasRef.current || !editorState.showGrid) return;

    const canvas = fabricCanvasRef.current;
    const gridSize = editorState.gridSize;

    // Remove existing grid
    const gridObjects = canvas.getObjects().filter((obj) => (obj as any).isGrid);
    canvas.remove(...gridObjects);

    // Draw grid lines
    for (let x = 0; x < canvas.width!; x += gridSize) {
      const line = new fabric.Line([x, 0, x, canvas.height!], {
        stroke: '#e5e7eb',
        strokeWidth: 1,
        selectable: false,
        evented: false,
      });
      (line as any).isGrid = true;
      canvas.add(line);
    }

    for (let y = 0; y < canvas.height!; y += gridSize) {
      const line = new fabric.Line([0, y, canvas.width!, y], {
        stroke: '#e5e7eb',
        strokeWidth: 1,
        selectable: false,
        evented: false,
      });
      (line as any).isGrid = true;
      canvas.add(line);
    }

    canvas.renderAll();
  }, [editorState.showGrid, editorState.gridSize]);

  const handleZoomIn = () => {
    setCurrentZoom((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setCurrentZoom((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setCurrentZoom(1);
  };

  // Expose zoom controls
  useEffect(() => {
    (window as any).canvasZoom = {
      zoomIn: handleZoomIn,
      zoomOut: handleZoomOut,
      reset: handleResetZoom,
      zoom: currentZoom,
    };
  }, [currentZoom]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} />
    </div>
  );
}

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import toast from 'react-hot-toast';

export function useKeyboardShortcuts() {
  const {
    editorState,
    setEditorTool,
    setEditorState,
    getCurrentFloorplan,
    updateFloorplan,
  } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      // Tool shortcuts
      if (!ctrlOrCmd && !e.shiftKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'v':
            e.preventDefault();
            setEditorTool('select');
            break;
          case 'l':
            e.preventDefault();
            setEditorTool('line');
            break;
          case 'r':
            e.preventDefault();
            setEditorTool('rectangle');
            break;
          case 'd':
            e.preventDefault();
            setEditorTool('door');
            break;
          case 'w':
            e.preventDefault();
            setEditorTool('window');
            break;
          case 't':
            e.preventDefault();
            setEditorTool('label');
            break;
          case 'p':
            e.preventDefault();
            setEditorTool('pencil');
            break;
          case 'e':
            e.preventDefault();
            setEditorTool('eraser');
            break;
          case 'm':
            e.preventDefault();
            setEditorTool('measure');
            break;
          case 'g':
            e.preventDefault();
            setEditorState({ showGrid: !editorState.showGrid });
            break;
          case 's':
            if (!ctrlOrCmd) {
              e.preventDefault();
              setEditorState({ snapToGrid: !editorState.snapToGrid });
            }
            break;
          case 'delete':
          case 'backspace':
            e.preventDefault();
            // Delete selected elements (handled by canvas)
            const deleteEvent = new CustomEvent('deleteSelected');
            window.dispatchEvent(deleteEvent);
            break;
          case '+':
          case '=':
            if (ctrlOrCmd) {
              e.preventDefault();
              const zoomIn = (window as any).canvasZoom?.zoomIn;
              if (zoomIn) zoomIn();
            }
            break;
          case '-':
            if (ctrlOrCmd) {
              e.preventDefault();
              const zoomOut = (window as any).canvasZoom?.zoomOut;
              if (zoomOut) zoomOut();
            }
            break;
          case '0':
            if (ctrlOrCmd) {
              e.preventDefault();
              const resetZoom = (window as any).canvasZoom?.reset;
              if (resetZoom) resetZoom();
            }
            break;
        }
      }

      // Command shortcuts
      if (ctrlOrCmd) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            const floorplan = getCurrentFloorplan();
            if (floorplan) {
              updateFloorplan(floorplan.id, {
                updatedAt: new Date().toISOString(),
              });
              toast.success('Saved!');
            }
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              // Redo
              const redoEvent = new CustomEvent('redo');
              window.dispatchEvent(redoEvent);
            } else {
              // Undo
              const undoEvent = new CustomEvent('undo');
              window.dispatchEvent(undoEvent);
            }
            break;
          case 'e':
            e.preventDefault();
            // Export
            const exportEvent = new CustomEvent('export');
            window.dispatchEvent(exportEvent);
            break;
          case 'c':
            e.preventDefault();
            // Copy
            const copyEvent = new CustomEvent('copy');
            window.dispatchEvent(copyEvent);
            break;
          case 'v':
            if (ctrlOrCmd) {
              e.preventDefault();
              // Paste
              const pasteEvent = new CustomEvent('paste');
              window.dispatchEvent(pasteEvent);
            } else {
              // Select tool (handled above)
            }
            break;
          case 'd':
            if (ctrlOrCmd) {
              e.preventDefault();
              // Duplicate
              const duplicateEvent = new CustomEvent('duplicate');
              window.dispatchEvent(duplicateEvent);
            } else {
              // Door tool (handled above)
            }
            break;
          case '/':
            e.preventDefault();
            // Show shortcuts help
            toast('Keyboard shortcuts: V=Select, L=Line, R=Rectangle, D=Door, W=Window, T=Label, M=Measure, P=Pencil, E=Eraser, G=Grid, S=Snap', {
              duration: 5000,
              icon: '⌨️',
            });
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editorState, setEditorTool, setEditorState, getCurrentFloorplan, updateFloorplan]);
}


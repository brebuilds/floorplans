'use client';

import { X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { category: 'Tools', items: [
      { key: 'V', description: 'Select tool' },
      { key: 'L', description: 'Line/Wall tool' },
      { key: 'R', description: 'Rectangle/Room tool' },
      { key: 'D', description: 'Door tool' },
      { key: 'W', description: 'Window tool' },
      { key: 'T', description: 'Text/Label tool' },
      { key: 'M', description: 'Measure tool' },
      { key: 'P', description: 'Pencil tool' },
      { key: 'E', description: 'Eraser tool' },
    ]},
    { category: 'Actions', items: [
      { key: 'Ctrl/Cmd + S', description: 'Save' },
      { key: 'Ctrl/Cmd + Z', description: 'Undo' },
      { key: 'Ctrl/Cmd + Shift + Z', description: 'Redo' },
      { key: 'Ctrl/Cmd + C', description: 'Copy' },
      { key: 'Ctrl/Cmd + V', description: 'Paste' },
      { key: 'Ctrl/Cmd + D', description: 'Duplicate' },
      { key: 'Delete/Backspace', description: 'Delete selected' },
      { key: 'Ctrl/Cmd + E', description: 'Export menu' },
    ]},
    { category: 'View', items: [
      { key: 'G', description: 'Toggle grid' },
      { key: 'S', description: 'Toggle snap to grid' },
      { key: 'Ctrl/Cmd + +', description: 'Zoom in' },
      { key: 'Ctrl/Cmd + -', description: 'Zoom out' },
      { key: 'Ctrl/Cmd + 0', description: 'Reset zoom' },
      { key: 'Ctrl/Cmd + /', description: 'Show this help' },
    ]},
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          {shortcuts.map((category) => (
            <div key={category.category} className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{category.category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {category.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <span className="text-gray-600">{item.description}</span>
                    <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono text-gray-800">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


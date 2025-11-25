# Changelog

## [Unreleased] - 2024-11-24

### Added
- **Undo/Redo System**: Full history stack with keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
- **Canvas State Synchronization**: Real-time updates between canvas and data model
- **Room Editing**: 
  - Double-click rooms to rename
  - Edit rooms in metadata panel
  - View room dimensions and area
  - Delete rooms with Delete key
- **Background Image Layer**: Upload and manage background images for tracing floorplans
- **Export Functionality**: 
  - Export as PNG (high resolution)
  - Export as SVG (vector format)
  - Export as PDF (print-ready)
- **Keyboard Shortcuts**: Full keyboard support for all tools and actions
- **Toast Notifications**: User-friendly success/error messages using react-hot-toast
- **Loading States**: Visual feedback during file uploads and operations
- **Measurement Tools**: Measure distances with visual feedback (feet and inches)
- **Improved Door/Window Tools**: Better visualization with door swing arcs
- **Version History**: Auto-save versions every 30 seconds
- **Enhanced Object Selection**: Multi-select, delete, and edit objects
- **Grid & Snap Improvements**: Better grid rendering and snap-to-grid functionality

### Changed
- Enhanced DrawingCanvas component with better state management
- Improved FloorplanEditor with undo/redo buttons and export menu
- Better error handling throughout the application
- Improved file upload with loading states

### Fixed
- Canvas not updating when floorplan data changes
- Export functionality now properly implemented
- Room editing now works correctly
- Object deletion now properly syncs with data model

### Technical
- Added Zustand history store for undo/redo
- Added version history utilities
- Added keyboard shortcuts hook
- Added toast notification system
- Improved TypeScript types


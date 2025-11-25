# Floorplans Studio

A web-based application designed to transform napkin sketches, photos of drawn floorplans, PDF building outlines, or full site plans into clean, professional-grade architectural floorplans and site maps.

## Features

### Core Functionality
- **Multi-Building Support**: Handle entire apartment complexes with multiple buildings
- **Multiple Floorplans**: Support different floors, unit types, and variations per building
- **Rich Metadata**: Track unit numbers, bedrooms, bathrooms, square footage, and custom notes
- **Drawing Tools**: Intuitive tools for drawing walls, rooms, doors, windows, and labels
- **AI Cleanup**: Clean up messy sketches into professional floorplans (mock implementation ready for AI integration)
- **OCR Support**: Extract text and labels from uploaded images (mock implementation ready for OCR integration)
- **Export Options**: Export as SVG, PNG, or PDF

### Advanced Features ✨
- **Undo/Redo System**: Full history stack with keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
- **Canvas State Synchronization**: Real-time updates between canvas and data model
- **Room Editing**: Double-click to rename rooms, edit in metadata panel, view room areas
- **Background Image Layer**: Upload and manage background images for tracing
- **Measurement Tools**: Measure distances with visual feedback (feet and inches)
- **Improved Door/Window Tools**: Better visualization with door swing arcs
- **Keyboard Shortcuts**: Full keyboard support for all tools and actions
- **Toast Notifications**: User-friendly success/error messages
- **Loading States**: Visual feedback during operations
- **Version History**: Auto-save versions every 30 seconds
- **Object Selection**: Multi-select, delete, and edit objects
- **Grid & Snap**: Toggle grid visibility and snap-to-grid functionality

### User Experience
- Simple, friendly interface designed for non-designers
- Drag-and-drop file uploads
- Grid and snap-to-grid functionality
- Real-time editing with visual feedback
- Organized project structure: Complexes → Buildings → Floorplans

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
floorplans/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page (routing logic)
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ProjectSelector.tsx    # Project/complex selection
│   ├── SitePlanView.tsx       # Site plan viewing and editing
│   ├── BuildingView.tsx       # Building management
│   ├── FloorplanEditor.tsx    # Main floorplan editor
│   ├── DrawingCanvas.tsx      # Canvas drawing component
│   ├── MetadataPanel.tsx      # Metadata editing panel
│   └── FileUpload.tsx         # File upload component
├── store/                 # State management
│   └── useStore.ts        # Zustand store
├── types/                 # TypeScript types
│   └── index.ts           # Type definitions
└── package.json           # Dependencies
```

## Usage

### Creating a Project

1. Start by creating a new project (complex)
2. Upload a site plan or sketch
3. Select the project type:
   - Multiple Buildings / Site Plan
   - Single Building (Multiple Layouts)
   - Single Layout

### Working with Site Plans

1. Upload your site plan image
2. Use the "Clean Site Plan" button to process the image
3. Click "Detect Buildings" to automatically identify buildings (or manually trace)
4. Click on buildings to select and edit them

### Creating Floorplans

1. Select a building from the site plan
2. Click "Add Floorplan" to create a new floorplan variant
3. Enter metadata (floor number, unit numbers, bedrooms, bathrooms, etc.)
4. Use the drawing tools to create the floorplan:
   - **Select (V)**: Select and move elements
   - **Wall (L)**: Draw walls/lines
   - **Room (R)**: Draw rectangular rooms
   - **Door (D)**: Add doors with swing visualization
   - **Window (W)**: Add windows
   - **Label (T)**: Add text labels
   - **Measure (M)**: Measure distances
   - **Pencil (P)**: Freehand drawing
   - **Eraser (E)**: Erase elements

5. **Edit Rooms**: Double-click any room to rename it, or edit in the metadata panel
6. **Delete Elements**: Select any element and press Delete/Backspace
7. **Background Image**: Upload a background image in the metadata panel for tracing

### Editing Metadata

Click the edit icon in the metadata panel to modify:
- Building ID
- Floor number
- Unit numbers
- Address
- Floorplan type
- Bedrooms/Bathrooms
- Square footage
- Custom notes

### Keyboard Shortcuts

- **V** - Select tool
- **L** - Line/Wall tool
- **R** - Rectangle/Room tool
- **D** - Door tool
- **W** - Window tool
- **T** - Text/Label tool
- **M** - Measure tool
- **P** - Pencil tool
- **E** - Eraser tool
- **G** - Toggle grid
- **S** - Toggle snap to grid
- **Delete/Backspace** - Delete selected elements
- **Ctrl/Cmd+S** - Save
- **Ctrl/Cmd+Z** - Undo
- **Ctrl/Cmd+Shift+Z** - Redo
- **Ctrl/Cmd+E** - Export menu
- **Ctrl/Cmd+/** - Show keyboard shortcuts help

## Technology Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Zustand**: Lightweight state management
- **Fabric.js**: Canvas manipulation and drawing
- **Lucide React**: Icon library

## Data Persistence

Data is stored in browser localStorage using Zustand's persist middleware. All projects, site plans, buildings, and floorplans are automatically saved.

## Recent Improvements ✅

- ✅ Undo/Redo system with full history
- ✅ Canvas state synchronization
- ✅ Room editing (rename, resize, delete)
- ✅ Background image layer support
- ✅ Export functionality (SVG, PNG, PDF)
- ✅ Keyboard shortcuts
- ✅ Loading states and error handling
- ✅ Toast notifications
- ✅ Measurement tools
- ✅ Improved door/window visualization
- ✅ Version history auto-save
- ✅ Enhanced object selection and editing

## Future Enhancements

- [ ] Real AI cleanup integration (currently mocked)
- [ ] Real OCR integration (currently mocked)
- [ ] Advanced building detection algorithms
- [ ] More drawing tools (appliances, furniture, etc.)
- [ ] Print preview
- [ ] Collaboration features
- [ ] Cloud storage integration
- [ ] Mobile app support
- [ ] Advanced measurement tools (area calculation, etc.)

## License

ISC


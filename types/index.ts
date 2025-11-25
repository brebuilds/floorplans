// Core data types for the floorplan application

export type ProjectType = 'multi-building' | 'single-building' | 'single-layout';

export interface OCRResult {
  text: string;
  boundingBox: { x: number; y: number; width: number; height: number };
  confidence: number;
  type: 'label' | 'measurement' | 'note';
}

export interface BuildingOutline {
  id: string;
  name: string;
  path: string; // SVG path or coordinates
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FloorplanMetadata {
  buildingId?: string;
  floorNumber?: string;
  unitNumbers?: string[];
  address?: string;
  floorplanType?: string; // A/B/C/D
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  customNotes?: string;
}

export interface Room {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type?: 'room' | 'closet' | 'bathroom' | 'kitchen' | 'other';
}

export interface Wall {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness?: number;
}

export interface Door {
  id: string;
  x: number;
  y: number;
  rotation: number;
  swing: 'left' | 'right';
  width?: number;
}

export interface Window {
  id: string;
  x: number;
  y: number;
  width: number;
  rotation: number;
}

export interface Label {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize?: number;
}

export interface DrawingElement {
  id: string;
  type: 'line' | 'rectangle' | 'path';
  path?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  stroke?: string;
  strokeWidth?: number;
}

export interface Furniture {
  id: string;
  type: string; // sofa, bed, chair, etc.
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export interface Floorplan {
  id: string;
  buildingId: string;
  metadata: FloorplanMetadata;
  rooms: Room[];
  walls: Wall[];
  doors: Door[];
  windows: Window[];
  labels: Label[];
  drawings: DrawingElement[];
  furniture?: Furniture[];
  logo?: string; // Base64 or URL
  baseImage?: string; // Base64 or URL
  cleanedSVG?: string;
  ocrResults?: OCRResult[];
  versionHistory?: FloorplanVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface FloorplanVersion {
  id: string;
  timestamp: string;
  data: Omit<Floorplan, 'versionHistory'>;
  note?: string;
}

export interface Building {
  id: string;
  name: string;
  outline: BuildingOutline;
  cleanedOutline?: string; // SVG
  floorplans: Floorplan[];
  sitePlanId: string;
}

export interface SitePlan {
  id: string;
  name: string;
  originalUpload: string; // Base64 or URL
  cleanedSVG?: string;
  buildings: Building[];
  projectType: ProjectType;
  createdAt: string;
  updatedAt: string;
}

export interface Complex {
  id: string;
  name: string;
  sitePlans: SitePlan[];
  createdAt: string;
  updatedAt: string;
}

export type ToolType = 
  | 'select'
  | 'line'
  | 'rectangle'
  | 'door'
  | 'window'
  | 'label'
  | 'pencil'
  | 'eraser'
  | 'measure';

export interface EditorState {
  currentTool: ToolType;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  selectedElementId?: string;
  selectedElementIds?: string[]; // Multi-select
}

export interface HistoryState {
  past: Floorplan[];
  present: Floorplan;
  future: Floorplan[];
}

export interface Measurement {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  distance?: number;
  unit?: 'ft' | 'm';
}


import { Floorplan, FloorplanVersion } from '@/types';

const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
const MAX_VERSIONS = 20;

export function createVersion(floorplan: Floorplan): FloorplanVersion {
  const { versionHistory, ...dataWithoutHistory } = floorplan;
  return {
    id: `version-${Date.now()}`,
    timestamp: new Date().toISOString(),
    data: dataWithoutHistory,
  };
}

export function addVersionToHistory(
  floorplan: Floorplan,
  version: FloorplanVersion
): Floorplan {
  const history = floorplan.versionHistory || [];
  const newHistory = [version, ...history].slice(0, MAX_VERSIONS);
  
  return {
    ...floorplan,
    versionHistory: newHistory,
  };
}

export function shouldAutoSave(lastSaveTime: string | undefined): boolean {
  if (!lastSaveTime) return true;
  const lastSave = new Date(lastSaveTime).getTime();
  const now = Date.now();
  return now - lastSave > AUTO_SAVE_INTERVAL;
}


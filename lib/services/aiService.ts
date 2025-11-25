/**
 * AI Service abstraction layer
 * Provides a clean interface for AI operations
 */

import { OCRResult, BuildingOutline } from '@/types';

const API_BASE = '/api/ai';

export interface CleanupResponse {
  success: boolean;
  description: string;
  cleanedSVG?: string | null;
  error?: string;
}

export interface OCRResponse {
  success: boolean;
  results: OCRResult[];
  error?: string;
}

export interface BuildingDetectionResponse {
  success: boolean;
  buildings: BuildingOutline[];
  error?: string;
}

/**
 * Clean up a floorplan or site plan image using AI
 */
export async function cleanupImage(
  imageBase64: string,
  type: 'floorplan' | 'site-plan' = 'floorplan'
): Promise<CleanupResponse> {
  try {
    const response = await fetch(`${API_BASE}/cleanup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64,
        type,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        description: '',
        error: error.error || 'Failed to cleanup image',
      };
    }

    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      description: '',
      error: error.message || 'Network error',
    };
  }
}

/**
 * Extract text from an image using OCR
 */
export async function extractText(imageBase64: string): Promise<OCRResponse> {
  try {
    const response = await fetch(`${API_BASE}/ocr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        results: [],
        error: error.error || 'Failed to extract text',
      };
    }

    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      results: [],
      error: error.message || 'Network error',
    };
  }
}

/**
 * Detect buildings in a site plan image
 */
export async function detectBuildings(imageBase64: string): Promise<BuildingDetectionResponse> {
  try {
    const response = await fetch(`${API_BASE}/detect-buildings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        buildings: [],
        error: error.error || 'Failed to detect buildings',
      };
    }

    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      buildings: [],
      error: error.message || 'Network error',
    };
  }
}

/**
 * Helper to convert image file to base64
 */
export function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Helper to convert canvas to base64
 */
export function canvasToBase64(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png');
}


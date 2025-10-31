import type { City } from '../types/city';
import type { Trip } from '../types/trip';
import type { Preferences } from '../types/preferences';

export type ProgressCallback = (current: number, total: number, phase: string) => void;

export async function exportToJson(
  cities: City[],
  trips: Trip[],
  preferences: Preferences,
  progressCallback?: ProgressCallback
): Promise<string> {
  progressCallback?.(0, 2, 'Preparing data');
  const data = {
    cities,
    trips,
    preferences,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };
  progressCallback?.(1, 2, 'Serializing data');
  return JSON.stringify(data, null, 2);
}


export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateFilename(prefix: string, extension: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${prefix}-${timestamp}.${extension}`;
}

export async function importFromJson(
  jsonContent: string,
  progressCallback?: ProgressCallback
): Promise<{ cities: City[]; trips: Trip[]; preferences?: Partial<Preferences> }> {
  progressCallback?.(0, 2, 'Parsing JSON');
  const data = JSON.parse(jsonContent);
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid JSON format');
  }
  progressCallback?.(1, 2, 'Processing data');
  return {
    cities: Array.isArray(data.cities) ? data.cities : [],
    trips: Array.isArray(data.trips) ? data.trips : [],
    preferences: data.preferences || {}
  };
}

export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

import type { CityRecord } from '../types/city';

export function formatCityName(record: CityRecord): string {
  return `${record.city}, ${record.country}`;
}

export function getCoordinates(record: CityRecord): [number, number] {
  return [record.lat, record.lng];
}


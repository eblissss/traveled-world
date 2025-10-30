import { describe, it, expect } from 'vitest';
import { formatCityName, getCoordinates } from '../../lib/geocoding';
import type { CityRecord } from '../../types/city';

describe('geocoding utilities', () => {
  const mockCityRecord: CityRecord = {
    city: 'Tokyo',
    city_ascii: 'Tokyo',
    lat: 35.6762,
    lng: 139.6503,
    country: 'Japan',
    iso2: 'JP',
    iso3: 'JPN',
    admin_name: 'Tokyo',
    capital: 'primary',
    population: 37977000
  };

  describe('formatCityName', () => {
    it('formats city name correctly', () => {
      const result = formatCityName(mockCityRecord);
      expect(result).toBe('Tokyo, Japan');
    });
  });

  describe('getCoordinates', () => {
    it('returns coordinates as tuple', () => {
      const result = getCoordinates(mockCityRecord);
      expect(result).toEqual([35.6762, 139.6503]);
      expect(result[0]).toBe(35.6762);
      expect(result[1]).toBe(139.6503);
    });

    it('returns correct type', () => {
      const result = getCoordinates(mockCityRecord);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });
  });
});


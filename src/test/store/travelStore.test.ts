import { describe, it, expect, beforeEach } from 'vitest';
import { useTravelStore } from '../../store/travelStore';
import type { City } from '../../types/city';

describe('TravelStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useTravelStore.setState({
      cities: [],
      trips: [],
      preferences: {
        defaultView: '3d',
        theme: 'dark',
        animationSpeed: 1.0
      }
    });
  });

  it('should add a city', () => {
    const city: City = {
      id: '1',
      name: 'Tokyo',
      country: 'Japan',
      coordinates: [35.6762, 139.6503],
      type: 'visited',
      lastVisited: '2024-01-01',
      dateAdded: new Date().toISOString()
    };

    useTravelStore.getState().addCity(city);
    const cities = useTravelStore.getState().cities;

    expect(cities).toHaveLength(1);
    expect(cities[0]).toEqual(city);
  });

  it('should prevent duplicate cities', () => {
    const city: City = {
      id: '1',
      name: 'Tokyo',
      country: 'Japan',
      coordinates: [35.6762, 139.6503],
      type: 'visited',
      lastVisited: '2024-01-01',
      dateAdded: new Date().toISOString()
    };

    useTravelStore.getState().addCity(city);
    
    const duplicateCity: City = {
      id: '2',
      name: 'Tokyo',
      country: 'Japan',
      coordinates: [35.6762, 139.6503], // Same coordinates
      type: 'visited',
      lastVisited: '2024-01-02',
      dateAdded: new Date().toISOString()
    };

    let errorThrown = false;
    try {
      useTravelStore.getState().addCity(duplicateCity);
    } catch (error) {
      errorThrown = true;
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('already in your list');
    }
    
    expect(errorThrown).toBe(true);
    const cities = useTravelStore.getState().cities;
    expect(cities).toHaveLength(1);
  });

  it('should delete a city', () => {
    const city: City = {
      id: '1',
      name: 'Tokyo',
      country: 'Japan',
      coordinates: [35.6762, 139.6503],
      type: 'visited',
      lastVisited: '2024-01-01',
      dateAdded: new Date().toISOString()
    };

    useTravelStore.getState().addCity(city);
    useTravelStore.getState().deleteCity('1');
    
    const cities = useTravelStore.getState().cities;
    expect(cities).toHaveLength(0);
  });

  it('should update preferences', () => {
    useTravelStore.getState().updatePreferences({ theme: 'light' });
    const preferences = useTravelStore.getState().preferences;
    
    expect(preferences.theme).toBe('light');
    expect(preferences.defaultView).toBe('3d'); // Other preferences should remain
  });
});


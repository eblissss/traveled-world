import { describe, it, expect, beforeEach } from 'vitest';
import { useTravelStore } from '../../store/travelStore';
import type { City } from '../../types/city';
import type { Trip } from '../../types/trip';

describe('TravelStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useTravelStore.setState({
      cities: [],
      trips: [],
      preferences: {
      defaultView: '3d',
      theme: 'dark',
      animationSpeed: 1.0,
      searchDebounceMs: 50
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

  it('should support undo/redo', () => {
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
    expect(useTravelStore.getState().cities).toHaveLength(1);
    expect(useTravelStore.getState().canUndo()).toBe(true);

    useTravelStore.getState().undo();
    expect(useTravelStore.getState().cities).toHaveLength(0);
    expect(useTravelStore.getState().canRedo()).toBe(true);

    useTravelStore.getState().redo();
    expect(useTravelStore.getState().cities).toHaveLength(1);
  });

  it('should add trips', () => {
    const city1: City = {
      id: '1',
      name: 'Tokyo',
      country: 'Japan',
      coordinates: [35.6762, 139.6503],
      type: 'visited',
      lastVisited: '2024-01-01',
      dateAdded: new Date().toISOString()
    };

    const city2: City = {
      id: '2',
      name: 'Paris',
      country: 'France',
      coordinates: [48.8566, 2.3522],
      type: 'visited',
      lastVisited: '2024-01-02',
      dateAdded: new Date().toISOString()
    };

    useTravelStore.getState().addCity(city1);
    useTravelStore.getState().addCity(city2);

    const trip: Trip = {
      id: 'trip-1',
      name: 'Asia Europe Trip',
      cityIds: ['1', '2'],
      color: '#3B82F6',
      createdAt: new Date().toISOString()
    };

    useTravelStore.getState().addTrip(trip);
    const trips = useTravelStore.getState().trips;
    
    expect(trips).toHaveLength(1);
    expect(trips[0].name).toBe('Asia Europe Trip');
  });

  it('should update city', () => {
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
    useTravelStore.getState().updateCity('1', { type: 'lived' });
    
    const updatedCity = useTravelStore.getState().cities[0];
    expect(updatedCity.type).toBe('lived');
  });

  it('should delete trip when city is deleted', () => {
    const city1: City = {
      id: '1',
      name: 'Tokyo',
      country: 'Japan',
      coordinates: [35.6762, 139.6503],
      type: 'visited',
      lastVisited: '2024-01-01',
      dateAdded: new Date().toISOString()
    };

    useTravelStore.getState().addCity(city1);

    const trip: Trip = {
      id: 'trip-1',
      name: 'Test Trip',
      cityIds: ['1'],
      color: '#3B82F6',
      createdAt: new Date().toISOString()
    };

    useTravelStore.getState().addTrip(trip);
    useTravelStore.getState().deleteCity('1');
    
    const trips = useTravelStore.getState().trips;
    expect(trips[0].cityIds).toHaveLength(0);
  });
});


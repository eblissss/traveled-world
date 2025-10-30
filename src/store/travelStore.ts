import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { City } from '../types/city';
import type { Trip } from '../types/trip';
import type { Preferences } from '../types/preferences';

interface TravelState {
  cities: City[];
  trips: Trip[];
  preferences: Preferences;
  
  // Actions
  addCity: (city: City) => void;
  updateCity: (id: string, updates: Partial<City>) => void;
  deleteCity: (id: string) => void;
  addTrip: (trip: Trip) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  updatePreferences: (prefs: Partial<Preferences>) => void;
}

const defaultPreferences: Preferences = {
  defaultView: '3d',
  theme: 'dark',
  animationSpeed: 1.0
};

export const useTravelStore = create<TravelState>()(
  persist(
    (set) => ({
      cities: [],
      trips: [],
      preferences: defaultPreferences,

      addCity: (city) => set((state) => {
        // Prevent duplicates by checking coordinates
        const isDuplicate = state.cities.some(
          (c) =>
            Math.abs(c.coordinates[0] - city.coordinates[0]) < 0.01 &&
            Math.abs(c.coordinates[1] - city.coordinates[1]) < 0.01
        );
        
        if (isDuplicate) {
          // Return current state unchanged, error will be handled by caller
          throw new Error(`City "${city.name}" is already in your list`);
        }
        
        return {
          cities: [...state.cities, city]
        };
      }),

      updateCity: (id, updates) => set((state) => ({
        cities: state.cities.map((city) =>
          city.id === id ? { ...city, ...updates } : city
        )
      })),

      deleteCity: (id) => set((state) => ({
        cities: state.cities.filter((city) => city.id !== id),
        trips: state.trips.map((trip) => ({
          ...trip,
          cityIds: trip.cityIds.filter((cityId) => cityId !== id)
        }))
      })),

      addTrip: (trip) => set((state) => ({
        trips: [...state.trips, trip]
      })),

      updateTrip: (id, updates) => set((state) => ({
        trips: state.trips.map((trip) =>
          trip.id === id ? { ...trip, ...updates } : trip
        )
      })),

      deleteTrip: (id) => set((state) => ({
        trips: state.trips.filter((trip) => trip.id !== id)
      })),

      updatePreferences: (prefs) => set((state) => ({
        preferences: { ...state.preferences, ...prefs }
      }))
    }),
    {
      name: 'traveled-world-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);


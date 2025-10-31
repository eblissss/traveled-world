import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { City } from '../types/city';
import type { Trip } from '../types/trip';
import type { Preferences } from '../types/preferences';

interface HistoryState {
  cities: City[];
  trips: Trip[];
  timestamp: number;
}

interface TravelState {
  cities: City[];
  trips: Trip[];
  preferences: Preferences;
  history: HistoryState[];
  historyIndex: number;
  maxHistorySize: number;

  // Actions
  addCity: (city: City) => void;
  updateCity: (id: string, updates: Partial<City>) => void;
  deleteCity: (id: string) => void;
  addTrip: (trip: Trip) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  updatePreferences: (prefs: Partial<Preferences>) => void;

  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Import/Export
  importData: (data: { cities: City[]; trips: Trip[]; preferences?: Partial<Preferences> }) => void;
}

const defaultPreferences: Preferences = {
  defaultView: '3d',
  theme: 'dark',
  globeStyle: 'blue-marble',
  animationSpeed: 1.0,
  searchDebounceMs: 50,
  selectedTripId: null
};

// Efficient deep clone using structuredClone when available, fallback to JSON
const deepClone = <T>(obj: T): T => {
  if (typeof structuredClone === 'function') {
    return structuredClone(obj);
  }
  return JSON.parse(JSON.stringify(obj));
};

// Helper to create history snapshot
const createHistorySnapshot = (cities: City[], trips: Trip[]): HistoryState => ({
  cities: deepClone(cities),
  trips: deepClone(trips),
  timestamp: Date.now()
});

// Helper to add history snapshot and manage history size
const addToHistory = (state: TravelState, cities: City[], trips: Trip[]) => {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(createHistorySnapshot(cities, trips));

  // Limit history size by removing oldest entries beyond maxHistorySize
  if (newHistory.length > state.maxHistorySize) {
    newHistory.shift();
    return {
      history: newHistory,
      historyIndex: newHistory.length - 1
    };
  }

  return {
    history: newHistory,
    historyIndex: state.historyIndex + 1
  };
};

export const useTravelStore = create<TravelState>()(
  persist(
    (set, get) => {
      const initialHistory = [createHistorySnapshot([], [])];
      
      return {
        cities: [],
        trips: [],
        preferences: defaultPreferences,
        history: initialHistory,
        historyIndex: 0,
        maxHistorySize: 50,

        addCity: (city) => {
        const state = get();
        // Prevent duplicates by checking coordinates
        const duplicateCity = state.cities.find(
          (c) =>
            Math.abs(c.coordinates[0] - city.coordinates[0]) < 0.01 &&
            Math.abs(c.coordinates[1] - city.coordinates[1]) < 0.01
        );

        if (duplicateCity) {
          // Throw error with duplicate city info for UI feedback
          const error: Error & { duplicateCityId?: string } = new Error(
            `"${city.name}" is already in your list as "${duplicateCity.name}"`
          );
          error.duplicateCityId = duplicateCity.id;
          throw error;
        }

        const newCities = [...state.cities, city];
        const historyUpdate = addToHistory(state, newCities, state.trips);

        return set({
          cities: newCities,
          ...historyUpdate
        });
      },

      updateCity: (id, updates) => {
        const state = get();
        const newCities = state.cities.map((city) =>
          city.id === id ? { ...city, ...updates } : city
        );
        const historyUpdate = addToHistory(state, newCities, state.trips);

        return set({
          cities: newCities,
          ...historyUpdate
        });
      },

      deleteCity: (id) => {
        const state = get();
        const newCities = state.cities.filter((city) => city.id !== id);
        const newTrips = state.trips.map((trip) => ({
          ...trip,
          cityIds: trip.cityIds.filter((cityId) => cityId !== id)
        }));
        const historyUpdate = addToHistory(state, newCities, newTrips);

        return set({
          cities: newCities,
          trips: newTrips,
          ...historyUpdate
        });
      },

      addTrip: (trip) => {
        const state = get();
        const newTrips = [...state.trips, trip];
        const historyUpdate = addToHistory(state, state.cities, newTrips);

        return set({
          trips: newTrips,
          ...historyUpdate
        });
      },

      updateTrip: (id, updates) => {
        const state = get();
        const newTrips = state.trips.map((trip) =>
          trip.id === id ? { ...trip, ...updates } : trip
        );
        const historyUpdate = addToHistory(state, state.cities, newTrips);

        return set({
          trips: newTrips,
          ...historyUpdate
        });
      },

      deleteTrip: (id) => {
        const state = get();
        const newTrips = state.trips.filter((trip) => trip.id !== id);
        const historyUpdate = addToHistory(state, state.cities, newTrips);

        return set({
          trips: newTrips,
          ...historyUpdate
        });
      },

      updatePreferences: (prefs) => set((state) => ({
        preferences: { ...state.preferences, ...prefs }
      })),
      
      undo: () => {
        const state = get();
        if (state.historyIndex > 0) {
          const previousState = state.history[state.historyIndex - 1];
          set({
            cities: previousState.cities,
            trips: previousState.trips,
            historyIndex: state.historyIndex - 1
          });
        }
      },

      redo: () => {
        const state = get();
        if (state.historyIndex < state.history.length - 1) {
          const nextState = state.history[state.historyIndex + 1];
          set({
            cities: nextState.cities,
            trips: nextState.trips,
            historyIndex: state.historyIndex + 1
          });
        }
      },
      
      canUndo: () => {
        const state = get();
        return state.historyIndex > 0;
      },
      
      canRedo: () => {
        const state = get();
        return state.historyIndex < state.history.length - 1;
      },
      
      importData: (data) => {
        const state = get();
        // Validate data
        const newCities = Array.isArray(data.cities) ? data.cities : state.cities;
        const newTrips = Array.isArray(data.trips) ? data.trips : state.trips;
        const newPreferences = data.preferences 
          ? { ...state.preferences, ...data.preferences }
          : state.preferences;
        
        // Create a new history snapshot for import
        const newHistory = [createHistorySnapshot(newCities, newTrips)];
        
        return set({
          cities: newCities,
          trips: newTrips,
          preferences: newPreferences,
          history: newHistory,
          historyIndex: 0
        });
      }
    };
  },
    {
      name: 'traveled-world-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Computed selectors
export const useFilteredCities = () => {
  return useTravelStore((state) => {
    const { cities, preferences, trips } = state;
    if (!preferences.selectedTripId) {
      return cities;
    }

    // Find the selected trip
    const selectedTrip = trips.find(trip => trip.id === preferences.selectedTripId);
    if (!selectedTrip) {
      return cities;
    }

    // Filter cities to only show those in the selected trip
    return cities.filter(city => selectedTrip.cityIds.includes(city.id));
  });
};

export const useCanUndo = () => useTravelStore((state) => state.canUndo());
export const useCanRedo = () => useTravelStore((state) => state.canRedo());


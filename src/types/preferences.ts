export interface Preferences {
  defaultView: '2d' | '3d';
  theme: 'dark' | 'light' | 'satellite' | 'minimal';
  globeStyle?: 'blue-marble' | 'topographic' | 'vector' | 'satellite' | 'night';
  animationSpeed: number; // 0.5 - 2.0
  searchDebounceMs: number; // Search debounce delay in milliseconds
  selectedTripId?: string | null; // Currently selected trip (null = show all cities)
}

export interface UserData {
  cities: import('./city').City[];
  trips: import('./trip').Trip[];
  preferences: Preferences;
}


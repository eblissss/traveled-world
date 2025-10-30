export interface Preferences {
  defaultView: '2d' | '3d';
  theme: 'dark' | 'light' | 'satellite';
  animationSpeed: number; // 0.5 - 2.0
}

export interface UserData {
  cities: import('./city').City[];
  trips: import('./trip').Trip[];
  preferences: Preferences;
}


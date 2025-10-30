export interface CityRecord {
  city: string;
  city_ascii: string;
  lat: number;
  lng: number;
  country: string;
  iso2: string;
  iso3: string;
  admin_name: string;
  capital: string;
  population: number;
}

export interface City {
  id: string;
  name: string;
  country: string;
  coordinates: [number, number]; // [lat, lng]
  type: 'visited' | 'lived';
  lastVisited: string; // ISO 8601: "2024-10-15"
  dateAdded: string; // ISO 8601: "2025-10-30T12:39:00Z"
}


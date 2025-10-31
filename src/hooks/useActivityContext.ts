import { useMemo } from 'react';
import type { City } from '../types/city';
import type { Trip } from '../types/trip';

interface ContextualInfo {
  totalCities: number;
  uniqueCountries: number;
  continents: number;
  activeTrips: number;
  visitedCities: number;
  livedCities: number;
  citiesAddedThisWeek: number;
  citiesAddedToday: number;
  futureVisits: City[];
  totalTrips: number;
}

export function useActivityContext(
  cities: City[],
  trips: Trip[],
) {
  const contextualInfo: ContextualInfo = useMemo(() => {
    const totalCities = cities.length;
    const uniqueCountries = new Set(cities.map(city => city.country)).size;

    // Simple continent calculation (this could be improved with proper continent data)
    const continents = new Set(
      cities.map(city => {
        // Very basic continent mapping - this should be improved
        const lat = city.coordinates[0];
        if (lat >= -60 && lat <= 80) {
          if (city.country.includes('America') || city.country === 'Canada' || city.country === 'Mexico' || city.country === 'Brazil') return 'Americas';
          if (city.country.includes('Europe') || ['France', 'Germany', 'Italy', 'Spain', 'UK', 'Russia'].includes(city.country)) return 'Europe';
          if (city.country.includes('Asia') || ['China', 'Japan', 'India', 'Thailand'].includes(city.country)) return 'Asia';
          if (city.country.includes('Africa') || ['Egypt', 'Morocco', 'South Africa'].includes(city.country)) return 'Africa';
          if (city.country.includes('Australia') || city.country === 'New Zealand') return 'Oceania';
        }
        return 'Unknown';
      })
    ).size;

    const activeTrips = trips.filter(trip => trip.cityIds.length > 0).length;
    const visitedCities = cities.filter(city => city.type === 'visited').length;
    const livedCities = cities.filter(city => city.type === 'lived').length;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const citiesAddedThisWeek = cities.filter(city =>
      new Date(city.dateAdded) >= weekAgo
    ).length;

    const citiesAddedToday = cities.filter(city =>
      new Date(city.dateAdded) >= todayStart
    ).length;

    const futureVisits = cities
      .filter(city => new Date(city.lastVisited) > now)
      .sort((a, b) => new Date(a.lastVisited).getTime() - new Date(b.lastVisited).getTime());

    const totalTrips = trips.length;

    return {
      totalCities,
      uniqueCountries,
      continents,
      activeTrips,
      visitedCities,
      livedCities,
      citiesAddedThisWeek,
      citiesAddedToday,
      futureVisits,
      totalTrips
    };
  }, [cities, trips]);  

  const getActivitySummary = useMemo(() => ({
    cities: cities.length,
    countries: contextualInfo.uniqueCountries,
    continents: contextualInfo.continents,
    trips: trips.length,
    recentActivity: contextualInfo.citiesAddedThisWeek
  }), [cities.length, contextualInfo, trips.length]);

  return {
    contextualInfo,
    getActivitySummary
  };
}

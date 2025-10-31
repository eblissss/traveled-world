import { useEffect, useRef, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import type { City } from '../../types/city';

interface PerformanceManagerProps {
  cities: City[];
  onVisibleCitiesChange?: (visibleCities: City[]) => void;
}

/**
 * Performance manager for optimizing map rendering with large datasets
 * Implements viewport culling, marker clustering optimization, and memory management
 */
export function PerformanceManager({ cities, onVisibleCitiesChange }: PerformanceManagerProps) {
  const map = useMap();
  const visibleCitiesRef = useRef<City[]>([]);
  const lastViewportRef = useRef<{ bounds: L.LatLngBounds; zoom: number } | null>(null);
  const lastCitiesRef = useRef<City[]>([]);
  const rafRef = useRef<number>();

  // Viewport culling algorithm
  const updateVisibleCities = useCallback(() => {
    if (!map) return;

    const bounds = map.getBounds();
    const zoom = map.getZoom();

    // Check if cities changed or viewport actually changed significantly
    const citiesChanged = lastCitiesRef.current.length !== cities.length ||
      !lastCitiesRef.current.every((city, index) =>
        city.id === cities[index]?.id &&
        city.coordinates[0] === cities[index]?.coordinates[0] &&
        city.coordinates[1] === cities[index]?.coordinates[1] &&
        city.name === cities[index]?.name &&
        city.type === cities[index]?.type
      );

    if (lastViewportRef.current && !citiesChanged) {
      const lastBounds = lastViewportRef.current.bounds;
      const lastZoom = lastViewportRef.current.zoom;

      // Only update if zoom changed or bounds changed significantly
      if (zoom === lastZoom && bounds.equals(lastBounds)) {
        return;
      }
    }

    // Calculate visible area with buffer for smoother experience
    const bufferedBounds = bounds.pad(0.1); // 10% buffer around viewport

    // Filter cities within visible bounds
    const visibleCities = cities.filter(city => {
      const point = L.latLng(city.coordinates[0], city.coordinates[1]);
      return bufferedBounds.contains(point);
    });

    // Limit visible cities based on zoom level and performance
    const maxVisibleCities = getMaxVisibleCities(zoom);
    const prioritizedCities = prioritizeCities(visibleCities, maxVisibleCities);

    // Update visible cities
    visibleCitiesRef.current = prioritizedCities;
    lastViewportRef.current = { bounds, zoom };
    lastCitiesRef.current = [...cities];

    onVisibleCitiesChange?.(prioritizedCities);
  }, [map, cities, onVisibleCitiesChange]);

  // Debounced viewport update using requestAnimationFrame
  const debouncedUpdate = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      updateVisibleCities();
    });
  }, [updateVisibleCities]);

  // Set up event listeners
  useEffect(() => {
    if (!map) return;

    // Initial update
    updateVisibleCities();

    // Listen to map events
    const events = ['moveend', 'zoomend', 'resize'];
    events.forEach(event => {
      map.on(event, debouncedUpdate);
    });

    return () => {
      events.forEach(event => {
        map.off(event, debouncedUpdate);
      });
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [map, debouncedUpdate, updateVisibleCities]);

  return null;
}

/**
 * Get maximum visible cities based on zoom level
 * Higher zoom = more cities visible for detail
 * Lower zoom = fewer cities for performance
 */
function getMaxVisibleCities(zoom: number): number {
  if (zoom >= 16) return 1000; // High detail zoom
  if (zoom >= 12) return 500;  // Medium detail
  if (zoom >= 8) return 200;   // Low detail
  if (zoom >= 4) return 100;   // Very low detail
  return 50; // Global view
}

/**
 * Prioritize cities for display when limited by performance
 * Prioritizes: large cities, recently visited, capitals
 */
function prioritizeCities(cities: City[], maxCount: number): City[] {
  if (cities.length <= maxCount) return cities;

  // Calculate priority score for each city
  const citiesWithPriority = cities.map(city => ({
    city,
    priority: calculatePriority(city)
  }));

  // Sort by priority (highest first)
  citiesWithPriority.sort((a, b) => b.priority - a.priority);

  // Return top prioritized cities
  return citiesWithPriority.slice(0, maxCount).map(item => item.city);
}

/**
 * Calculate priority score for city display
 */
function calculatePriority(city: City): number {
  let priority = 0;

  // Population factor (larger cities = higher priority)
  if (city.population) {
    if (city.population > 10000000) priority += 100; // Megacities
    else if (city.population > 1000000) priority += 80; // Large cities
    else if (city.population > 100000) priority += 60; // Medium cities
    else if (city.population > 10000) priority += 40; // Small cities
    else priority += 20; // Very small cities
  }

  // Capital factor
  if (city.capital === 'primary') priority += 50;
  else if (city.capital) priority += 25;

  // Recency factor (more recent visits = higher priority)
  const daysSinceVisit = (Date.now() - new Date(city.lastVisited).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceVisit < 365) priority += 30; // Within last year
  else if (daysSinceVisit < 365 * 3) priority += 20; // Within last 3 years
  else if (daysSinceVisit < 365 * 5) priority += 10; // Within last 5 years

  // Visit type factor (lived cities slightly higher priority)
  if (city.type === 'lived') priority += 10;

  return priority;
}


import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import Globe from 'react-globe.gl';
import { useTravelStore } from '../../store/travelStore';
import { CityDetailsPanel } from './CityDetailsPanel';
import type { City } from '../../types/city';

interface Globe3DProps {
  className?: string;
}

export function Globe3D({ className = '' }: Globe3DProps) {
  const { cities, trips, preferences } = useTravelStore();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Memoize markers for performance
  const markers = useMemo(() => cities.map((city) => ({
    id: city.id,
    lat: city.coordinates[0],
    lng: city.coordinates[1],
    size: city.type === 'lived' ? 0.15 : 0.1,
    color: city.type === 'visited' ? '#10B981' : '#F59E0B',
    city
  })), [cities]);

  // Memoize arcs for performance
  const arcs = useMemo(() => trips.flatMap((trip) => {
    const tripCities = trip.cityIds
      .map((id) => cities.find((c) => c.id === id))
      .filter(Boolean) as typeof cities;

    const arcPairs: Array<{
      startLat: number;
      startLng: number;
      endLat: number;
      endLng: number;
      color: string;
    }> = [];

    for (let i = 0; i < tripCities.length - 1; i++) {
      const start = tripCities[i];
      const end = tripCities[i + 1];
      if (start && end) {
        arcPairs.push({
          startLat: start.coordinates[0],
          startLng: start.coordinates[1],
          endLat: end.coordinates[0],
          endLng: end.coordinates[1],
          color: trip.color
        });
      }
    }

    return arcPairs;
  }), [trips, cities]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePointClick = useCallback((point: any) => {
    if (point?.city) {
      setSelectedCity(point.city);
      setIsDetailsOpen(true);
    }
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      // Auto-rotate when idle (5 RPM = 0.5 speed)
      const controls = globeRef.current.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5 * (preferences.animationSpeed || 1.0);
      }
    }
  }, [preferences.animationSpeed]);

  return (
    <div className={`w-full h-full ${className}`}>
      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        pointsData={markers}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointRadius="size"
        pointResolution={12}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pointLabel={(d: any) => `
          <div style="
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 14px;
            max-width: 200px;
          ">
            <div style="font-weight: 600; margin-bottom: 4px;">${d.city.name}</div>
            <div style="font-size: 12px; opacity: 0.9;">${d.city.country}</div>
          </div>
        `}
        onPointClick={handlePointClick}
        arcsData={arcs}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={2000}
        arcStroke={0.5}
        arcAltitude={0.1}
        arcDashInitialGap={() => Math.random()}
      />
      
      <CityDetailsPanel
        city={selectedCity}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedCity(null);
        }}
        onEdit={() => {
          setIsDetailsOpen(false);
          // Could trigger edit modal here
        }}
      />
    </div>
  );
}


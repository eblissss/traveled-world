import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTravelStore } from '../../store/travelStore';
import type { City } from '../../types/city';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Fix default marker icon issue
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if ((L as any).Icon?.Default) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete ((L as any).Icon.Default.prototype as any)._getIconUrl;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (L as any).Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

interface Map2DProps {
  className?: string;
  theme?: 'light' | 'dark' | 'satellite';
}

// Clustering component
function MarkerCluster({ cities }: { cities: City[] }) {
  const map = useMap();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any>(null);
  
  useEffect(() => {
    if (!map || cities.length === 0) {
      if (markersRef.current) {
        map.removeLayer(markersRef.current);
        markersRef.current = null;
      }
      return;
    }

    // Import MarkerClusterGroup dynamically
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    import('leaflet.markercluster').then((MC: any) => {
      // Clean up existing markers
      if (markersRef.current) {
        map.removeLayer(markersRef.current);
      }

      const MarkerClusterGroup = MC.default || MC.MarkerClusterGroup || MC;
      const markers = new MarkerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 60,
      });

      markersRef.current = markers;

      // Create custom icons
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const visitedIcon = (L as any).icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="35" viewBox="0 0 25 35">
            <path fill="#10B981" d="M12.5 0C5.596 0 0 5.596 0 12.5c0 12.5 12.5 22.5 12.5 22.5s12.5-10 12.5-22.5C25 5.596 19.404 0 12.5 0zm0 17c-2.485 0-4.5-2.015-4.5-4.5s2.015-4.5 4.5-4.5 4.5 2.015 4.5 4.5-2.015 4.5-4.5 4.5z"/>
          </svg>
        `),
        iconSize: [25, 35],
        iconAnchor: [12.5, 35],
        popupAnchor: [0, -35]
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const livedIcon = (L as any).icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="35" viewBox="0 0 25 35">
            <path fill="#F59E0B" d="M12.5 0C5.596 0 0 5.596 0 12.5c0 12.5 12.5 22.5 12.5 22.5s12.5-10 12.5-22.5C25 5.596 19.404 0 12.5 0zm0 17c-2.485 0-4.5-2.015-4.5-4.5s2.015-4.5 4.5-4.5 4.5 2.015 4.5 4.5-2.015 4.5-4.5 4.5z"/>
          </svg>
        `),
        iconSize: [25, 35],
        iconAnchor: [12.5, 35],
        popupAnchor: [0, -35]
      });

      cities.forEach((city) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const marker = (L as any).marker([city.coordinates[0], city.coordinates[1]], {
          icon: city.type === 'visited' ? visitedIcon : livedIcon
        });
        
        marker.bindPopup(`
          <div style="padding: 8px;">
            <h3 style="font-weight: 600; font-size: 16px; margin-bottom: 4px;">${city.name}</h3>
            <p style="font-size: 14px; color: #666; margin-bottom: 4px;">${city.country}</p>
            <p style="font-size: 12px; color: #999;">${city.type === 'visited' ? 'Visited' : 'Lived'}</p>
          </div>
        `);
        
        markers.addLayer(marker);
      });

      map.addLayer(markers);
    });

    return () => {
      if (markersRef.current) {
        map.removeLayer(markersRef.current);
        markersRef.current = null;
      }
    };
  }, [map, cities]);

  return null;
}

export function Map2D({ className = '', theme = 'light' }: Map2DProps) {
  const { cities, trips } = useTravelStore();

  // Get tile URL based on theme
  const getTileUrl = () => {
    switch (theme) {
      case 'dark':
        return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  // Prepare trip polylines
  const polylines = trips.flatMap((trip) => {
    const tripCities = trip.cityIds
      .map((id) => cities.find((c) => c.id === id))
      .filter(Boolean) as typeof cities;

    if (tripCities.length < 2) return [];

    const positions = tripCities.map((city) => [
      city.coordinates[0],
      city.coordinates[1]
    ] as [number, number]);

    return [{ positions, color: trip.color }];
  });

  if (cities.length === 0) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        <p className="text-text-secondary">Add cities to see them on the map</p>
      </div>
    );
  }

  // Calculate center from cities
  const centerLat = cities.reduce((sum, c) => sum + c.coordinates[0], 0) / cities.length;
  const centerLng = cities.reduce((sum, c) => sum + c.coordinates[1], 0) / cities.length;

  return (
    <div className={`w-full h-full ${className}`}>
      <MapContainer
        {...{
          center: [centerLat || 0, centerLng || 0] as [number, number],
          zoom: cities.length === 1 ? 10 : 2,
          style: { height: '100%', width: '100%' },
          className: 'z-0'
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any}
      >
        <TileLayer
          url={getTileUrl()}
          {...(theme === 'satellite' 
            ? { attribution: '&copy; Esri' }
            : { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }
          )}
        />

        {/* Trip polylines */}
        {polylines.map((polyline, index) => (
          <Polyline
            key={index}
            positions={polyline.positions}
            pathOptions={{ color: polyline.color, weight: 3, opacity: 0.7 }}
          />
        ))}

        {/* City markers with clustering */}
        <MarkerCluster cities={cities} />
      </MapContainer>
    </div>
  );
}

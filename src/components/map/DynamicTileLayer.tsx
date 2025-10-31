import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { createTileLayer } from './CustomMapStyles';

interface DynamicTileLayerProps {
  theme: string;
}

/**
 * Dynamic tile layer that updates based on theme changes
 */
export function DynamicTileLayer({ theme }: DynamicTileLayerProps) {
  const map = useMap();

  useEffect(() => {
    // Remove existing tile layers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // Add new tile layer
    const tileLayer = createTileLayer(theme);
    map.addLayer(tileLayer);

    // Ensure the tile layer stays below other layers
    tileLayer.setZIndex(0);

  }, [map, theme]);

  return null;
}

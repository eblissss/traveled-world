import { useEffect, useState } from 'react';
import { MapContainer, Marker, Polyline } from 'react-leaflet';
import { motion } from 'framer-motion';
import { useTravelStore, useFilteredCities } from '../../store/travelStore';
import { CityDetailsPanel } from './CityDetailsPanel';
import { CityEditModal } from '../input/CityEditModal';
import { AnimatedJourneyLines } from './AnimatedJourneyLines';
import { DynamicTileLayer } from './DynamicTileLayer';
import { PerformanceManager } from './PerformanceManager';
import type { City } from '../../types/city';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue - moved inside component to avoid module-level L access
const fixLeafletIcons = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof L !== 'undefined' && (L as any).Icon?.Default) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete ((L as any).Icon.Default.prototype as any)._getIconUrl;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (L as any).Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
  }
};

interface Map2DProps {
  className?: string;
  theme?: string;
  animatedJourneyLines?: boolean;
  onCityHover?: (city: City, position: { x: number; y: number }) => void;
  onCityHoverEnd?: () => void;
}

// ============================================================================
// Beautiful Custom Markers
// ============================================================================

type CityTier = 'small' | 'medium' | 'large';

interface MarkerSize {
  size: number;
  scale: number;
  tier: CityTier;
}

const POPULATION_THRESHOLDS = {
  SMALL: 50000,
  MEDIUM: 1000000
} as const;

const SIZE_CONFIG = {
  small: { base: 36 },
  medium: { base: 42 },
  large: { base: 48 }
} as const;

/**
 * Calculate marker size based on city population
 */
const getMarkerSize = (population?: number): MarkerSize => {
  if (!population) {
    return { size: 28, scale: 1, tier: 'small' };
  }

  let size: number;
  let tier: CityTier;

  if (population < POPULATION_THRESHOLDS.SMALL) {
    tier = 'small';
    size = SIZE_CONFIG.small.base;
  } else if (population < POPULATION_THRESHOLDS.MEDIUM) {
    tier = 'medium';
    size = SIZE_CONFIG.medium.base;
  } else {
    tier = 'large';
    size = SIZE_CONFIG.large.base;
  }

  return { size, scale: size / 32, tier };
};

/**
 * Create a stunning marker icon using lucide-react MapPin (upside-down teardrop)
 */
const createStunningMarkerIcon = (city: City): L.DivIcon => {
  const { size } = getMarkerSize(city.population);
  const iconSize = size;

  // Color schemes with gradients for 3D depth
  const colorSchemes = {
    visited: {
      primary: '#10B981',      // Emerald
      light: '#34D399',        // Light emerald
      dark: '#059669',         // Dark emerald
      darkest: '#065F46',      // Darkest emerald
      glow: 'rgba(16, 185, 129, 0.6)'
    },
    lived: {
      primary: '#F59E0B',      // Amber
      light: '#FBBF24',        // Light amber
      dark: '#D97706',         // Dark amber
      darkest: '#92400E',      // Darkest amber
      glow: 'rgba(245, 158, 11, 0.6)'
    }
  };

  const scheme = colorSchemes[city.type];
  
  // 3D teardrop marker with depth
  const mapPinSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" style="pointer-events: none;">
      <defs>
        <!-- Simple gradient for depth -->
        <radialGradient id="gradient-${city.id}-${city.type}" cx="30%" cy="20%" r="60%">
          <stop offset="0%" style="stop-color:${scheme.light};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${scheme.primary};stop-opacity:1" />
        </radialGradient>
      </defs>

      <!-- Shadow/base -->
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"
            fill="${scheme.darkest}"
            opacity="0.3"
            transform="translate(0.5, 1)"/>

      <!-- Main teardrop body with gradient -->
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"
            fill="url(#gradient-${city.id}-${city.type})"
            stroke="${scheme.dark}"
            stroke-width="1.5"
            opacity="0.95"/>

      <!-- Inner circle with shadow effect -->
      <circle cx="12" cy="10" r="2.5" fill="rgba(255,255,255,0.95)" stroke="rgba(255,255,255,0.7)" stroke-width="1.5"/>
      <circle cx="12" cy="10" r="2.5" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="0.5"/>
    </svg>
  `;

  // Create a div-based icon for full clickability
  return L.divIcon({
    html: `
      <div class="stunning-marker-container" data-city-id="${city.id}" data-city-type="${city.type}" data-timestamp="${Date.now()}" style="
        width: ${iconSize}px;
        height: ${iconSize}px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        pointer-events: auto;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      ">
        <div style="
          width: ${iconSize}px;
          height: ${iconSize}px;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        ">
          ${mapPinSVG}
        </div>
      </div>
    `,
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize],
    popupAnchor: [0, -iconSize],
    className: 'stunning-div-marker'
  });
};

// Individual markers component using React-Leaflet
function Markers({
  cities,
  onCityClick,
  onCityHover,
  onCityHoverEnd
}: {
  cities: City[];
  onCityClick: (city: City) => void;
  onCityHover?: (city: City, position: { x: number; y: number }) => void;
  onCityHoverEnd?: () => void;
}) {
  return (
    <>
      {cities.map((city) => (
        <Marker
          key={city.id}
          position={[city.coordinates[0], city.coordinates[1]]}
          icon={createStunningMarkerIcon(city)}
          eventHandlers={{
            click: () => {
              console.log('Marker clicked:', city.name);
              // Hide tooltip when clicking (user is now interacting with details panel)
              if (onCityHoverEnd) {
                onCityHoverEnd();
              }
              onCityClick(city);
            },
            mouseover: (e) => {
              // Add hovered class via DOM query
              const target = e.target.getElement()?.querySelector('.stunning-marker-container') as HTMLElement;
              if (target) {
                target.classList.add('hovered');
              }
              if (onCityHover) {
                onCityHover(city, { x: e.originalEvent.clientX, y: e.originalEvent.clientY });
              }
            },
            mousemove: (e) => {
              // Update tooltip position as mouse moves
              if (onCityHover) {
                onCityHover(city, { x: e.originalEvent.clientX, y: e.originalEvent.clientY });
              }
            },
            mouseout: (e) => {
              const target = e.target.getElement()?.querySelector('.stunning-marker-container') as HTMLElement;
              if (target) {
                target.classList.remove('hovered');
              }
              if (onCityHoverEnd) {
                onCityHoverEnd();
              }
            }
          }}
        />
      ))}
    </>
  );
}

// Combined state interface
interface ComponentState {
  // Map interaction state
  selectedCity: City | null;
  isDetailsOpen: boolean;
  editingCity: City | null;

  // Performance state
  visibleCities: City[];
}

/**
 * Main 2D Map Component with comprehensive travel visualization
 */
export function Map2D({
  className = '',
  theme = 'light',
  animatedJourneyLines = true,
  onCityHover,
  onCityHoverEnd
}: Map2DProps) {
  const { trips, preferences } = useTravelStore();
  const filteredCities = useFilteredCities();

  // Combined component state
  const [state, setState] = useState<ComponentState>({
    selectedCity: null,
    isDetailsOpen: false,
    editingCity: null,
    visibleCities: []
  });

  // Fix leaflet icons on component mount - must be before any early returns
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  const filteredTrips = preferences.selectedTripId
    ? trips.filter(trip => trip.id === preferences.selectedTripId)
    : [];

  // State update helper
  const updateState = (updates: Partial<ComponentState>) => setState(prev => ({ ...prev, ...updates }));
  
  // Event handlers
  const handleCityClick = (city: City) => {
    updateState({
      selectedCity: city,
      isDetailsOpen: true
    });
    console.log('city clicked', city);
  };




  // Prepare trip polylines (only show selected trip if one is selected)
  const polylines = filteredTrips.flatMap(trip => {
    const tripCities = trip.cityIds
      .map(id => filteredCities.find(c => c.id === id))
      .filter((city): city is City => city !== undefined)
      .sort((a, b) => new Date(a.lastVisited).getTime() - new Date(b.lastVisited).getTime());

    if (tripCities.length < 2) return [];

    return [{
      positions: tripCities.map(c => [c.coordinates[0], c.coordinates[1]] as [number, number]),
      color: trip.color,
      tripId: trip.id
    }];
  });

  if (filteredCities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`w-full h-full flex items-center justify-center ${className}`}
      >
        <div className="text-center px-4">
          <div className="mb-4">
            <svg className="w-20 h-20 mx-auto text-text-secondary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">No cities on map yet</h3>
          <p className="text-text-secondary text-sm max-w-xs">
            Add cities from the sidebar to see them visualized on the map
          </p>
        </div>
      </motion.div>
    );
  }

  // Calculate center from cities
  const centerLat = filteredCities.length > 0
    ? filteredCities.reduce((sum, c) => sum + c.coordinates[0], 0) / filteredCities.length
    : 0;
  const centerLng = filteredCities.length > 0
    ? filteredCities.reduce((sum, c) => sum + c.coordinates[1], 0) / filteredCities.length
    : 0;

  return (
    <div className={`w-full h-full ${className}`}>
      <MapContainer
        {...{
        center: [centerLat || 0, centerLng || 0] as [number, number],
        zoom: filteredCities.length === 1 ? 10 : filteredCities.length === 0 ? 2 : 3,
        maxZoom: 19,
          style: { height: '100%', width: '100%' },
          className: 'z-0'
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any}
      >
        <DynamicTileLayer theme={theme} />

        {/* Performance manager for viewport culling */}
        <PerformanceManager
          cities={filteredCities}
          onVisibleCitiesChange={(visibleCities) => updateState({ visibleCities })}
        />

        {/* Journey lines */}
        {animatedJourneyLines ? (
          <AnimatedJourneyLines
            trips={filteredTrips}
            cities={filteredCities}
            animated={true}
          />
        ) : (
          polylines.map((polyline, index) => (
            <Polyline
              key={polyline.tripId ? `${polyline.tripId}-${index}` : `polyline-${index}`}
              positions={polyline.positions}
              pathOptions={{ color: polyline.color, weight: 3, opacity: 0.7 }}
            />
          ))
        )}

        {/* City markers without clustering */}
        <Markers
          key={`markers-${filteredCities.length}-${filteredCities.map(c => `${c.id}-${c.type}`).join('-')}`}
          cities={filteredCities}
          onCityClick={handleCityClick}
          onCityHover={onCityHover}
          onCityHoverEnd={onCityHoverEnd}
        />

      </MapContainer>

      
      <CityDetailsPanel
        city={state.selectedCity}
        isOpen={state.isDetailsOpen}
        onClose={() => updateState({ isDetailsOpen: false, selectedCity: null })}
        onEdit={() => updateState({ isDetailsOpen: false, editingCity: state.selectedCity })}
      />

      {state.editingCity && (
        <CityEditModal
          city={state.editingCity}
          isOpen={true}
          onClose={() => updateState({ editingCity: null })}
        />
      )}

    </div>
  );
}

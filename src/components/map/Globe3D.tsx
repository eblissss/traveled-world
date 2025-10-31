import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import Globe from 'react-globe.gl';
import { useReducedMotion } from 'framer-motion';
import { useTravelStore, useFilteredCities } from '../../store/travelStore';
import { CityDetailsPanel } from './CityDetailsPanel';
import { CityEditModal } from '../input/CityEditModal';
import { useGlobeControls } from '../../hooks/useGlobeControls';
import type { City } from '../../types/city';
import * as THREE from 'three';

interface Globe3DProps {
  className?: string;
  onCityHover?: (city: City, position: { x: number; y: number }) => void;
  onCityHoverEnd?: () => void;
}

// Custom marker renderer that creates 3D markers
function createCustomMarker(city: City, baseColor: string): THREE.Mesh {
  const size = city.type === 'lived' ? 0.6 : 0.4; // Larger for lived cities
  const geometry = new THREE.SphereGeometry(size, 10, 10);
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color(baseColor)
  });

  // Create main marker
  const mesh = new THREE.Mesh(geometry, material);

  // Add simple glow effect
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(baseColor),
    transparent: true,
    opacity: 0.3,
  });
  const glowGeometry = new THREE.SphereGeometry(size * 3, 14, 14);
  const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
  mesh.add(glowMesh);

  return mesh;
}


export function Globe3D({ className = '', onCityHover, onCityHoverEnd }: Globe3DProps) {
  const { trips, preferences } = useTravelStore();
  const filteredCities = useFilteredCities();
  const prefersReducedMotion = useReducedMotion() ?? false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { focusOnCity } = useGlobeControls(globeRef);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);
  const [pulsingMarkerId, setPulsingMarkerId] = useState<string | null>(null);
  const [pulseProgress, setPulseProgress] = useState(0);
  const pulseAnimationRef = useRef<number | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Refs to track hover state without causing re-renders
  const currentHoveredCityRef = useRef<City | null>(null);
  const currentHoveredMarkerIdRef = useRef<string | null>(null);
  const mousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const tooltipUpdateRef = useRef<number | null>(null);

  // Filter trips based on selected trip
  const filteredTrips = useMemo(() => preferences.selectedTripId
    ? trips.filter(trip => trip.id === preferences.selectedTripId)
    : [], [preferences.selectedTripId, trips]);

  // Get colors from CSS variables
  const getMarkerColor = useCallback((type: 'visited' | 'lived') => {
    // Use CSS variables, fallback to hex if not available
    const rootStyles = getComputedStyle(document.documentElement);
    const visitedColor = rootStyles.getPropertyValue('--accent-visited').trim() || '#10B981';
    const livedColor = rootStyles.getPropertyValue('--accent-lived').trim() || '#F59E0B';
    return type === 'visited' ? visitedColor : livedColor;
  }, []);

  // Memoize markers for performance with custom 3D objects
  const markers = useMemo(() => {
    return filteredCities.map((city) => {
      const baseColor = getMarkerColor(city.type);

      return {
        id: city.id,
        lat: city.coordinates[0],
        lng: city.coordinates[1],
        baseColor,
        city,
        // Create the custom 3D marker object
        object: createCustomMarker(city, baseColor)
      };
    });
  }, [filteredCities, getMarkerColor]);

  // Custom three object function for markers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getCustomThreeObject = useCallback((marker: any) => {
    return marker.object;
  }, []);

  // Custom three object update function for animations and interactions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateCustomThreeObject = useCallback((obj: any, marker: any) => {
    // Position the object on the globe surface
    const phi = (90 - marker.lat) * (Math.PI / 180);
    const theta = (marker.lng + 90) * (Math.PI / 180);
    const radius = 100; // Globe radius

    obj.position.x = -(radius * Math.sin(phi) * Math.cos(theta));
    obj.position.z = radius * Math.sin(phi) * Math.sin(theta);
    obj.position.y = radius * Math.cos(phi);

    // Make sure it's on the surface
    obj.position.normalize().multiplyScalar(radius + 0.01);

    obj.scale.setScalar(1);

    // Simple pulse animation
    if (pulsingMarkerId === marker.id && pulseProgress > 0) {
      const scale = 1.0 + (pulseProgress < 0.5 ? pulseProgress * 0.4 : (1 - pulseProgress) * 0.4);
      obj.scale.multiplyScalar(scale);
    }

    // Hover scaling
    if (hoveredMarkerId === marker.id) {
      obj.scale.multiplyScalar(1.2);
    }

    // Look at center of globe
    obj.lookAt(new THREE.Vector3(0, 0, 0));
  }, [hoveredMarkerId, pulsingMarkerId, pulseProgress]);


  // Dynamic arc color function with enhanced glow and gradient effect
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getArcColor = useCallback((arc: any) => {
    if (!arc || !arc.color) return 'var(--accent-primary)';
    
    // Parse hex color
    const hex = arc.color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Enhanced glow effect (increase brightness by 35% for more vibrant arcs)
    const glowR = Math.min(255, Math.round(r + (255 - r) * 0.35));
    const glowG = Math.min(255, Math.round(g + (255 - g) * 0.35));
    const glowB = Math.min(255, Math.round(b + (255 - b) * 0.35));
    
    return `rgb(${glowR}, ${glowG}, ${glowB})`;
  }, []);

  // Calculate great-circle distance between two points on the globe
  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 100; // Globe radius from the code
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance along great circle
  }, []);

  // Calculate dynamic arc altitude based on distance to prevent cutting through globe
  const calculateArcAltitude = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const distance = calculateDistance(lat1, lng1, lat2, lng2);
    const R = 100; // Globe radius

    // For short distances, use minimal altitude
    // For longer distances, increase altitude to ensure arc doesn't cut through globe
    // The maximum distance is π*R (antipodal points), so normalize by that
    const normalizedDistance = distance / (Math.PI * R);

    // Base altitude of 0.05 for short distances, plus up to 0.4 additional based on distance
    // This ensures short arcs are subtle while long arcs clear the globe surface
    const altitude = 0.05 + (normalizedDistance * 0.4);

    return Math.min(altitude, 0.8); // Cap at 0.8 to prevent excessive height
  }, [calculateDistance]);

  // Memoize arcs for performance with segment chaining (500ms gaps adjusted by animationSpeed)
  const arcs = useMemo(() => filteredTrips.flatMap((trip) => {
    const tripCities = trip.cityIds
      .map((id) => filteredCities.find((c) => c.id === id))
      .filter(Boolean) as typeof filteredCities;

    const arcPairs: Array<{
      startLat: number;
      startLng: number;
      endLat: number;
      endLng: number;
      color: string;
      segmentIndex: number;
      altitude: number;
    }> = [];

    for (let i = 0; i < tripCities.length - 1; i++) {
      const start = tripCities[i];
      const end = tripCities[i + 1];
      if (start && end) {
        const altitude = calculateArcAltitude(
          start.coordinates[0],
          start.coordinates[1],
          end.coordinates[0],
          end.coordinates[1]
        );

        arcPairs.push({
          startLat: start.coordinates[0],
          startLng: start.coordinates[1],
          endLat: end.coordinates[0],
          endLng: end.coordinates[1],
          color: trip.color,
          segmentIndex: i,
          altitude
        });
      }
    }

    return arcPairs;
  }), [filteredTrips, filteredCities, calculateArcAltitude]);

  // Track mouse position globally and update tooltip position while hovering
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
      
      // Update tooltip position if we're currently hovering over a city
      if (currentHoveredCityRef.current && onCityHover) {
        // Throttle position updates to avoid excessive calls
        if (tooltipUpdateRef.current) {
          cancelAnimationFrame(tooltipUpdateRef.current);
        }
        
        tooltipUpdateRef.current = requestAnimationFrame(() => {
          if (onCityHover && currentHoveredCityRef.current) {
            onCityHover(currentHoveredCityRef.current, mousePositionRef.current);
          }
          tooltipUpdateRef.current = null;
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (tooltipUpdateRef.current) {
        cancelAnimationFrame(tooltipUpdateRef.current);
      }
    };
  }, [onCityHover]);

  // Optimized hover handler that only updates when city changes
  // Uses refs to minimize state updates and prevent globe animation interference
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleObjectHover = useCallback((obj: any) => {
    if (obj) {
      const markerId = obj.cityId || obj.id;
      
      // Early return if we're already hovering this marker (prevents redundant work)
      if (markerId === currentHoveredMarkerIdRef.current) {
        return;
      }

      // Find the city from the marker data
      const marker = markers.find(m => m.id === obj.id);
      const city = marker?.city;

      if (city) {
        // Update refs first (no re-render)
        currentHoveredCityRef.current = city;
        currentHoveredMarkerIdRef.current = markerId;
        
        // Update tooltip in next frame to avoid blocking globe animations
        if (tooltipUpdateRef.current) {
          cancelAnimationFrame(tooltipUpdateRef.current);
        }
        
        tooltipUpdateRef.current = requestAnimationFrame(() => {
          if (onCityHover && currentHoveredCityRef.current) {
            onCityHover(currentHoveredCityRef.current, mousePositionRef.current);
          }
          tooltipUpdateRef.current = null;
        });

        // Only update state for visual scaling (throttled via ref check)
        setHoveredMarkerId(markerId);
      }
    } else {
      // Hover ended - only update if we were actually hovering something
      if (currentHoveredCityRef.current) {
        currentHoveredCityRef.current = null;
        currentHoveredMarkerIdRef.current = null;
        
        if (tooltipUpdateRef.current) {
          cancelAnimationFrame(tooltipUpdateRef.current);
          tooltipUpdateRef.current = null;
        }
        
        if (onCityHoverEnd) {
          onCityHoverEnd();
        }
        
        setHoveredMarkerId(null);
      }
    }
  }, [markers, onCityHover, onCityHoverEnd]);

  // Stop auto-rotation on user interaction
  const handleUserInteraction = useCallback(() => {
    setAutoRotate(false);
  }, []);

  // Handle simple pulse animation on click
  useEffect(() => {
    if (pulsingMarkerId) {
      const startTime = Date.now();
      const duration = 300; // 300ms total

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        setPulseProgress(progress);

        if (progress < 1) {
          pulseAnimationRef.current = requestAnimationFrame(animate);
        } else {
          setPulseProgress(0);
          setPulsingMarkerId(null);
          pulseAnimationRef.current = null;
        }
      };

      pulseAnimationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (pulseAnimationRef.current) {
        cancelAnimationFrame(pulseAnimationRef.current);
        pulseAnimationRef.current = null;
      }
    };
  }, [pulsingMarkerId]);

  // Handle object click
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleObjectClick = useCallback((obj: any) => {
    // Find the marker data from the object
    const marker = markers.find(m => m.id === obj.id);
    if (marker?.city) {
      // Stop auto-rotation on click
      handleUserInteraction();

      // Trigger pulse animation
      setPulsingMarkerId(marker.id);
      setPulseProgress(0);

      // Smooth camera transition to focus on city (800ms)
      const duration = prefersReducedMotion ? 0 : 800;
      focusOnCity(marker.city, duration);

      // Open details panel
      setSelectedCity(marker.city);
      setIsDetailsOpen(true);
    }
  }, [markers, focusOnCity, prefersReducedMotion, handleUserInteraction]);


  // Cleanup animation on unmount
  useEffect(() => {
    const pulseAnimation = pulseAnimationRef.current;

    return () => {
      if (pulseAnimation) {
        cancelAnimationFrame(pulseAnimation);
      }
    };
  }, []);


  // Handle container resizing to ensure globe fits properly
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({
          width: rect.width,
          height: rect.height
        });
      }
    };

    updateSize();

    // Update size on window resize
    window.addEventListener('resize', updateSize);

    // Also update size after a short delay to ensure container is fully rendered
    const timeoutId = setTimeout(updateSize, 100);

    return () => {
      window.removeEventListener('resize', updateSize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Handle auto-rotation
  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      if (controls) {
        controls.autoRotate = autoRotate;
        controls.autoRotateSpeed = 0.4 * (preferences.animationSpeed || 1.0);
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
      }
    }
  }, [autoRotate, preferences.animationSpeed]);


  // Calculate arc animation time based on animationSpeed (design: 2000ms base)
  const arcAnimationTime = Math.round(2000 / (preferences.animationSpeed || 1.0));

  // Get globe texture based on preference
  const getGlobeTexture = useCallback(() => {
    const style = preferences.globeStyle || 'blue-marble';

    switch (style) {
      case 'satellite':
        return '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
      case 'night':
        return '//unpkg.com/three-globe/example/img/earth-night.jpg';
      case 'blue-marble':
      default:
        return '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
    }
  }, [preferences.globeStyle]);

  // Get background based on style
  const getBackgroundTexture = useCallback(() => {
    const style = preferences.globeStyle || 'blue-marble';

    switch (style) {
      case 'night':
      case 'satellite':
        return 'https://unpkg.com/three-globe/example/img/night-sky.png';
      case 'blue-marble':
      default:
        return 'https://unpkg.com/three-globe/example/img/night-sky.png';
    }
  }, [preferences.globeStyle]);

  // Get atmospheric settings based on style
  const getAtmosphericSettings = useCallback(() => {
    const style = preferences.globeStyle || 'blue-marble';

    switch (style) {
      case 'night':
        return {
          atmosphereColor: '#87CEEB',
          atmosphereAltitude: 0.15
        };
      case 'satellite':
        return {
          atmosphereColor: '#4169E1',
          atmosphereAltitude: 0.12
        };
      case 'blue-marble':
      default:
        return {
          atmosphereColor: '#87CEEB',
          atmosphereAltitude: 0.15
        };
    }
  }, [preferences.globeStyle]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className} relative`}
      data-globe-container
    >
      {/* Ambient background gradient */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: preferences.globeStyle === 'night'
            ? 'linear-gradient(to bottom, rgba(0,0,20,0.3), transparent, rgba(0,0,10,0.3))'
            : preferences.globeStyle === 'satellite'
            ? 'linear-gradient(to bottom, rgba(10,10,30,0.2), transparent, rgba(0,0,15,0.2))'
            : 'linear-gradient(to bottom, rgba(25,25,112,0.2), transparent, rgba(25,25,112,0.2))'
        }}
      />

      {containerSize.width > 0 && containerSize.height > 0 && (
        <Globe
          width={containerSize.width}
          height={containerSize.height}
          ref={globeRef}
        globeImageUrl={getGlobeTexture()}
        backgroundImageUrl={getBackgroundTexture()}
        atmosphereColor={getAtmosphericSettings().atmosphereColor}
        atmosphereAltitude={getAtmosphericSettings().atmosphereAltitude}
        customLayerData={markers}
        customThreeObject={getCustomThreeObject}
        customThreeObjectUpdate={updateCustomThreeObject}
        enablePointerInteraction={true}
        onGlobeReady={() => {
          // Ensure markers are visible on initial load
          if (globeRef.current && filteredCities.length > 0) {
            // Force update to ensure custom objects render
            const controls = globeRef.current.controls();
            if (controls) {
              controls.update();
            }
            // Force re-render of custom objects
            globeRef.current.pointOfView({ lat: 0, lng: 0, altitude: 2 }, 0);
          }
        }}
        onCustomLayerHover={handleObjectHover}
        onCustomLayerClick={handleObjectClick}
        onGlobeClick={handleUserInteraction}
        arcsData={arcs}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor={getArcColor}
        arcDashLength={0.5}
        arcDashGap={0.15}
        arcDashAnimateTime={arcAnimationTime}
        arcStroke={1.2}
        arcAltitude={(arc: unknown) => {
          const arcData = arc as { altitude?: number };
          return arcData.altitude || 0.15; // Fallback to default if no altitude calculated
        }}
        arcDashInitialGap={(arc: unknown) => {
          const arcData = arc as { segmentIndex?: number };
          const segmentDelay = (arcData.segmentIndex || 0) * Math.round(500 / (preferences.animationSpeed || 1.0));
          return Math.min(segmentDelay / arcAnimationTime, 0.95);
        }}
        arcCurveResolution={64}
        />
      )}

      <CityDetailsPanel
        city={selectedCity}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedCity(null);
        }}
        onEdit={() => {
          setEditingCity(selectedCity);
          setIsDetailsOpen(false);
        }}
      />

      {editingCity && (
        <CityEditModal
          city={editingCity}
          isOpen={true}
          onClose={() => setEditingCity(null)}
        />
      )}
    </div>
  );
}


import { useCallback, useRef } from 'react';
import type { City } from '../types/city';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useGlobeControls(globeRef: React.RefObject<any>) {
  const animationFrameRef = useRef<number | null>(null);

  // Globe constants
  const GLOBE_RADIUS = 150;
  const CAMERA_OFFSET = 1.5;

  // Convert lat/lng to 3D cartesian coordinates
  const latLngToCartesian = useCallback((lat: number, lng: number, radius = GLOBE_RADIUS) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 90) * (Math.PI / 180);

    return {
      x: -radius * Math.sin(phi) * Math.cos(theta),
      y: radius * Math.cos(phi),
      z: radius * Math.sin(phi) * Math.sin(theta)
    };
  }, []);

  // Get optimal camera position for viewing a city
  const getCameraPositionForCity = useCallback((city: City) => {
    const [lat, lng] = city.coordinates;
    const cityPos = latLngToCartesian(lat, lng);

    // Calculate camera position with offset
    const distance = GLOBE_RADIUS * CAMERA_OFFSET;
    const normalized = {
      x: cityPos.x / GLOBE_RADIUS,
      y: cityPos.y / GLOBE_RADIUS,
      z: cityPos.z / GLOBE_RADIUS
    };

    return {
      x: normalized.x * distance,
      y: normalized.y * distance,
      z: normalized.z * distance
    };
  }, [latLngToCartesian]);

  // Smooth interpolation between two positions
  const interpolatePosition = useCallback((
    startPos: { x: number; y: number; z: number },
    endPos: { x: number; y: number; z: number },
    duration: number
  ) => {
    if (!globeRef.current) return;

    const controls = globeRef.current.controls();
    if (!controls) return;

    const startTime = Date.now();
    const startPosition = { ...startPos };

    // Cancel any existing animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const animate = () => {
      const elapsed = Date.now() - startTime;
      let progress = Math.min(elapsed / duration, 1);

      // Apply easeInOut easing
      progress = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      // Interpolate position
      controls.object.position.x = startPosition.x + (endPos.x - startPosition.x) * progress;
      controls.object.position.y = startPosition.y + (endPos.y - startPosition.y) * progress;
      controls.object.position.z = startPosition.z + (endPos.z - startPosition.z) * progress;

      // Look at center for smooth transitions
      controls.target.set(0, 0, 0);
      controls.update();

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        animationFrameRef.current = null;
      }
    };

    animate();
  }, [globeRef]);

  // Focus on a specific city with smooth camera transition
  const focusOnCity = useCallback((city: City, duration = 800) => {
    if (!globeRef.current || !city) return;

    const controls = globeRef.current.controls();
    if (!controls) return;

    const targetPosition = getCameraPositionForCity(city);
    const currentPosition = {
      x: controls.object.position.x,
      y: controls.object.position.y,
      z: controls.object.position.z
    };

    interpolatePosition(currentPosition, targetPosition, duration);
  }, [globeRef, getCameraPositionForCity, interpolatePosition]);

  return {
    focusOnCity
  };
}

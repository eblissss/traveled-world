import { useEffect, useState } from 'react';
import { Polyline } from 'react-leaflet';
import { motion } from 'framer-motion';
import type { Trip } from '../../types/trip';
import type { City } from '../../types/city';

interface AnimatedJourneyLinesProps {
  trips: Trip[];
  cities: City[];
  animated?: boolean;
  dashPattern?: boolean;
}


interface AnimatedPolylineProps {
  positions: [number, number][];
  color: string;
  animated?: boolean;
  dashPattern?: boolean;
}

function AnimatedPolyline({
  positions,
  color,
  animated = true,
  dashPattern = true
}: AnimatedPolylineProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [dashOffset, setDashOffset] = useState(0);

  useEffect(() => {
    // Animate line drawing
    if (animated) {
      setTimeout(() => setIsVisible(true), 500);
    } else {
      setIsVisible(true);
    }
  }, [animated]);

  // Animate the marching dashes
  useEffect(() => {
    if (dashPattern && isVisible) {
      const animate = () => {
        setDashOffset(prev => (prev + 0.75) % 20);
        requestAnimationFrame(animate);
      };
      const animationId = requestAnimationFrame(animate);

      return () => cancelAnimationFrame(animationId);
    }
  }, [dashPattern, isVisible]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    >
      <Polyline
        positions={positions}
        pathOptions={{
          color,
          weight: 4,
          opacity: 0.8,
          dashArray: dashPattern ? '10, 10' : undefined,
          dashOffset: dashPattern ? dashOffset.toString() : undefined,
          lineCap: 'round',
          lineJoin: 'round'
        }}
      />
    </motion.div>
  );
}

export function AnimatedJourneyLines({
  trips,
  cities,
  animated = true,
  dashPattern = true
}: AnimatedJourneyLinesProps) {

  // Prepare trip polylines with enhanced styling
  const journeyLines = trips.flatMap((trip, tripIndex) => {
    const tripCities = trip.cityIds
      .map((id) => cities.find((c) => c.id === id))
      .filter((city): city is City => city !== undefined);

    if (tripCities.length < 2) return [];

    const positions = tripCities.map((city) => [
      city.coordinates[0],
      city.coordinates[1]
    ] as [number, number]);

    // Create gradient colors for the trip
    const baseColor = trip.color;
    const lighterColor = lightenColor(baseColor, 0.3);
    const darkerColor = darkenColor(baseColor, 0.2);

    return [{
      positions,
      color: baseColor,
      lighterColor,
      darkerColor,
      tripId: trip.id,
      tripName: trip.name,
      cityCount: tripCities.length,
      tripIndex
    }];
  });

  return (
    <>
      {journeyLines.map((journey, index) => (
        <motion.div
          key={journey.tripId}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            delay: index * 0.2,
            type: "spring",
            stiffness: 100
          }}
        >
          <AnimatedPolyline
            positions={journey.positions}
            color={journey.color}
            animated={animated}
            dashPattern={dashPattern}
          />

        </motion.div>
      ))}
    </>
  );
}


// Utility functions for color manipulation
function lightenColor(color: string, percent: number): string {
  // Convert hex to RGB
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(255 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);

  return "#" + ((R << 16) | (G << 8) | B).toString(16).padStart(6, '0');
}

function darkenColor(color: string, percent: number): string {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(255 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
  const B = Math.max(0, (num & 0x0000FF) - amt);

  return "#" + ((R << 16) | (G << 8) | B).toString(16).padStart(6, '0');
}

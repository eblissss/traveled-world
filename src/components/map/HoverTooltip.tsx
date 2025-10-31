import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { City } from '../../types/city';

interface HoverTooltipProps {
  city: City | null;
  position: { x: number; y: number } | null;
  isVisible: boolean;
}

export function HoverTooltip({ city, position, isVisible }: HoverTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isVisible || !position || !tooltipRef.current) return;

    const tooltip = tooltipRef.current;
    const rect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = position.x + 15; // Offset from cursor
    let y = position.y - 10;

    // Adjust horizontal position to stay within viewport
    if (x + rect.width > viewportWidth) {
      x = position.x - rect.width - 15;
    }

    // Adjust vertical position to stay within viewport
    if (y + rect.height > viewportHeight) {
      y = position.y - rect.height - 10;
    }

    // Ensure tooltip doesn't go off-screen
    x = Math.max(10, Math.min(x, viewportWidth - rect.width - 10));
    y = Math.max(10, Math.min(y, viewportHeight - rect.height - 10));

    setAdjustedPosition({ x, y });
  }, [position, isVisible]);

  if (!city || !isVisible) return null;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={tooltipRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        style={{
          position: 'fixed',
          left: adjustedPosition.x,
          top: adjustedPosition.y,
          zIndex: 10000,
          pointerEvents: 'none'
        }}
      >
        <div style={{
          padding: '8px 12px',
          borderRadius: '8px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          whiteSpace: 'nowrap'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '2px' }}>
            {city.name}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
            {city.adminName ? `${city.adminName}, ` : ''}{city.country}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '2px' }}>
            Last visited: {formatDate(city.lastVisited)}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

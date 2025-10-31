import { useState, useEffect } from 'react';
import type { City } from '../types/city';

export interface PhotoResult {
  url: string;
  thumbnail: string;
  source: string;
  attribution?: string;
}

/**
 * Get a simple city photo
 */
export function getCityPhoto(): PhotoResult {
  return {
    url: 'https://picsum.photos/800/600?random=42',
    thumbnail: 'https://picsum.photos/400/300?random=42',
    source: 'Picsum Photos',
    attribution: 'City photo'
  };
}

/**
 * React hook for using city photo
 */
export function useCityPhoto(city: City) {
  const [photo, setPhoto] = useState<PhotoResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!city) return;

    setLoading(true);
    // Simulate async loading for consistency with existing hook interface
    setTimeout(() => {
      setPhoto(getCityPhoto());
      setLoading(false);
    }, 100);
  }, [city]);

  return { photo, loading, error: null };
}


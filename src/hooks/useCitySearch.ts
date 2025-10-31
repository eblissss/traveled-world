import { useState, useEffect, useRef, useCallback } from 'react';
import { useTravelStore } from '../store/travelStore';
import type { CityRecord } from '../types/city';

interface UseCitySearchReturn {
  results: CityRecord[];
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  search: (query: string) => void;
}

export function useCitySearch(): UseCitySearchReturn {
  const { preferences } = useTravelStore();
  const [results, setResults] = useState<CityRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const debounceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Initialize worker
    workerRef.current = new Worker(
      new URL('../workers/citySearch.worker.ts', import.meta.url),
      { type: 'module' }
    );

    workerRef.current.onmessage = (e) => {
      const { type, payload } = e.data;

      switch (type) {
        case 'CSV_LOADED':
          setIsReady(true);
          setIsLoading(false);
          break;
        case 'SEARCH_RESULTS':
          setResults(payload.results);
          setIsLoading(false);
          break;
        case 'ERROR':
          setError(payload.error);
          setIsLoading(false);
          break;
      }
    };

    // Load CSV on mount
    setIsLoading(true);
    workerRef.current.postMessage({ type: 'LOAD_CSV' });

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      workerRef.current?.terminate();
    };
  }, []);

  const search = useCallback((query: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!isReady || !workerRef.current) {
      return;
    }

    const debounceDelay = preferences.searchDebounceMs ?? 50;
    debounceTimerRef.current = window.setTimeout(() => {
      setIsLoading(true);
      workerRef.current?.postMessage({
        type: 'SEARCH',
        payload: { query: query.trim() }
      });
    }, debounceDelay);
  }, [isReady, preferences.searchDebounceMs]);

  return { results, isLoading, isReady, error, search };
}


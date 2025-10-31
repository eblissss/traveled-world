import { useState, useRef, useEffect, forwardRef } from 'react';
import { X } from 'lucide-react';
import { useCitySearch } from '../../hooks/useCitySearch';
import type { CityRecord } from '../../types/city';

interface CitySearchInputProps {
  onSelect: (city: CityRecord) => void;
}

export const CitySearchInput = forwardRef<HTMLInputElement, CitySearchInputProps>(
  ({ onSelect }, ref) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [searchHistory, setSearchHistory] = useState<CityRecord[]>([]);

    const { results, isLoading, isReady, search } = useCitySearch();
    const inputRef = useRef<HTMLInputElement>(null);
    const resultRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const actualInputRef = (ref && typeof ref !== 'function' ? ref : inputRef) as React.RefObject<HTMLInputElement>;

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('city-search-history');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved).slice(0, 5)); // Keep only last 5 searches
      } catch (e) {
        // Ignore errors
      }
    }
  }, []);

  // Save search history
  const saveToHistory = (city: CityRecord) => {
    const updated = [city, ...searchHistory.filter(c => c.city !== city.city)].slice(0, 5);
    setSearchHistory(updated);
    localStorage.setItem('city-search-history', JSON.stringify(updated));
  };

  useEffect(() => {
    if (query.length >= 2) {
      search(query);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [query, search]);

  useEffect(() => {
    setSelectedIndex(0);
    setHoveredIndex(null);
    // Reset refs array when results change
    resultRefs.current = [];
  }, [results]);

  // Scroll selected result into view when navigating with keyboard
  useEffect(() => {
    if (selectedIndex >= 0 && selectedIndex < results.length && hoveredIndex === null) {
      const selectedElement = resultRefs.current[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [selectedIndex, hoveredIndex, results.length]);

  const handleSelect = (city: CityRecord) => {
    onSelect(city);
    saveToHistory(city);
    setQuery('');
    setIsOpen(false);
    actualInputRef.current?.focus();
  };


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHoveredIndex(null);
        setSelectedIndex((prev) => prev < results.length - 1 ? prev + 1 : prev);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHoveredIndex(null);
        setSelectedIndex((prev) => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter': {
        e.preventDefault();
        const indexToSelect = hoveredIndex ?? selectedIndex;
        if (results[indexToSelect]) {
          handleSelect(results[indexToSelect]);
        }
        break;
      }
      case 'Escape':
        setIsOpen(false);
        actualInputRef.current?.blur();
        break;
    }
  };

  // Determine which index is highlighted (hover takes precedence over keyboard selection)
  const highlightedIndex = hoveredIndex ?? selectedIndex;

  return (
    <div className="relative w-full space-y-4">
      {/* Search Input */}
      <div className="relative">
        <input
          ref={actualInputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.length >= 2) setIsOpen(true);
          }}
          placeholder={isReady ? "Search for a city..." : "Loading cities..."}
          disabled={!isReady}
          className="w-full px-4 py-3 pr-10 rounded-lg border bg-bg-primary text-text-primary border-white/20 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none"
        />

        {/* Clear button */}
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full bg-bg-primary border border-white/20 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {results.length > 0 ? (
            <div className="py-2">
              {results.map((city, index) => (
                <button
                  key={`${city.city}-${city.country}-${index}`}
                  ref={(el) => (resultRefs.current[index] = el)}
                  onClick={() => handleSelect(city)}
                  onMouseEnter={() => {
                    setHoveredIndex(index);
                    setSelectedIndex(index);
                  }}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`w-full px-4 py-3 text-left hover:bg-bg-secondary ${
                    index === highlightedIndex ? 'bg-bg-secondary border-l-2 border-accent-primary' : ''
                  }`}
                >
                  <div>
                    <div className="font-medium text-text-primary">
                      {city.city}
                    </div>
                    <div className="text-sm text-text-secondary">
                      {city.country}
                      {city.admin_name && ` • ${city.admin_name}`}
                      {city.population && ` • ${city.population < 1000000 ? Math.round(city.population / 1000) + 'K' : (city.population / 1000000).toFixed(1) + 'M'} people`}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query.length >= 2 && !isLoading ? (
            <div className="px-4 py-3 text-text-secondary">
              No cities found
            </div>
          ) : null}
        </div>
      )}

    </div>
  );
  }
);

CitySearchInput.displayName = 'CitySearchInput';



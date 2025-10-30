import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCitySearch } from '../../hooks/useCitySearch';
import { dropdownVariants } from '../../lib/animations';
import type { CityRecord } from '../../types/city';

interface CitySearchInputProps {
  onSelect: (city: CityRecord) => void;
}

export function CitySearchInput({ onSelect }: CitySearchInputProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { results, isLoading, isReady, search } = useCitySearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
  }, [results]);

  const handleSelect = (city: CityRecord) => {
    onSelect(city);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => query.length >= 2 && setIsOpen(true)}
        placeholder={isReady ? "Search for a city..." : "Loading cities..."}
        disabled={!isReady}
        aria-label="Search for a city"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-autocomplete="list"
        className="
          w-full px-4 py-3 rounded-lg border-2
          bg-bg-secondary text-text-primary
          border-gray-300 dark:border-gray-600
          focus:border-accent-primary focus:outline-none
          transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      />

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            ref={dropdownRef}
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            role="listbox"
            aria-label="City search results"
            className="
              absolute z-50 w-full mt-2
              bg-bg-secondary rounded-lg shadow-xl
              border border-gray-200 dark:border-gray-700
              max-h-64 overflow-y-auto
            "
          >
            {results.map((city, index) => (
              <motion.div
                key={`${city.city}-${city.country}-${index}`}
                onClick={() => handleSelect(city)}
                role="option"
                aria-selected={index === selectedIndex}
                className={`
                  px-4 py-3 cursor-pointer
                  transition-colors duration-150
                  ${index === selectedIndex
                    ? 'bg-accent-primary text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
                whileHover={{ backgroundColor: index === selectedIndex ? undefined : 'rgba(0,0,0,0.05)' }}
              >
                <div className="font-medium">{city.city}</div>
                <div className={`text-sm ${index === selectedIndex ? 'text-white/80' : 'text-text-secondary'}`}>
                  {city.country} {city.population ? `• ${(city.population / 1000000).toFixed(1)}M` : ''}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="w-5 h-5 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}


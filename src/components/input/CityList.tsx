import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTravelStore } from '../../store/travelStore';
import { Button } from '../ui/Button';
import { CityEditModal } from './CityEditModal';
import { CityDeleteModal } from './CityDeleteModal';
import { format } from 'date-fns';
import { getContinentFromCountryCode, type Continent } from '../../lib/continentMapping';
import { Edit, X, SortAsc, Filter, MapPin, Calendar, Globe, AArrowDown, UserRoundPen } from 'lucide-react';
import type { City } from '../../types/city';

interface CityListProps {
  highlightedCityId?: string | null;
}

type SortOption = 'alphabetical' | 'date-visited' | 'date-added';
type FilterOption = {
  continent: Continent | 'all';
  country: string | 'all';
};

const getFlagEmoji = (countryCode: string) => {
  if (!countryCode || countryCode.length !== 2) {
    console.warn("Invalid country code provided. Please use a two-letter ISO 3166-1 alpha-2 code.");
    return ''; // Return an empty string or handle the error as needed
  }

  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0)); // 127397 is the offset for regional indicator symbols

  return String.fromCodePoint(...codePoints);
};

export function CityList({ highlightedCityId = null }: CityListProps) {
  const { cities, preferences, trips } = useTravelStore();
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [deletingCity, setDeletingCity] = useState<City | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('date-visited');
  const [sortAscending, setSortAscending] = useState(false);
  const [filters, setFilters] = useState<FilterOption>({ continent: 'all', country: 'all' });
  const [showFilters, setShowFilters] = useState(false);

  // Enhanced filtering and sorting logic
  const processedCities = useMemo(() => {
    let result = cities;

    // First apply trip filtering
    if (preferences.selectedTripId) {
      const selectedTrip = trips.find(trip => trip.id === preferences.selectedTripId);
      if (selectedTrip) {
        result = result.filter(city => selectedTrip.cityIds.includes(city.id));
      }
    }

    // Apply continent and country filters
    if (filters.continent !== 'all') {
      result = result.filter(city => {
        const continent = getContinentFromCountryCode(city.iso2);
        return continent === filters.continent;
      });
    }

    if (filters.country !== 'all') {
      result = result.filter(city => city.country === filters.country);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'alphabetical':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date-visited': {
          const dateA = new Date(a.lastVisited);
          const dateB = new Date(b.lastVisited);
          comparison = dateA.getTime() - dateB.getTime();
          break;
        }
        case 'date-added': {
          const addedA = new Date(a.dateAdded);
          const addedB = new Date(b.dateAdded);
          comparison = addedA.getTime() - addedB.getTime();
          break;
        }
      }

      return sortAscending ? comparison : -comparison;
    });

    return result;
  }, [cities, preferences.selectedTripId, trips, filters, sortBy, sortAscending]);

  // Get unique countries and continents for filter options
  const availableCountries = useMemo(() => {
    const countries = new Set(cities.map(city => city.country));
    return Array.from(countries).sort();
  }, [cities]);

  const availableContinents = useMemo(() => {
    const continents = new Set(
      cities
        .map(city => getContinentFromCountryCode(city.iso2))
        .filter((continent): continent is Continent => continent !== null)
    );
    return Array.from(continents).sort();
  }, [cities]);

  const handleDelete = (city: City) => {
    setDeletingCity(city);
  };

  const getTypeColor = (type: City['type']) => {
    return type === 'visited' ? 'bg-accent-visited' : 'bg-accent-lived';
  };


  if (processedCities.length === 0) {
    const hasFilters = filters.continent !== 'all' || filters.country !== 'all';
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center py-16 px-4"
      >
        <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
          <div className="relative">
            <svg className="w-24 h-24 text-text-secondary/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-text-primary">
              {hasFilters ? 'No cities match your filters' : 'Start Your Travel Journey'}
            </h3>
            <p className="text-text-secondary">
              {hasFilters
                ? 'Try adjusting your filters or clearing them to see all cities.'
                : 'Add cities you\'ve visited or lived in to visualize your travel history on the map.'
              }
            </p>
          </div>
          {hasFilters && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFilters({ continent: 'all', country: 'all' })}
              className="mt-2"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls Header */}
      <div className="flex items-center justify-between bg-bg-secondary/30 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
        {/* Sort Controls */}
        <div className="flex items-center justify-between flex-1">
          <div className="flex gap-0.5 bg-bg-primary/30 rounded-lg p-0.5">
            {[
              { key: 'alphabetical' as SortOption, icon: AArrowDown, label: 'Alphabetical' },
              { key: 'date-visited' as SortOption, icon: Calendar, label: 'Visited' },
              { key: 'date-added' as SortOption, icon: UserRoundPen, label: 'Added' }
            ].map(({ key, icon: Icon, label }) => (
              <motion.button
                key={key}
                onClick={() => setSortBy(key)}
                className={`px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-2 ${
                  sortBy === key
                    ? 'bg-accent-primary text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-primary/50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={`Sort by ${key === 'alphabetical' ? 'name' : key === 'date-visited' ? 'visit date' : 'date added'}`}
              >
                <Icon className="w-4 h-4" />
                {sortBy === key && <span className="text-sm font-medium">{label}</span>}
              </motion.button>
            ))}
          </div>
          <motion.button
            onClick={() => setSortAscending(!sortAscending)}
            className="p-2 rounded-md bg-bg-primary/30 text-text-secondary hover:text-text-primary hover:bg-bg-primary/50 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={sortAscending ? 'Sort descending' : 'Sort ascending'}
          >
            <motion.div
              animate={{ rotate: sortAscending ? 0 : 180 }}
              transition={{ duration: 0.2 }}
            >
              <SortAsc className="w-4 h-4" />
            </motion.div>
          </motion.button>
        </div>

        {/* Filter Toggle */}
        <motion.button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-md transition-all duration-200 ${
            showFilters || filters.continent !== 'all' || filters.country !== 'all'
              ? 'bg-accent-primary text-white shadow-sm'
              : 'bg-bg-primary/30 text-text-secondary hover:text-text-primary hover:bg-bg-primary/50'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Filter className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Filter Controls */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="bg-bg-secondary/50 backdrop-blur-sm rounded-xl p-4 border border-white/30 overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Continent Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Continent
                </label>
                <select
                  value={filters.continent}
                  onChange={(e) => setFilters(prev => ({ ...prev, continent: e.target.value as Continent | 'all' }))}
                  className="w-full px-3 py-2 bg-bg-primary border border-white/20 rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary"
                >
                  <option value="all">All Continents</option>
                  {availableContinents.map(continent => (
                    <option key={continent} value={continent}>{continent}</option>
                  ))}
                </select>
              </div>

              {/* Country Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Country
                </label>
                <select
                  value={filters.country}
                  onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-3 py-2 bg-bg-primary border border-white/20 rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary"
                >
                  <option value="all">All Countries</option>
                  {availableCountries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters Summary */}
            {(filters.continent !== 'all' || filters.country !== 'all') && (
              <div className="mt-4 pt-4 border-t border-white/30">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {filters.continent !== 'all' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent-primary/10 text-accent-primary rounded-full text-xs">
                        <Globe className="w-3 h-3" />
                        {filters.continent}
                        <button
                          onClick={() => setFilters(prev => ({ ...prev, continent: 'all' }))}
                          className="ml-1 hover:bg-accent-primary/20 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {filters.country !== 'all' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent-primary/10 text-accent-primary rounded-full text-xs">
                        <MapPin className="w-3 h-3" />
                        {filters.country}
                        <button
                          onClick={() => setFilters(prev => ({ ...prev, country: 'all' }))}
                          className="ml-1 hover:bg-accent-primary/20 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setFilters({ continent: 'all', country: 'all' })}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cities Count */}
      <div className="text-sm text-text-secondary">
        Showing {processedCities.length} of {cities.length} cities
      </div>

      {/* City List */}
      <div
        className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-border-color scrollbar-track-transparent"
      >
        {processedCities.map((city) => (
          <motion.div
            key={city.id}
            animate={highlightedCityId === city.id ? {
              scale: [1, 1.02, 1],
              transition: { duration: 0.5, repeat: 2 }
            } : {}}
            style={{
              position: 'relative',
              zIndex: highlightedCityId === city.id ? 1 : 0
            }}
            className={`
              bg-bg-secondary/95 backdrop-blur-sm rounded-2xl p-3 shadow-lg border group hover:shadow-xl transition-all duration-300
              ${highlightedCityId === city.id
                ? 'border-accent-primary border-2 shadow-lg shadow-accent-primary/20 bg-accent-primary/5'
                : 'border-white/50 hover:border-white/20'
              }
            `}
          >
            <div className="flex flex-col gap-2">
              {/* City Name Row with Action Buttons */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative flex-shrink-0">
                    <div className={`
                      ${city.type === 'lived' ? 'w-4 h-4' : 'w-3 h-3'} rounded-full border-2 border-white shadow-sm
                      ${getTypeColor(city.type)}
                    `} />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary truncate">
                    {city.name}
                  </h3>
                </div>

                {/* Action Buttons - Only visible on hover */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCity(city);
                    }}
                    className="p-2 text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 rounded-xl transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title="Edit city"
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(city);
                    }}
                    className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title="Delete city"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Location Info - Side by side */}
              <div className="flex items-center gap-4 justify-between">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{city.country}</span>
                  {city.iso2 && (
                    <span className="-mb-[1px]">
                      {getFlagEmoji(city.iso2)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-text-secondary mr-1">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="font-mono">
                    {(() => {
                      const date = new Date(city.lastVisited);
                      return isNaN(date.getTime()) ? 'Invalid date' : format(date, 'MMM dd, yyyy');
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {editingCity && (
        <CityEditModal
          city={editingCity}
          isOpen={true}
          onClose={() => setEditingCity(null)}
        />
      )}

      {deletingCity && (
        <CityDeleteModal
          city={deletingCity}
          isOpen={true}
          onClose={() => setDeletingCity(null)}
        />
      )}
    </div>
  );
}


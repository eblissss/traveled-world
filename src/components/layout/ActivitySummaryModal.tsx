import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';
import type { City } from '../../types/city';
import type { Trip } from '../../types/trip';

interface ActivitySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  cities: City[];
  trips: Trip[];
}

interface TravelStatistics {
  totalCities: number;
  visitedCities: number;
  livedCities: number;
  uniqueCountries: number;
  totalPopulation: number;
  avgPopulation: number;
  largestCity: City;
  totalTrips: number;
  avgCitiesPerTrip: number;
  citiesThisYear: number;
  citiesLastYear: number;
  continentsCount: number;
  topCountries: Array<{ country: string; count: number }>;
  citiesAddedToday: number;
}

/**
 * Calculate comprehensive travel statistics
 */
const calculateTravelStatistics = (cities: City[], trips: Trip[]): TravelStatistics | null => {
  if (!cities.length) return null;

  const basicStats = calculateBasicStats(cities);
  const populationStats = calculatePopulationStats(cities);
  const tripStats = calculateTripStats(trips);
  const timeStats = calculateTimeStats(cities);
  const geographicStats = calculateGeographicStats(cities);

  return {
    ...basicStats,
    ...populationStats,
    ...tripStats,
    ...timeStats,
    ...geographicStats,
    citiesAddedToday: cities.filter(city =>
      new Date(city.lastVisited).toDateString() === new Date().toDateString()
    ).length
  };
};

/**
 * Calculate basic city and country counts
 */
const calculateBasicStats = (cities: City[]) => {
  const totalCities = cities.length;
  const visitedCities = cities.filter(c => c.type === 'visited').length;
  const livedCities = cities.filter(c => c.type === 'lived').length;

  const countries = cities.reduce((acc, city) => {
    acc[city.country] = (acc[city.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueCountries = Object.keys(countries).length;
  const topCountries = Object.entries(countries)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([country, count]) => ({ country, count }));

  return { totalCities, visitedCities, livedCities, uniqueCountries, topCountries };
};

/**
 * Calculate population-related statistics
 */
const calculatePopulationStats = (cities: City[]) => {
  const totalPopulation = cities.reduce((sum, city) => sum + (city.population || 0), 0);

  // Calculate median population
  const sortedPopulations = cities
    .map(city => city.population || 0)
    .sort((a, b) => a - b);
  const mid = Math.floor(sortedPopulations.length / 2);
  const medianPopulation = sortedPopulations.length % 2 === 0
    ? Math.round((sortedPopulations[mid - 1] + sortedPopulations[mid]) / 2)
    : sortedPopulations[mid];

  const largestCity = cities.reduce((max, city) =>
    (city.population || 0) > (max.population || 0) ? city : max
  );

  return { totalPopulation, avgPopulation: medianPopulation, largestCity };
};

/**
 * Calculate trip-related statistics
 */
const calculateTripStats = (trips: Trip[]) => {
  const totalTrips = trips.length;
  const tripCities = trips.reduce((sum, trip) => sum + trip.cityIds.length, 0);
  const avgCitiesPerTrip = totalTrips > 0 ? Math.round(tripCities / totalTrips) : 0;

  return { totalTrips, avgCitiesPerTrip };
};

/**
 * Calculate time-based statistics
 */
const calculateTimeStats = (cities: City[]) => {
  const now = new Date();
  const thisYear = now.getFullYear();

  const citiesThisYear = cities.filter(city =>
    new Date(city.lastVisited).getFullYear() === thisYear
  ).length;

  const lastYear = thisYear - 1;
  const citiesLastYear = cities.filter(city =>
    new Date(city.lastVisited).getFullYear() === lastYear
  ).length;

  return { citiesThisYear, citiesLastYear };
};

/**
 * Calculate geographic diversity statistics
 */
const calculateGeographicStats = (cities: City[]) => {
  const continents = new Set(cities.map(city => getContinent(city.country)));
  const continentsCount = continents.size;

  return { continentsCount };
};

// Utility functions
function formatNumber(num: number): string {
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

function getContinent(country: string): string {
  // Simplified continent mapping - in a real app, you'd use a proper library
  const continents: Record<string, string> = {
    // Europe
    'France': 'Europe', 'Germany': 'Europe', 'Italy': 'Europe', 'Spain': 'Europe', 'UK': 'Europe',
    'Netherlands': 'Europe', 'Belgium': 'Europe', 'Switzerland': 'Europe', 'Austria': 'Europe',
    // North America
    'USA': 'North America', 'Canada': 'North America', 'Mexico': 'North America',
    // Asia
    'Japan': 'Asia', 'China': 'Asia', 'India': 'Asia', 'Thailand': 'Asia', 'Vietnam': 'Asia',
    // Oceania
    'Australia': 'Oceania', 'New Zealand': 'Oceania',
    // Africa
    'Morocco': 'Africa', 'Egypt': 'Africa', 'South Africa': 'Africa',
    // South America
    'Brazil': 'South America', 'Argentina': 'South America', 'Chile': 'South America'
  };
  return continents[country] || 'Unknown';
}

export function ActivitySummaryModal({
  isOpen,
  onClose,
  cities,
  trips
}: ActivitySummaryModalProps) {
  const statistics = useMemo(() =>
    calculateTravelStatistics(cities, trips),
    [cities, trips]
  );

  if (!statistics) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-bg-secondary border border-white/30 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden pointer-events-auto max-h-[80vh] flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/20 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-text-primary">Travel Activity</h2>
                  <p className="text-sm text-text-secondary">Your journey so far</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-primary/50 rounded-lg transition-colors"
                  aria-label="Close activity summary"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl border border-blue-500/30"
                  >
                    <div className="text-2xl font-bold text-blue-400">{statistics.totalCities}</div>
                    <div className="text-sm text-text-secondary">Total Cities</div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl border border-purple-500/30"
                  >
                    <div className="text-2xl font-bold text-purple-400">{statistics.uniqueCountries}</div>
                    <div className="text-sm text-text-secondary">Countries</div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl border border-green-500/30"
                  >
                    <div className="text-2xl font-bold text-green-400">{statistics.continentsCount}</div>
                    <div className="text-sm text-text-secondary">Continents</div>
                  </motion.div>
                </div>

                {/* City Types */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-4"
                >
                  <h3 className="font-semibold text-text-primary">City Types</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-500/10 to-green-600/5 rounded-lg border border-green-500/30">
                      <span className="text-text-secondary">Visited</span>
                      <span className="font-medium text-green-400">{statistics.visitedCities}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-500/10 to-purple-600/5 rounded-lg border border-purple-500/30">
                      <span className="text-text-secondary">Lived In</span>
                      <span className="font-medium text-purple-400">{statistics.livedCities}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Population Insights */}
                {statistics.totalPopulation > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-4"
                  >
                    <h3 className="font-semibold text-text-primary">Population Insights</h3>
                    <div className="space-y-3 p-4 bg-gradient-to-br from-blue-500/5 to-blue-600/10 rounded-lg border border-blue-500/20">
                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary">Total Population</span>
                        <span className="font-medium text-blue-400">{formatNumber(statistics.totalPopulation)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary">Median per City</span>
                        <span className="font-medium text-blue-300">{formatNumber(statistics.avgPopulation)}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Trip Analytics */}
                {statistics.totalTrips > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="space-y-4"
                  >
                    <h3 className="font-semibold text-text-primary">Trip Analytics</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-lg border border-green-500/30 text-center">
                        <div className="text-xl font-bold text-green-400">{statistics.totalTrips}</div>
                        <div className="text-xs text-text-secondary">Total Trips</div>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-lg border border-purple-500/30 text-center">
                        <div className="text-xl font-bold text-purple-400">{statistics.avgCitiesPerTrip}</div>
                        <div className="text-xs text-text-secondary">Avg Cities/Trip</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Recent Activity */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-4"
                >
                  <h3 className="font-semibold text-text-primary">Recent Activity</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-lg border border-blue-500/30 text-center">
                      <div className="text-xl font-bold text-blue-400">{statistics.citiesThisYear}</div>
                      <div className="text-xs text-text-secondary">Visited This Year</div>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-lg border border-purple-500/30 text-center">
                      <div className="text-xl font-bold text-purple-400">{statistics.citiesLastYear}</div>
                      <div className="text-xs text-text-secondary">Visited Last Year</div>
                    </div>
                  </div>
                </motion.div>

                {/* Top Countries */}
                {statistics.topCountries.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="space-y-4"
                  >
                    <h3 className="font-semibold text-text-primary">Top Countries</h3>
                    <div className="space-y-2">
                      {statistics.topCountries.map((item, index) => (
                        <div key={item.country} className="flex justify-between items-center p-3 rounded-lg border border-white/20 bg-bg-primary/30">
                          <span className="text-text-secondary font-medium">
                            {index === 0 && '🥇'} {index === 1 && '🥈'} {index === 2 && '🥉'} {item.country}
                          </span>
                          <span className="font-medium text-accent-primary">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-white/20 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

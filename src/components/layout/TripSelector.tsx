import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Route, ChevronDown, Globe, X, Plus, Check, Edit, Calendar } from 'lucide-react';
import { useTravelStore } from '../../store/travelStore';
import type { City } from '../../types/city';

interface TripSelectorProps {
  onNewTrip?: () => void;
  onEditTrip?: (tripId: string) => void;
}

export function TripSelector({ onNewTrip, onEditTrip }: TripSelectorProps = {}) {
  const { trips, cities, preferences, updatePreferences, deleteTrip } = useTravelStore();
  const canCreateTrip = cities.length >= 2;
  const selectedTripId = preferences.selectedTripId;
  const [isExpanded, setIsExpanded] = useState(false);

  if (trips.length === 0) {
    return null;
  }

  const selectedTrip = trips.find(t => t.id === selectedTripId);

  const handleDeleteTrip = (tripId: string) => {
    if (selectedTripId === tripId) {
      // If deleting the currently selected trip, switch to "All Cities"
      updatePreferences({ selectedTripId: null });
    }
    deleteTrip(tripId);
  };

  return (
    <div className="relative">
      {/* Header with New Trip Button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-text-primary">Your Trips</h2>
      </div>

      {/* Main Trip Selector Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-bg-secondary/95 backdrop-blur-xl border border-white/30 rounded-2xl shadow-lg hover:shadow-xl hover:border-white/50 transition-all duration-300 group"
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        aria-expanded={isExpanded}
        aria-haspopup="listbox"
        aria-label="Select trip to display"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Trip Icon */}
          <div className="relative flex-shrink-0">
            <motion.div
              className="w-8 h-8 rounded-xl flex items-center justify-center relative overflow-hidden"
              style={{
                background: selectedTrip
                  ? `linear-gradient(135deg, ${selectedTrip.color}20, ${selectedTrip.color}30)`
                  : 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))'
              }}
            >
              <Route className="w-4 h-4 text-text-primary" />
              {selectedTripId && (
                <motion.div
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: selectedTrip?.color }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                />
              )}
            </motion.div>
          </div>

          {/* Trip Info */}
          <div className="flex-1 text-left min-w-0">
            <div className="font-semibold text-text-primary truncate">
              {selectedTrip ? selectedTrip.name : 'All Cities'}
            </div>
            <div className="text-xs text-text-secondary">
              {selectedTrip
                ? `${selectedTrip.cityIds.length} cities`
                : `${cities.length} cities`
              }
            </div>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-text-secondary group-hover:text-text-primary transition-colors flex-shrink-0 ml-3"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.button>

      {/* Modern Trip Dropdown Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute top-full mt-3 left-0 w-full bg-bg-secondary/98 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-2xl z-[9999] overflow-hidden"
          >
            {/* Trip List */}
            <div className="max-h-80 overflow-y-auto">
              {/* New Trip Option */}
              <motion.div
                className="border-b border-white/10 last:border-b-0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`
                  px-5 py-4 hover:bg-bg-primary/50 transition-all duration-200 group ${canCreateTrip ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
                `} onClick={() => {
                  if (canCreateTrip) {
                    onNewTrip?.();
                    setIsExpanded(false);
                  }
                }}>
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="relative flex-shrink-0">
                      <motion.div
                        className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.3))`
                        }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Plus className="w-5 h-5 text-accent-primary" />
                      </motion.div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-accent-primary truncate">New Trip</span>
                      </div>
                      <p className="text-xs text-text-secondary font-mono">
                        {canCreateTrip ? 'Create a new trip from selected cities' : 'Add at least 2 cities to create a trip'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* All Cities Option */}
              <motion.div
                className="border-b border-white/10 last:border-b-0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05, duration: 0.3 }}
              >
                <div className={`
                  px-5 py-4 hover:bg-bg-primary/50 transition-all duration-200 group cursor-pointer
                  ${!selectedTripId ? 'bg-accent-primary/5' : ''}
                `} onClick={() => updatePreferences({ selectedTripId: null })}>
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="relative flex-shrink-0">
                      <motion.div
                        className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))`
                        }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Globe className="w-5 h-5 text-text-primary" />
                      </motion.div>
                      {!selectedTripId && (
                        <motion.div
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent-primary flex items-center justify-center shadow-lg"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        >
                          <Check className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-text-primary truncate">All Cities</span>
                        <span className="text-xs text-text-secondary bg-bg-primary/50 px-2 py-0.5 rounded-full">
                          {cities.length} cities
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary font-mono">
                        Show all cities on the map
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Individual Trips */}
              {trips.map((trip, index) => {
                const isSelected = selectedTripId === trip.id;
                const tripCities = trip.cityIds
                  .map(id => cities.find(c => c.id === id))
                  .filter((city): city is City => city !== undefined);

                return (
                  <motion.div
                    key={trip.id}
                    className="border-b border-white/10 last:border-b-0"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index + 2) * 0.05, duration: 0.3 }}
                  >
                    <div className={`
                      px-5 py-3 hover:bg-bg-primary/50 transition-all duration-200 group cursor-pointer
                      ${isSelected ? 'bg-accent-primary/5' : ''}
                    `} onClick={() => updatePreferences({ selectedTripId: trip.id })}>
                      <div className="flex flex-col gap-3">
                        {/* Trip Name Row with Action Buttons */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Trip Color Indicator */}
                            <div className="relative flex-shrink-0">
                              <motion.div
                                className="w-8 h-8 rounded-xl flex items-center justify-center relative overflow-hidden"
                                style={{
                                  background: `linear-gradient(135deg, ${trip.color}20, ${trip.color}30)`
                                }}
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Route className="w-4 h-4 text-text-primary" />
                                {isSelected && (
                                  <motion.div
                                    className="absolute inset-0 rounded-xl border-2 border-white shadow-lg"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                  />
                                )}
                              </motion.div>
                              {isSelected && (
                                <motion.div
                                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent-primary flex items-center justify-center shadow-lg"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                                >
                                  <Check className="w-3 h-3 text-white" />
                                </motion.div>
                              )}
                            </div>
                            <h3 className="text-lg font-bold text-text-primary truncate">
                              {trip.name}
                            </h3>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditTrip?.(trip.id);
                              }}
                              className="p-2 text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 rounded-xl transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              title="Edit trip"
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTrip(trip.id);
                              }}
                              className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              title="Delete trip"
                            >
                              <X className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>

                        {/* Trip Info Row - Side by side */}
                        <div className="flex items-center gap-4 ml-2">
                          <div className="flex items-center gap-2 text-xs text-text-secondary">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span className="font-mono">
                              Created {format(new Date(trip.createdAt), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-text-secondary">
                            <Route className="w-4 h-4 flex-shrink-0" />
                            <span>{tripCities.length} cities</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      {isExpanded && (
        <motion.div
          className="fixed inset-0 z-40 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}


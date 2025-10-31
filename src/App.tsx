import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Header } from './components/layout/Header';
import { CitySearchInput } from './components/input/CitySearchInput';
import { CityTypeSelector } from './components/input/CityTypeSelector';
import { DatePicker } from './components/input/DatePicker';
import { CityList } from './components/input/CityList';
import { TripSelector } from './components/layout/TripSelector';
import { Globe3D } from './components/map/Globe3D';
import { Map2D } from './components/map/Map2D';
import { HoverTooltip } from './components/map/HoverTooltip';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ActivitySummaryModal } from './components/layout/ActivitySummaryModal';
import { useToast } from './components/ui/Toast';
import { useTravelStore } from './store/travelStore';
import { TripCreationModal } from './components/input/TripCreationModal';
import type { City, CityRecord } from './types/city';
import type { Trip } from './types/trip';
import { getCoordinates, formatCityName } from './lib/geocoding';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

// Helper function to create a city object from city record
const createCityFromRecord = (
  cityRecord: CityRecord,
  type: 'visited' | 'lived' = 'visited',
  lastVisited: string = new Date().toISOString().split('T')[0]
): City => ({
  id: crypto.randomUUID(),
  name: cityRecord.city,
  country: cityRecord.country,
  coordinates: getCoordinates(cityRecord),
  type,
  lastVisited,
  dateAdded: new Date().toISOString(),
  adminName: cityRecord.admin_name,
  capital: cityRecord.capital,
  population: cityRecord.population,
  iso2: cityRecord.iso2,
  iso3: cityRecord.iso3
});

function App() {
  const { cities, addCity, preferences, undo, redo, trips } = useTravelStore();
  const { showToast, ToastContainer } = useToast();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Enhanced undo/redo with visual feedback
  const handleUndo = () => {
    undo();
    showToast({ message: 'Undone', type: 'info', duration: 2000 });
  };

  const handleRedo = () => {
    redo();
    showToast({ message: 'Redone', type: 'info', duration: 2000 });
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onUndo: handleUndo,
    onRedo: handleRedo,
    onNewTrip: () => cities.length >= 2 && setShowTripModal(true),
    onFocusSearch: () => {
      searchInputRef.current?.focus();
    },
    onCloseModal: () => {
      // Close any open modals/panels
      setShowForm(false);
      setSelectedCity(null);
      setShowTripModal(false);
    },
  });
  const [showForm, setShowForm] = useState(false);
  const [selectedCity, setSelectedCity] = useState<CityRecord | null>(null);
  const [cityType, setCityType] = useState<'visited' | 'lived'>('visited');
  const [visitDate, setVisitDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [highlightedCityId, setHighlightedCityId] = useState<string | null>(null);
  const [showTripModal, setShowTripModal] = useState(false);
  const [tripToEdit, setTripToEdit] = useState<Trip | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const datePickerRef = useRef<HTMLInputElement>(null);

  // Tooltip state for hover interactions on both map types
  const [hoveredCity, setHoveredCity] = useState<City | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  // Tooltip handlers
  const showTooltip = (city: City, position: { x: number; y: number }) => {
    setHoveredCity(city);
    setTooltipPosition(position);
    setIsTooltipVisible(true);
  };

  const hideTooltip = () => {
    setIsTooltipVisible(false);
    setHoveredCity(null);
    setTooltipPosition(null);
  };

  const handleCitySelect = (city: CityRecord) => {
    setSelectedCity(city);
    setShowForm(true);
    setVisitDate(new Date().toISOString().split('T')[0]);
  };

  // Auto-focus date picker after city type selection
  useEffect(() => {
    if (showForm && selectedCity && cityType && datePickerRef.current) {
      // Small delay to ensure form is rendered
      const timer = setTimeout(() => {
        datePickerRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [cityType, showForm, selectedCity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCity || !visitDate) return;

    try {
      addCity(createCityFromRecord(selectedCity, cityType, visitDate));
      setShowForm(false);
      setSelectedCity(null);
      setVisitDate('');
      setError(null);
      showToast({ message: 'City added successfully!', type: 'success' });

      // Focus back on search input for quick successive additions
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } catch (err) {
      if (err instanceof Error && 'duplicateCityId' in err) {
        const duplicateId = (err as Error & { duplicateCityId?: string }).duplicateCityId;
        const duplicateCity = useTravelStore.getState().cities.find(c => c.id === duplicateId);
        const errorMessage = duplicateCity
          ? `"${selectedCity.city}" is already in your list as "${duplicateCity.name}". Click to view it.`
          : err.message;
        setError(errorMessage);
        if (duplicateId) {
          setHighlightedCityId(duplicateId);
          setTimeout(() => setHighlightedCityId(null), 5000);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add city. Please try again.';
        setError(errorMessage);
        showToast({ message: errorMessage, type: 'error' });
      }
      setTimeout(() => setError(null), 5000);
    }
  };

  const currentView = preferences.defaultView;
  const currentTheme = preferences.theme;

  return (
    <ErrorBoundary>
      {/* Skip links for accessibility navigation */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent-primary focus:text-white focus:rounded-lg focus:shadow-lg">
        Skip to main content
      </a>
      <a href="#search-input" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-32 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent-primary focus:text-white focus:rounded-lg focus:shadow-lg">
        Skip to search
      </a>

      {/* Test data marker for automated testing */}
      <div data-testid="app-loaded" style={{ display: 'none' }} />

      <div className="flex flex-col h-screen bg-bg-primary" role="application" aria-label="Traveled World - Travel Mapping Application">
        {/* Header with navigation role */}
        <header role="banner">
          <Header onUndo={handleUndo} onRedo={handleRedo} />
        </header>
      
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar - Input Panel */}
        <aside
          role="complementary"
          aria-label="City input and management panel"
          className="w-full lg:w-96 bg-bg-secondary border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
        >
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex flex-col h-full"
          >
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <section aria-labelledby="add-city-heading">
                <h2 id="add-city-heading" className="text-xl font-semibold mb-4 text-text-primary">Add City</h2>
                <div id="search-input">
                  <CitySearchInput ref={searchInputRef} onSelect={handleCitySelect} />
                </div>
              
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
                    animate={prefersReducedMotion ? {} : { 
                      opacity: 1, 
                      y: 0,
                      x: [-10, 10, -5, 5, 0]
                    }}
                    exit={{ opacity: 0 }}
                    transition={prefersReducedMotion ? {} : { duration: 0.4 }}
                    className="mt-2 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm"
                    role="alert"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            <AnimatePresence>
              {showForm && selectedCity && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleSubmit}
                  onKeyDown={(e) => {
                    // Allow Enter key to submit the form
                    if (e.key === 'Enter' && !e.shiftKey && selectedCity && visitDate) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  className="space-y-4 bg-bg-primary p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div>
                    <h3 className="font-semibold text-text-primary mb-2">
                      {selectedCity ? formatCityName(selectedCity) : ''}
                    </h3>
                  </div>
                  
                  {selectedCity && (
                    <>
                      <CityTypeSelector value={cityType} onChange={setCityType} />
                      
                      <DatePicker
                        ref={datePickerRef}
                        label="Visit Date"
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        required
                      />
                      
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 px-4 py-2 bg-accent-primary text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                        >
                          Add City
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowForm(false);
                            setSelectedCity(null);
                            setCityType('visited');
                            setVisitDate('');
                          }}
                          className="px-4 py-2 bg-bg-secondary text-text-secondary rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </motion.form>
              )}
            </AnimatePresence>

            <section aria-labelledby="cities-heading">
              <div className="flex items-center justify-between mb-4">
                <h2 id="cities-heading" className="text-xl font-semibold text-text-primary">Your Cities</h2>
                <button
                  onClick={() => setShowActivityModal(true)}
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors px-3 py-1 rounded-md hover:bg-bg-primary/50"
                  aria-label="View activity statistics"
                >
                  See Stats
                </button>
              </div>
              <CityList highlightedCityId={highlightedCityId} />
            </section>

            <section aria-labelledby="trips-heading">
              <TripSelector
                onNewTrip={() => {
                  setTripToEdit(null);
                  setShowTripModal(true);
                }}
                onEditTrip={(tripId) => {
                  const trip = useTravelStore.getState().trips.find(t => t.id === tripId);
                  if (trip) {
                    setTripToEdit(trip);
                    setShowTripModal(true);
                  }
                }}
              />
            </section>
          </div>
        </motion.div>
        </aside>

        {/* Right Side - Map View */}
        <main
          id="main-content"
          role="main"
          aria-label="Interactive map and globe visualization"
          className="flex-1 relative"
        >
          <AnimatePresence mode="wait">
            {currentView === '3d' ? (
              <motion.div
                key="globe"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <Globe3D
                  onCityHover={showTooltip}
                  onCityHoverEnd={hideTooltip}
                />
              </motion.div>
            ) : (
              <motion.div
                key="map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                  <Map2D
                    theme={currentTheme === 'satellite' ? 'satellite' : currentTheme === 'dark' ? 'dark' : currentTheme === 'minimal' ? 'minimal' : 'light'}
                    onCityHover={showTooltip}
                    onCityHoverEnd={hideTooltip}
                  />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
      </div>

      {/* Toast notifications */}
      <ToastContainer />

      {/* Trip Creation Modal */}
      <TripCreationModal
        isOpen={showTripModal}
        onClose={() => {
          setShowTripModal(false);
          setTripToEdit(null);
        }}
        tripToEdit={tripToEdit}
      />

      {/* Activity Summary Modal */}
      <ActivitySummaryModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        cities={cities}
        trips={trips}
      />

      {/* Hover Tooltip for both map views */}
      <HoverTooltip
        city={hoveredCity}
        position={tooltipPosition}
        isVisible={isTooltipVisible}
      />
    </ErrorBoundary>
  );
}

export default App;


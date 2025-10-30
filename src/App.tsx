import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './components/layout/Header';
import { CitySearchInput } from './components/input/CitySearchInput';
import { CityTypeSelector } from './components/input/CityTypeSelector';
import { DatePicker } from './components/input/DatePicker';
import { CityList } from './components/input/CityList';
import { Globe3D } from './components/map/Globe3D';
import { Map2D } from './components/map/Map2D';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { useTravelStore } from './store/travelStore';
import type { CityRecord } from './types/city';
import { getCoordinates, formatCityName } from './lib/geocoding';

function App() {
  const { addCity, preferences } = useTravelStore();
  const [showForm, setShowForm] = useState(false);
  const [selectedCity, setSelectedCity] = useState<CityRecord | null>(null);
  const [cityType, setCityType] = useState<'visited' | 'lived'>('visited');
  const [visitDate, setVisitDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCitySelect = (city: CityRecord) => {
    setSelectedCity(city);
    setShowForm(true);
    setVisitDate(new Date().toISOString().split('T')[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCity || !visitDate) return;

    try {
      const newCity = {
        id: crypto.randomUUID(),
        name: selectedCity.city,
        country: selectedCity.country,
        coordinates: getCoordinates(selectedCity),
        type: cityType,
        lastVisited: visitDate,
        dateAdded: new Date().toISOString()
      };

      addCity(newCity);
      setShowForm(false);
      setSelectedCity(null);
      setVisitDate('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add city');
      setTimeout(() => setError(null), 5000);
    }
  };

  const currentView = preferences.defaultView;
  const currentTheme = preferences.theme;

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen bg-bg-primary">
        <Header />
      
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar - Input Panel */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full lg:w-96 bg-bg-secondary border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
        >
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-text-primary">Add City</h2>
              <CitySearchInput onSelect={handleCitySelect} />
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-2 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm"
                  role="alert"
                >
                  {error}
                </motion.div>
              )}
            </div>

            <AnimatePresence>
              {showForm && selectedCity && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleSubmit}
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

            <div>
              <h2 className="text-xl font-semibold mb-4 text-text-primary">Your Cities</h2>
              <CityList />
            </div>
          </div>
        </motion.div>

        {/* Right Side - Map View */}
        <div className="flex-1 relative">
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
                <Globe3D />
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
                <Map2D theme={currentTheme === 'satellite' ? 'satellite' : currentTheme === 'dark' ? 'dark' : 'light'} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;


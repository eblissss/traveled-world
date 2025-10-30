import { motion, AnimatePresence } from 'framer-motion';
import { useTravelStore } from '../../store/travelStore';
import { Button } from '../ui/Button';
import { format } from 'date-fns';
import type { City } from '../../types/city';

interface CityDetailsPanelProps {
  city: City | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export function CityDetailsPanel({ city, isOpen, onClose, onEdit }: CityDetailsPanelProps) {
  const { deleteCity } = useTravelStore();

  if (!city) return null;

  const handleDelete = () => {
    // eslint-disable-next-line no-alert
    if (window.confirm(`Are you sure you want to remove ${city.name}?`)) {
      deleteCity(city.id);
      onClose();
    }
  };

  const handleGoogleSearch = () => {
    const query = encodeURIComponent(`${city.name} ${city.country}`);
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-bg-secondary shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-text-primary mb-2">
                    {city.name}
                  </h2>
                  <p className="text-lg text-text-secondary">{city.country}</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-text-secondary hover:text-text-primary transition-colors p-2"
                  aria-label="Close panel"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    city.type === 'visited'
                      ? 'bg-accent-visited text-white'
                      : 'bg-accent-lived text-white'
                  }`}>
                    {city.type === 'visited' ? 'Visited' : 'Lived'}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-text-secondary mb-1">Last Visited</p>
                  <p className="text-base font-mono text-text-primary">
                    {format(new Date(city.lastVisited), 'MMM dd, yyyy')}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-text-secondary mb-1">Added</p>
                  <p className="text-base font-mono text-text-primary">
                    {format(new Date(city.dateAdded), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleGoogleSearch}
                  className="w-full"
                  variant="secondary"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Search on Google
                  </span>
                </Button>
                
                <Button
                  onClick={onEdit}
                  className="w-full"
                  variant="secondary"
                >
                  Edit Details
                </Button>
                
                <Button
                  onClick={handleDelete}
                  className="w-full"
                  variant="danger"
                >
                  Delete City
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


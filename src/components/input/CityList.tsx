import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTravelStore } from '../../store/travelStore';
import { Button } from '../ui/Button';
import { CityEditModal } from './CityEditModal';
import { format } from 'date-fns';
import { containerVariants, cardVariants } from '../../lib/animations';
import type { City } from '../../types/city';

export function CityList() {
  const { cities, deleteCity } = useTravelStore();
  const [editingCity, setEditingCity] = useState<City | null>(null);

  const handleDelete = (id: string) => {
    // eslint-disable-next-line no-alert
    if (window.confirm('Are you sure you want to remove this city?')) {
      deleteCity(id);
    }
  };

  const getTypeColor = (type: City['type']) => {
    return type === 'visited' ? 'bg-accent-visited' : 'bg-accent-lived';
  };

  const getTypeLabel = (type: City['type']) => {
    return type === 'visited' ? 'Visited' : 'Lived';
  };

  if (cities.length === 0) {
    return (
      <div className="text-center py-12 text-text-secondary">
        <p className="text-lg">No cities added yet</p>
        <p className="text-sm mt-2">Start by searching for a city above</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      <AnimatePresence>
        {cities.map((city) => (
          <motion.div
            key={city.id}
            variants={cardVariants}
            layout
            className="bg-bg-secondary rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-text-primary">
                    {city.name}
                  </h3>
                  <span className={`
                    px-2 py-0.5 rounded text-xs font-medium text-white
                    ${getTypeColor(city.type)}
                  `}>
                    {getTypeLabel(city.type)}
                  </span>
                </div>
                <p className="text-sm text-text-secondary mb-1">{city.country}</p>
                <p className="text-xs text-text-secondary font-mono">
                  {format(new Date(city.lastVisited), 'MMM dd, yyyy')}
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingCity(city)}
                  aria-label={`Edit ${city.name}`}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(city.id)}
                  aria-label={`Delete ${city.name}`}
                >
                  Delete
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {editingCity && (
        <CityEditModal
          city={editingCity}
          isOpen={true}
          onClose={() => setEditingCity(null)}
        />
      )}
    </motion.div>
  );
}


import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTravelStore } from '../../store/travelStore';
import { Button } from '../ui/Button';
import { DatePicker } from './DatePicker';
import type { Trip } from '../../types/trip';

interface TripCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripToEdit?: Trip | null;
}

interface TripFormData {
  name: string;
  color: string;
  selectedCities: Array<{
    id: string;
    date: string;
  }>;
}

export function TripCreationModal({ isOpen, onClose, tripToEdit }: TripCreationModalProps) {
  const { cities, addTrip, updateTrip } = useTravelStore();
  const isEditing = !!tripToEdit;

  const [formData, setFormData] = useState<TripFormData>({
    name: '',
    color: 'var(--accent-primary)',
    selectedCities: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [citySearch, setCitySearch] = useState('');

  // Focus management
  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        color: 'var(--accent-primary)',
        selectedCities: []
      });
      setErrors({});
    } else if (isEditing && tripToEdit) {
      // Populate form with existing trip data
      const tripCities = tripToEdit.cityIds.map(cityId => {
        const city = cities.find(c => c.id === cityId);
        return {
          id: cityId,
          date: city?.lastVisited || new Date().toISOString().split('T')[0]
        };
      });

      setFormData({
        name: tripToEdit.name,
        color: tripToEdit.color,
        selectedCities: tripCities
      });
    } else {
      // Reset for new trip creation
      setFormData({
        name: '',
        color: 'var(--accent-primary)',
        selectedCities: []
      });
    }
  }, [isOpen, isEditing, tripToEdit, cities]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Trip name is required';
    }

    if (formData.selectedCities.length < 2) {
      newErrors.cities = 'Select at least 2 cities';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const toggleCity = (cityId: string) => {
    const city = cities.find(c => c.id === cityId);
    if (!city) return;

    setFormData(prev => {
      const isSelected = prev.selectedCities.some(c => c.id === cityId);

      if (isSelected) {
        return {
          ...prev,
          selectedCities: prev.selectedCities.filter(c => c.id !== cityId)
        };
      } else {
        return {
          ...prev,
          selectedCities: [
            ...prev.selectedCities,
            { id: cityId, date: city.lastVisited }
          ]
        };
      }
    });
  };

  const updateCityDate = (cityId: string, date: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCities: prev.selectedCities.map(city =>
        city.id === cityId ? { ...city, date } : city
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Sort cities by date
      const sortedCities = [...formData.selectedCities]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      if (isEditing && tripToEdit) {
        // Update existing trip
        updateTrip(tripToEdit.id, {
          name: formData.name.trim(),
          cityIds: sortedCities.map(c => c.id),
          dates: sortedCities.map(c => c.date),
          color: formData.color
        });
      } else {
        // Create new trip
      addTrip({
        id: crypto.randomUUID(),
        name: formData.name.trim(),
        cityIds: sortedCities.map(c => c.id),
        dates: sortedCities.map(c => c.date),
        color: formData.color,
        createdAt: new Date().toISOString()
      });
      }

      onClose();
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to save trip' });
    }
  };

  // Filter cities based on search
  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(citySearch.toLowerCase()) ||
    city.country.toLowerCase().includes(citySearch.toLowerCase())
  );

  const colorOptions = [
    { color: 'var(--accent-primary)', name: 'Primary' },
    { color: 'var(--accent-visited)', name: 'Visited' },
    { color: 'var(--accent-lived)', name: 'Lived' },
    { color: '#EF4444', name: 'Red' },
    { color: '#8B5CF6', name: 'Purple' },
    { color: '#EC4899', name: 'Pink' },
    { color: '#06B6D4', name: 'Cyan' },
    { color: '#F97316', name: 'Orange' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              ref={modalRef}
              className="bg-bg-secondary rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-white/10"
              initial={{ scale: 0.8, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                mass: 0.8,
                duration: 0.4
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="trip-creation-title"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-8 py-6 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-primary/20 to-accent-primary/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isEditing ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
                      </svg>
                    </div>
                    <div>
                      <h2 id="trip-creation-title" className="text-2xl font-bold text-text-primary">
                        {isEditing ? 'Edit Trip' : 'Create Trip'}
                      </h2>
                      <p className="text-text-secondary">
                        {isEditing ? 'Update your trip details and destinations' : 'Plan your journey with multiple destinations'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                    }}
                    className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-primary/50 rounded-xl transition-colors"
                    aria-label="Close"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="px-8 py-6 space-y-8">

                  {/* Trip Name */}
                  <div className="space-y-3">
                    <label htmlFor="trip-name" className="block text-sm font-semibold text-text-primary">
                      Trip Name *
                    </label>
                    <input
                      ref={nameInputRef}
                      id="trip-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setFormData(prev => ({ ...prev, name: newValue }));
                      }}
                      placeholder="European Adventure 2024"
                      className="w-full px-4 py-3 rounded-xl border-2 border-white/40 bg-bg-secondary text-text-primary placeholder-text-secondary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all"
                      required
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Color Selection */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-text-primary">
                      Trip Color
                    </label>
                    <div className="flex gap-3">
                      {colorOptions.map((option) => (
                        <button
                          key={option.color}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, color: option.color }))}
                            className={`
                            relative w-12 h-12 rounded-xl border-2 transition-all duration-200 group
                            ${formData.color === option.color
                              ? 'border-text-primary scale-110 shadow-lg'
                              : 'border-white/20 hover:border-text-secondary hover:scale-105'
                            }
                          `}
                          style={{ backgroundColor: option.color }}
                          title={option.name}
                        >
                          {formData.color === option.color && (
                            <div className="absolute inset-0 rounded-xl flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* City Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-text-primary">
                        Select Cities ({formData.selectedCities.length} selected) *
                      </label>
                      {formData.selectedCities.length > 0 && formData.selectedCities.length < 2 && (
                        <span className="text-xs text-accent-lived bg-accent-lived/10 px-2 py-1 rounded-lg">
                          Need {2 - formData.selectedCities.length} more
                        </span>
                      )}
                    </div>

                    {/* City Search */}
                    <div className="relative">
                      <input
                        type="text"
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        placeholder="Search cities..."
                        className="w-full px-4 py-3 pr-10 rounded-xl border-2 border-white/40 bg-bg-secondary text-text-primary placeholder-text-secondary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all"
                      />
                      {citySearch && (
                        <button
                          onClick={() => setCitySearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {cities.length === 0 ? (
                      <div className="text-center py-12 px-4 rounded-xl bg-bg-secondary/50 border border-white/20">
                        <div className="w-16 h-16 rounded-2xl bg-bg-primary/50 flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <p className="text-text-secondary text-sm font-medium">No cities added yet</p>
                        <p className="text-text-secondary text-xs mt-1">Add some cities first to create a trip</p>
                      </div>
                    ) : filteredCities.length === 0 ? (
                      <div className="text-center py-12 px-4 rounded-xl bg-bg-secondary/50 border border-white/20">
                        <div className="w-16 h-16 rounded-2xl bg-bg-primary/50 flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <p className="text-text-secondary text-sm font-medium">No cities found</p>
                        <p className="text-text-secondary text-xs mt-1">Try a different search term</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {filteredCities.map((city) => {
                          const selectedCity = formData.selectedCities.find(c => c.id === city.id);
                          const isSelected = !!selectedCity;

                          return (
                            <div
                              key={city.id}
                              onClick={(e) => {
                                // Don't toggle if clicking on the date picker
                                if ((e.target as HTMLElement).closest('input[type="date"]')) return;
                                toggleCity(city.id);
                              }}
                              className={`
                                rounded-xl border transition-all duration-200 p-4 cursor-pointer
                                ${isSelected
                                  ? 'border-accent-primary/50 bg-accent-primary/5 shadow-sm'
                                  : 'border-white/20 bg-bg-secondary/50 hover:bg-bg-primary/50 hover:border-white/20'
                                }
                              `}
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`
                                    w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0
                                    ${isSelected
                                      ? 'border-accent-primary bg-accent-primary'
                                      : 'border-white/20'
                                    }
                                  `}
                                >
                                  {isSelected && (
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-text-primary">{city.name}</div>
                                  <div className="text-sm text-text-secondary">
                                    {city.adminName ? `${city.adminName}, ${city.country}` : city.country}
                                  </div>
                                </div>
                                {isSelected && (
                                  <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <DatePicker
                                      value={selectedCity.date}
                                      onChange={(e) => updateCityDate(city.id, e.target.value)}
                                      required
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* City and Date Errors */}
                    {errors.cities && (
                      <p className="text-red-500 text-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.cities}
                      </p>
                    )}

                    {/* Submit Error */}
                    {errors.submit && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.submit}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="px-8 py-6 border-t border-white/20 bg-bg-primary/20">
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={(e) => {
                        e?.stopPropagation();
                        onClose();
                      }}
                      className="flex-1 py-3 rounded-xl font-medium"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      onClick={(e) => e?.stopPropagation()}
                      className="flex-1 py-3 rounded-xl font-medium"
                      disabled={formData.selectedCities.length < 2 || !formData.name.trim()}
                    >
                      {isEditing ? 'Update Trip' : 'Create Trip'}
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


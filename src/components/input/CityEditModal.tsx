import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTravelStore } from '../../store/travelStore';
import { CityTypeSelector } from './CityTypeSelector';
import { DatePicker } from './DatePicker';
import { Button } from '../ui/Button';
import type { City } from '../../types/city';

interface CityEditModalProps {
  city: City | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CityEditModal({ city, isOpen, onClose }: CityEditModalProps) {
  const { updateCity } = useTravelStore();
  const [formData, setFormData] = useState<{
    type: 'visited' | 'lived';
    lastVisited: string;
  }>({
    type: 'visited',
    lastVisited: ''
  });

  useEffect(() => {
    if (isOpen && city) {
      setFormData({
        type: city.type,
        lastVisited: city.lastVisited
      });
    }
  }, [isOpen, city]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city) return;
    updateCity(city.id, formData);
    onClose();
  };

  if (!city) return null;

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
            className="fixed inset-0 bg-black/50 z-40"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-bg-secondary rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-text-primary mb-6">
                Edit {city?.name || 'City'}
              </h2>
              
              {city && (
                <form onSubmit={handleSubmit} className="space-y-4">
                <CityTypeSelector
                  value={formData.type}
                  onChange={(type) => setFormData({ ...formData, type })}
                />
                
                <DatePicker
                  label="Visit Date"
                  value={formData.lastVisited}
                  onChange={(e) => setFormData({ ...formData, lastVisited: e.target.value })}
                  required
                />
                
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                </div>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


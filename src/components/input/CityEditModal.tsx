import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, X, AlertCircle } from 'lucide-react';
import { useTravelStore } from '../../store/travelStore';
import { CityTypeSelector } from './CityTypeSelector';
import { DatePicker } from './DatePicker';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import type { City } from '../../types/city';

interface CityEditModalProps {
  city: City | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CityEditModal({ city, isOpen, onClose }: CityEditModalProps) {
  const { updateCity } = useTravelStore();
  const { showToast } = useToast();
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLButtonElement>(null);
  const [formData, setFormData] = useState<{
    type: 'visited' | 'lived';
    lastVisited: string;
  }>({
    type: 'visited',
    lastVisited: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && city) {
      setFormData({
        type: city.type,
        lastVisited: city.lastVisited
      });
      setErrors({});
      setIsSubmitting(false);
      // Focus first input when modal opens
      const timeoutId = setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, city]);

  // Validation functions
  const validateDate = (dateString: string): string | null => {
    if (!dateString) return 'Date is required';

    const date = new Date(dateString);
    const now = new Date();
    const minDate = new Date('1900-01-01');

    if (isNaN(date.getTime())) return 'Invalid date format';
    if (date > now) return 'Visit date cannot be in the future';
    if (date < minDate) return 'Visit date cannot be before 1900';

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    const dateError = validateDate(formData.lastVisited);
    if (dateError) newErrors.lastVisited = dateError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Trap focus within modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      
      // Tab trapping
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city || isSubmitting) return;

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      showToast({
        message: 'Please fix the errors below',
        type: 'error',
        duration: 3000
      });
      return;
    }

    setIsSubmitting(true);

    try {
      updateCity(city.id, formData);

      showToast({
        message: `"${city.name}" has been updated successfully`,
        type: 'success',
        duration: 3000
      });

      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update city';
      showToast({
        message: errorMessage,
        type: 'error',
        duration: 5000
      });
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!city) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Enhanced Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              ref={modalRef}
              className="bg-bg-secondary rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-white/20"
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-city-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.2 }}
            >
              {/* Enhanced Header */}
              <div className="px-6 py-5 border-b border-white/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center">
                    <Edit className="w-5 h-5 text-accent-primary" />
                  </div>
                  <div>
                    <h2 id="edit-city-title" className="text-lg font-bold text-text-primary">
                      Edit City
                    </h2>
                    <p className="text-sm text-text-secondary">
                      {city?.name}, {city?.country}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-primary/50 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              {city && (
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <CityTypeSelector
                      ref={firstInputRef}
                      value={formData.type}
                      onChange={(type) => setFormData({ ...formData, type })}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="space-y-1">
                      <DatePicker
                        label="Visit Date"
                        value={formData.lastVisited}
                        onChange={(e) => {
                          setFormData({ ...formData, lastVisited: e.target.value });
                          // Clear error when user starts typing
                          if (errors.lastVisited) {
                            setErrors(prev => ({ ...prev, lastVisited: '' }));
                          }
                        }}
                        required
                        hasError={!!errors.lastVisited}
                      />
                      {errors.lastVisited && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 text-sm text-red-500"
                        >
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{errors.lastVisited}</span>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>

                  {/* Submit Error */}
                  {errors.submit && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{errors.submit}</span>
                    </motion.div>
                  )}

                  {/* Actions */}
                  <motion.div
                    className="flex gap-3 pt-4 border-t border-white/20"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="flex-1 py-3 rounded-xl font-medium"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isSubmitting}
                      className="flex-1 py-3 rounded-xl font-medium relative"
                    >
                      {isSubmitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </motion.div>
                </form>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


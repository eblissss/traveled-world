import { useTravelStore } from '../../store/travelStore';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import type { City } from '../../types/city';

interface CityDeleteModalProps {
  city: City | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CityDeleteModal({ city, isOpen, onClose }: CityDeleteModalProps) {
  const { deleteCity } = useTravelStore();
  const { showToast } = useToast();

  if (!isOpen || !city) return null;

  const handleDelete = () => {
    try {
      deleteCity(city.id);
      showToast({
        message: `"${city.name}" has been removed`,
        type: 'success',
        duration: 3000
      });
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete city';
      showToast({
        message: errorMessage,
        type: 'error',
        duration: 5000
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="bg-bg-secondary rounded-2xl shadow-2xl max-w-sm w-full border border-white/20 relative">

        {/* Content */}
        <div className="p-6 text-center space-y-4">
          <div className="text-4xl">⚠️</div>

          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Delete {city.name}?
            </h3>
            <p className="text-sm text-text-secondary">
              This action cannot be undone.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

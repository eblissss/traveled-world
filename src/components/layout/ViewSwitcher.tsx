import { motion } from 'framer-motion';
import { useTravelStore } from '../../store/travelStore';

export function ViewSwitcher() {
  const { preferences, updatePreferences } = useTravelStore();
  const currentView = preferences.defaultView;

  return (
    <div className="flex items-center gap-2 bg-bg-secondary rounded-full p-1 border border-gray-200 dark:border-gray-700">
      <motion.button
        onClick={() => updatePreferences({ defaultView: '2d' })}
        className={`
          px-4 py-2 rounded-full font-medium text-sm transition-colors
          ${currentView === '2d'
            ? 'text-white'
            : 'text-text-secondary hover:text-text-primary'
          }
        `}
        animate={{
          backgroundColor: currentView === '2d' ? '#3B82F6' : 'transparent'
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        2D
      </motion.button>
      <motion.button
        onClick={() => updatePreferences({ defaultView: '3d' })}
        className={`
          px-4 py-2 rounded-full font-medium text-sm transition-colors
          ${currentView === '3d'
            ? 'text-white'
            : 'text-text-secondary hover:text-text-primary'
          }
        `}
        animate={{
          backgroundColor: currentView === '3d' ? '#3B82F6' : 'transparent'
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        3D
      </motion.button>
    </div>
  );
}


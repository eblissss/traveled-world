import { motion } from 'framer-motion';
import { Map, Globe } from 'lucide-react';
import { useTravelStore } from '../../store/travelStore';

export function ViewSwitcher() {
  const { preferences, updatePreferences } = useTravelStore();
  const currentView = preferences.defaultView;

  const is2D = currentView === '2d';

  return (
    <div className="relative flex items-center bg-bg-secondary/90 backdrop-blur-xl rounded-xl p-1 border border-white/20 shadow-lg" role="group" aria-label="View switcher">
      {/* Sliding background indicator */}
      <motion.div
        className="absolute top-1 bottom-1 w-1/2 rounded-lg bg-accent-primary shadow-md"
        animate={{ left: is2D ? '4px' : '50%' }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        aria-hidden="true"
      />

      {/* 2D Map Button */}
      <motion.button
        onClick={() => updatePreferences({ defaultView: '2d' })}
        aria-pressed={is2D}
        aria-label="Switch to 2D map view"
        className={`relative z-10 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
          is2D ? 'text-white' : 'text-text-secondary hover:text-text-primary'
        }`}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4" />
          <span>2D</span>
        </div>
      </motion.button>

      {/* 3D Globe Button */}
      <motion.button
        onClick={() => updatePreferences({ defaultView: '3d' })}
        aria-pressed={!is2D}
        aria-label="Switch to 3D globe view"
        className={`relative z-10 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
          !is2D ? 'text-white' : 'text-text-secondary hover:text-text-primary'
        }`}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: !is2D ? 360 : 0 }}
            transition={{ duration: 20, repeat: !is2D ? Infinity : 0, ease: 'linear' }}
          >
            <Globe className="w-4 h-4" />
          </motion.div>
          <span>3D</span>
        </div>
      </motion.button>
    </div>
  );
}


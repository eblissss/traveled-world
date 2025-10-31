import { motion } from 'framer-motion';
import { useTravelStore } from '../../store/travelStore';

export function StyleSelector() {
  const { preferences, updatePreferences } = useTravelStore();
  const currentView = preferences.defaultView;

  // Map styles for 2D view
  const mapStyles = [
    {
      value: 'light' as const,
      label: 'Light',
      emoji: '☀️'
    },
    {
      value: 'dark' as const,
      label: 'Dark',
      emoji: '🌙'
    },
    {
      value: 'satellite' as const,
      label: 'Satellite',
      emoji: '🛰️'
    },
  ];

  // Globe styles for 3D view
  const globeStyles = [
    {
      value: 'satellite' as const,
      label: 'Satellite',
      emoji: '🛰️'
    },
    {
      value: 'night' as const,
      label: 'Night',
      emoji: '🌃'
    }
  ];

  const currentStyle = preferences.theme;
  const currentGlobeStyle = preferences.globeStyle || 'blue-marble';

  // Get the appropriate styles for current view
  const styles = currentView === '3d' ? globeStyles : mapStyles;

  return (
    <div className="flex items-center gap-3" role="group" aria-label="Style selector">
      <div className="flex items-center bg-bg-secondary/90 backdrop-blur-xl rounded-xl p-1 border border-white/20 shadow-lg">
        {styles.map((style, index) => {
          const isSelected = currentView === '3d'
            ? currentGlobeStyle === style.value
            : currentStyle === style.value;

          return (
            <motion.button
              key={style.value}
              onClick={() => {
                if (currentView === '3d') {
                  updatePreferences({ globeStyle: style.value as 'blue-marble' | 'topographic' | 'vector' | 'satellite' | 'night' });
                } else {
                  updatePreferences({ theme: style.value as 'dark' | 'light' | 'satellite' | 'minimal' });
                }
              }}
              aria-pressed={isSelected}
              aria-label={`Switch to ${style.label} style`}
              className={`
                relative px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300
                ${isSelected ? 'text-white' : 'text-text-secondary hover:text-text-primary'}
              `}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Background indicator */}
              <motion.div
                className="absolute inset-0 rounded-lg"
                animate={{
                  background: isSelected
                    ? 'linear-gradient(135deg, var(--accent-primary), color-mix(in srgb, var(--accent-primary), black 20%))'
                    : 'transparent'
                }}
                transition={{ duration: 0.2 }}
              />

              {/* Content */}
              <div className="relative flex items-center gap-2">
                <motion.span
                  className="text-base"
                  animate={{
                    scale: isSelected ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {style.emoji}
                </motion.span>
                <span className="hidden md:inline font-medium">{style.label}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}


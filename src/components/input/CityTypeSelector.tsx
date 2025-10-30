import { motion } from 'framer-motion';

interface CityTypeSelectorProps {
  value: 'visited' | 'lived';
  onChange: (type: 'visited' | 'lived') => void;
}

export function CityTypeSelector({ value, onChange }: CityTypeSelectorProps) {
  // Ensure value is always valid
  const safeValue = value || 'visited';
  
  return (
    <div className="flex gap-2">
      <motion.button
        type="button"
        onClick={() => onChange('visited')}
        className={`
          px-4 py-2 rounded-lg font-medium transition-colors
          ${safeValue === 'visited'
            ? 'bg-accent-visited text-white'
            : 'bg-bg-secondary text-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700'
          }
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-pressed={safeValue === 'visited'}
      >
        Visited
      </motion.button>
      <motion.button
        type="button"
        onClick={() => onChange('lived')}
        className={`
          px-4 py-2 rounded-lg font-medium transition-colors
          ${safeValue === 'lived'
            ? 'bg-accent-lived text-white'
            : 'bg-bg-secondary text-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700'
          }
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-pressed={safeValue === 'lived'}
      >
        Lived
      </motion.button>
    </div>
  );
}


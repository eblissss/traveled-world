import { motion } from 'framer-motion';
import { useTravelStore } from '../../store/travelStore';

export function StyleSelector() {
  const { preferences, updatePreferences } = useTravelStore();
  const currentTheme = preferences.theme;

  const themes: Array<{ value: 'light' | 'dark' | 'satellite'; label: string }> = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'satellite', label: 'Satellite' }
  ];

  return (
    <div className="flex items-center gap-2">
      {themes.map((theme) => (
        <motion.button
          key={theme.value}
          onClick={() => updatePreferences({ theme: theme.value })}
          className={`
            px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
            ${currentTheme === theme.value
              ? 'bg-accent-primary text-white'
              : 'bg-bg-secondary text-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700'
            }
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {theme.label}
        </motion.button>
      ))}
    </div>
  );
}


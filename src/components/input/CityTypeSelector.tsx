import { motion } from 'framer-motion';
import { forwardRef } from 'react';

interface CityTypeSelectorProps {
  value: 'visited' | 'lived';
  onChange: (type: 'visited' | 'lived') => void;
}

type CityType = 'visited' | 'lived';

interface ButtonConfig {
  type: CityType;
  label: string;
  ariaLabel: string;
  bgClass: string;
}

const buttonConfigs: ButtonConfig[] = [
  {
    type: 'visited',
    label: 'Visited',
    ariaLabel: 'Mark as visited',
    bgClass: 'bg-accent-visited'
  },
  {
    type: 'lived',
    label: 'Lived',
    ariaLabel: 'Mark as lived',
    bgClass: 'bg-accent-lived'
  }
];

export const CityTypeSelector = forwardRef<HTMLButtonElement, CityTypeSelectorProps>(
  ({ value, onChange }, ref) => {
  // Ensure value is always valid
  const safeValue = value || 'visited';

  const baseButtonClasses = 'px-4 py-2 rounded-lg font-medium transition-colors';
  const activeClasses = 'text-white';
  const inactiveClasses = 'bg-bg-secondary text-text-secondary hover:bg-bg-primary';

  return (
    <div className="flex gap-2" role="group" aria-label="City type selector">
      {buttonConfigs.map((config) => (
        <motion.button
          key={config.type}
          ref={safeValue === config.type ? ref : undefined}
          type="button"
          onClick={() => onChange(config.type)}
          aria-pressed={safeValue === config.type}
          aria-label={config.ariaLabel}
          className={`${baseButtonClasses} ${
            safeValue === config.type
              ? `${config.bgClass} ${activeClasses}`
              : inactiveClasses
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {config.label}
        </motion.button>
      ))}
    </div>
  );
});

CityTypeSelector.displayName = 'CityTypeSelector';


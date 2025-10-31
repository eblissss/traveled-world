import { forwardRef, InputHTMLAttributes, useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';


interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  success?: string;
  warning?: string;
  hint?: string;
  floating?: boolean;
  autocomplete?: string[];
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onValidation?: (value: string) => { type: 'error' | 'warning' | 'success' | null; message: string };
  characterLimit?: number;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    success,
    warning,
    hint,
    floating = true,
    autocomplete = [],
    onChange,
    onValidation,
    characterLimit,
    className = '',
    value = '',
    placeholder,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const actualRef = (ref && typeof ref !== 'function' ? ref : inputRef) as React.RefObject<HTMLInputElement>;

    // Handle input changes with smart features
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange?.(newValue, e);

      // Smart autocomplete filtering
      if (autocomplete.length > 0) {
        setShowAutocomplete(newValue.length > 0);
        setSelectedSuggestion(-1);
      }

    }, [onChange, autocomplete]);

    // Filtered autocomplete suggestions
    const filteredSuggestions = useMemo(() => {
      if (!autocomplete.length || !value) return [];
      const inputValue = String(value).toLowerCase();
      return autocomplete
        .filter(item => item.toLowerCase().includes(inputValue))
        .slice(0, 5);
    }, [autocomplete, value]);


    // Accept prediction with Tab key
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      const input = actualRef.current;
      if (!input) return;


      // Autocomplete navigation
      if (showAutocomplete && filteredSuggestions.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedSuggestion(prev =>
            prev < filteredSuggestions.length - 1 ? prev + 1 : 0
          );
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedSuggestion(prev =>
            prev > 0 ? prev - 1 : filteredSuggestions.length - 1
          );
        } else if (e.key === 'Enter' && selectedSuggestion >= 0) {
          e.preventDefault();
          const selectedValue = filteredSuggestions[selectedSuggestion];
          onChange?.(selectedValue, {
            target: { ...input, value: selectedValue }
          } as React.ChangeEvent<HTMLInputElement>);
          setShowAutocomplete(false);
        } else if (e.key === 'Escape') {
          setShowAutocomplete(false);
          setSelectedSuggestion(-1);
        }
      }

      props.onKeyDown?.(e);
    }, [showAutocomplete, selectedSuggestion, filteredSuggestions, onChange, actualRef, props]);

    // Validation state
    const validation = onValidation?.(String(value));
    const currentValidation = validation || { type: null, message: '' };

    // Dynamic styling based on state
    const getInputClasses = () => {
      let baseClasses = `
        w-full px-4 py-3 rounded-xl border-2 transition-all duration-300
        bg-bg-secondary/80 backdrop-blur-sm text-text-primary
        placeholder:text-text-secondary/60
        focus:outline-none focus:ring-2 focus:ring-offset-2
      `;

      if (floating && label) {
        baseClasses += ' pt-6 pb-3';
      }

      if (error || currentValidation.type === 'error') {
        baseClasses += ' border-red-500 focus:border-red-500 focus:ring-red-500/20';
      } else if (success || currentValidation.type === 'success') {
        baseClasses += ' border-green-500 focus:border-green-500 focus:ring-green-500/20';
      } else if (warning || currentValidation.type === 'warning') {
        baseClasses += ' border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500/20';
      } else {
        baseClasses += ' border-gray-300/50 dark:border-gray-600/50 focus:border-accent-primary focus:ring-accent-primary/20';
      }

      return `${baseClasses} ${className}`;
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setTimeout(() => setShowAutocomplete(false), 150);
      props.onBlur?.(e);
    };

    return (
      <div className="relative w-full group">
        <div className="relative">
          {/* Floating Label */}
          {floating && label && (
            <motion.label
              className={`absolute left-4 pointer-events-none transition-all duration-300 ${
                isFocused || String(value).length > 0
                  ? 'top-2 text-xs font-medium text-accent-primary'
                  : 'top-1/2 -translate-y-1/2 text-sm text-text-secondary'
              }`}
              animate={{
                scale: isFocused || String(value).length > 0 ? 0.85 : 1,
              }}
            >
              {label}
            </motion.label>
          )}

          {/* Input Field */}
          <input
            ref={actualRef}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={getInputClasses()}
            placeholder={floating && label ? undefined : placeholder}
            {...props}
          />


          {/* Character Counter */}
          {characterLimit && (
            <div className={`absolute right-3 bottom-2 text-xs font-mono ${
              String(value).length > characterLimit
                ? 'text-red-500'
                : String(value).length > characterLimit * 0.9
                ? 'text-yellow-500'
                : 'text-text-secondary'
            }`}>
              {String(value).length}/{characterLimit}
            </div>
          )}
        </div>

        {/* Status Messages */}
        <AnimatePresence mode="wait">
          {(error || success || warning || currentValidation.message) && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mt-2 overflow-hidden"
            >
              <motion.p
                className={`text-sm flex items-center gap-2 ${
                  error || currentValidation.type === 'error'
                    ? 'text-red-500'
                    : success || currentValidation.type === 'success'
                    ? 'text-green-500'
                    : warning || currentValidation.type === 'warning'
                    ? 'text-yellow-500'
                    : 'text-text-secondary'
                }`}
                animate={{
                  x: currentValidation.type === 'error' ? [-2, 2, -2, 2, 0] : 0,
                }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {error || currentValidation.type === 'error' ? '⚠️' :
                   success || currentValidation.type === 'success' ? '✅' :
                   warning || currentValidation.type === 'warning' ? '⚡' : '💡'}
                </motion.div>
                {error || success || warning || currentValidation.message}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint Text */}
        {hint && !error && !success && !warning && !currentValidation.message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-sm text-text-secondary/80 flex items-center gap-2"
          >
            <div className="w-1 h-1 rounded-full bg-accent-primary/50" />
            {hint}
          </motion.p>
        )}

        {/* Autocomplete Dropdown */}
        <AnimatePresence>
          {showAutocomplete && filteredSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full mt-2 w-full bg-bg-secondary/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto"
            >
              {filteredSuggestions.map((suggestion, index) => (
                <motion.button
                  key={suggestion}
                  onClick={() => {
                    onChange?.(suggestion, {
                      target: { value: suggestion }
                    } as React.ChangeEvent<HTMLInputElement>);
                    setShowAutocomplete(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center gap-3 ${
                    index === selectedSuggestion ? 'bg-accent-primary/20' : ''
                  }`}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Search className="w-4 h-4 text-text-secondary flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-text-primary">{suggestion}</div>
                  </div>
                  {index === selectedSuggestion && (
                    <div className="w-2 h-2 rounded-full bg-accent-primary" />
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    );
  }
);

Input.displayName = 'Input';


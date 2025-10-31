import { forwardRef, InputHTMLAttributes } from 'react';

interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  hasError?: boolean;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, hasError = false, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-secondary mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type="date"
          className={`
            w-full px-4 py-2 rounded-lg border-2
            bg-bg-secondary text-text-primary
            transition-colors duration-200
            font-mono
            ${hasError
              ? 'border-red-500 focus:border-red-500'
              : 'border-white/20 focus:border-accent-primary'
            }
            focus:outline-none
            ${className}
          `}
          {...props}
        />
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';


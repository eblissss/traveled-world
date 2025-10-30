import { forwardRef, InputHTMLAttributes } from 'react';

interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, className = '', ...props }, ref) => {
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
            border-gray-300 dark:border-gray-600
            focus:border-accent-primary focus:outline-none
            transition-colors duration-200
            font-mono
            ${className}
          `}
          {...props}
        />
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';


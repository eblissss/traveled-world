import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Info, AlertTriangle, Loader2 } from 'lucide-react';
import { useTransition } from '../../hooks/useAnimations';
import { useReducedMotion } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'progress';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const fadeTransition = useTransition(200);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);


  const typeStyles = {
    success: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300',
    error: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300',
    info: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300',
    progress: 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
  };

  const icons = {
    success: <Check className="w-5 h-5" />,
    error: <X className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    progress: <Loader2 className="w-5 h-5 animate-spin" />
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: -20, scale: 0.95 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
      exit={prefersReducedMotion ? {} : { opacity: 0, y: -20, scale: 0.95 }}
      transition={prefersReducedMotion ? {} : fadeTransition}
      className={`
        fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg
        ${typeStyles[type]}
        max-w-md
      `}
      role="alert"
      aria-live="polite"
    >
      {icons[type]}
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Close notification"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    message: string;
    type?: ToastType;
    duration?: number;
  }>;
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}

// Enhanced toast hook for easier usage
export function useToast() {
  const [toasts, setToasts] = useState<ToastContainerProps['toasts']>([]);

  const showToast = (options: Omit<ToastContainerProps['toasts'][0], 'id'>) => {
    const id = crypto.randomUUID();
    const toast = { ...options, id };

    setToasts(prev => [toast, ...prev]);

    // Auto-remove after duration
    if (options.duration && options.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, options.duration);
    }

    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  return {
    toasts,
    showToast,
    removeToast,
    clearAllToasts,
    ToastContainer: (props: Partial<ToastContainerProps>) => (
      <ToastContainer {...props} toasts={toasts} onRemove={removeToast} />
    )
  };
}


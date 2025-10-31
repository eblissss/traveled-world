import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProgressState {
  current: number;
  total: number;
  isExporting?: boolean;
  message?: string;
}

interface ProgressIndicatorProps {
  progress: ProgressState | null;
  type: 'export' | 'import';
  onComplete: () => void;
}

export function ProgressIndicator({ progress, type, onComplete }: ProgressIndicatorProps) {
  useEffect(() => {
    if (progress && progress.current >= progress.total) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  if (!progress) return null;

  const percentage = (progress.current / progress.total) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="fixed top-20 right-4 z-50 bg-bg-secondary/95 backdrop-blur-xl border border-white/20 rounded-lg p-4 shadow-lg min-w-[300px]"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center">
            {type === 'export' ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="text-accent-primary"
              >
                ⬆️
              </motion.div>
            ) : (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="text-accent-primary"
              >
                ⬇️
              </motion.div>
            )}
          </div>
          <div className="flex-1">
            <div className="text-text-primary font-medium">
              {type === 'export' ? 'Exporting' : 'Importing'} Data
            </div>
            <div className="text-text-secondary text-sm">
              {progress.message || `${progress.current} / ${progress.total}`}
            </div>
          </div>
        </div>

        <div className="w-full bg-bg-primary/50 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-accent-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentage, 100)}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

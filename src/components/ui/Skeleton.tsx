import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ 
  className = '', 
  width, 
  height, 
  rounded = true,
  variant = 'rectangular'
}: SkeletonProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  
  const baseClasses = `bg-border-color ${variant === 'circular' ? 'rounded-full' : rounded ? 'rounded-lg' : ''} ${className}`;
  
  return (
    <motion.div
      className={baseClasses}
      style={{ width, height }}
      animate={prefersReducedMotion ? {} : {
        opacity: [0.6, 1, 0.6],
      }}
      transition={prefersReducedMotion ? {} : {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      aria-label="Loading..."
      role="status"
    />
  );
}

// Pre-built skeleton components
export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="1rem"
          width={i === lines - 1 ? '75%' : '100%'}
          rounded
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-bg-secondary rounded-xl p-4 shadow-lg border border-white/20 ${className}`}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton height="1rem" width="60%" rounded />
            <Skeleton height="0.75rem" width="40%" rounded />
          </div>
        </div>
        <Skeleton height="0.75rem" width="30%" rounded />
      </div>
    </div>
  );
}


import { motion, useReducedMotion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { ReactNode, useState, useRef, useCallback } from 'react';
import { Loader2, Check } from 'lucide-react';

interface ButtonProps {
  children: ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  title?: string;
  loading?: boolean;
  loadingText?: string;
  success?: boolean;
  successText?: string;
  magnetic?: boolean;
  ripple?: boolean;
  preview?: ReactNode;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  className = '',
  title,
  loading = false,
  loadingText,
  success = false,
  successText,
  magnetic = true,
  ripple = true,
  preview
}: ButtonProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [showPreview, setShowPreview] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleIdRef = useRef(0);

  // Magnetic hover effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 300, damping: 30 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-15, 15]);

  const baseStyles = 'font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 relative overflow-hidden';
  const isInteractive = !disabled && !loading && !success;

  const variantStyles = {
    primary: 'bg-accent-primary text-white hover:bg-accent-primary/90 shadow-sm hover:shadow-md',
    secondary: 'bg-bg-secondary/80 backdrop-blur-sm text-text-primary hover:bg-bg-secondary border border-white/20',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow-md'
  };

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg'
  };


  // Magnetic effect handlers
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!magnetic || !buttonRef.current || prefersReducedMotion) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    mouseX.set((e.clientX - centerX) / (rect.width / 2));
    mouseY.set((e.clientY - centerY) / (rect.height / 2));
  }, [magnetic, mouseX, mouseY, prefersReducedMotion]);

  const handleMouseLeave = useCallback(() => {
    if (!magnetic || prefersReducedMotion) return;
    mouseX.set(0);
    mouseY.set(0);
    setShowPreview(false);
  }, [magnetic, mouseX, mouseY, prefersReducedMotion]);

  // Ripple effect
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ripple || !buttonRef.current || prefersReducedMotion) {
      onClick?.(e);
      return;
    }

    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = { id: rippleIdRef.current++, x, y };
    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);

    onClick?.(e);
  }, [ripple, onClick, prefersReducedMotion]);

  // Loading spinner
  const LoadingSpinner = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <Loader2 className="w-4 h-4" />
    </motion.div>
  );

  // Success checkmark
  const SuccessCheck = () => (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3, type: 'spring' }}
    >
      <Check className="w-4 h-4" />
    </motion.div>
  );

  // Determine button content based on state
  const getButtonContent = () => {
    if (success) {
      return (
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <SuccessCheck />
          <span>{successText || 'Success!'}</span>
        </motion.div>
      );
    }

    if (loading) {
      return (
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <LoadingSpinner />
          <span>{loadingText || 'Loading...'}</span>
        </motion.div>
      );
    }

    return children;
  };

  return (
    <div className="relative inline-block">
      <motion.button
        ref={buttonRef}
        type={type}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => setShowPreview(true)}
        disabled={disabled || loading || success}
        title={title}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className} ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${isInteractive ? 'cursor-pointer' : ''}`}
        whileTap={isInteractive && !prefersReducedMotion ? {
          scale: 0.98
        } : {}}
        style={{
          rotateX: magnetic && isInteractive ? rotateX : 0,
          rotateY: magnetic && isInteractive ? rotateY : 0,
          transformStyle: 'preserve-3d',
        }}
        transition={prefersReducedMotion ? {} : { duration: 0.15 }}
      >
        {/* Simplified ripple effects */}
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full bg-white/20 pointer-events-none"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
            }}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{
              scale: [0, 3],
              opacity: [0.6, 0]
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        ))}

        {/* Button content */}
        <motion.div
          className="relative z-10 flex items-center justify-center"
          animate={{
            scale: success ? [1, 1.05, 1] : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          {getButtonContent()}
        </motion.div>
      </motion.button>

      {/* Action preview tooltip */}
      <AnimatePresence>
        {preview && showPreview && isInteractive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-bg-secondary/95 backdrop-blur-xl border border-white/20 rounded-lg p-3 shadow-xl z-50 pointer-events-none max-w-xs"
          >
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
              {preview}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


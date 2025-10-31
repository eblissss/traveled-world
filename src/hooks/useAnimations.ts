import { useReducedMotion } from 'framer-motion';
import { useTravelStore } from '../store/travelStore';
import {
  createDropdownVariants,
  createContainerVariants,
  createCardVariants,
  createMarkerVariants,
  createShakeVariants,
  createCheckmarkVariants,
  adjustDuration,
  DURATIONS,
  createTransition
} from '../lib/animations';

// Hook to check if user prefers reduced motion
export function useReducedMotionPreference() {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion ?? false;
}

// Hook to get animation speed from preferences
export function useAnimationSpeed() {
  const { preferences } = useTravelStore();
  return preferences.animationSpeed ?? 1.0;
}

// Hook to get animation variants with speed adjustment
export function useAnimationVariants() {
  const animationSpeed = useAnimationSpeed();
  const prefersReducedMotion = useReducedMotionPreference();
  
  // If reduced motion, use instant variants
  if (prefersReducedMotion) {
    return {
      dropdownVariants: { hidden: {}, visible: {} },
      containerVariants: { hidden: {}, visible: {} },
      cardVariants: { hidden: {}, visible: {} },
      markerVariants: { hidden: {}, visible: () => ({}) },
      shakeVariants: { shake: {} },
      checkmarkVariants: { hidden: {}, visible: {} }
    };
  }
  
  return {
    dropdownVariants: createDropdownVariants(animationSpeed),
    containerVariants: createContainerVariants(animationSpeed),
    cardVariants: createCardVariants(animationSpeed),
    markerVariants: createMarkerVariants(animationSpeed),
    shakeVariants: createShakeVariants(animationSpeed),
    checkmarkVariants: createCheckmarkVariants(animationSpeed)
  };
}

// Helper to get transition with speed adjustment
export function useTransition(duration: number, ease: string = 'easeOut', delay?: number) {
  const animationSpeed = useAnimationSpeed();
  return createTransition(duration, animationSpeed, ease, delay);
}

// Helper to conditionally disable animations
export function getAnimationProps(reducedMotion: boolean) {
  if (reducedMotion) {
    return {
      initial: false,
      animate: false,
      transition: { duration: 0 }
    };
  }
  return {};
}

// Export animation utilities
export { adjustDuration, DURATIONS, createTransition };


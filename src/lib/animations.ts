// Animation constants and variants
// All durations are in milliseconds and will be adjusted by animationSpeed preference

// Base animation durations (in milliseconds)
export const DURATIONS = {
  micro: 150,        // Micro-interactions (hover, focus)
  component: 300,    // Component transitions
  page: 500,         // Page transitions
  visualization: 1000 // Data visualizations (arcs, paths)
} as const;

// Helper to adjust duration based on animationSpeed (0.5 - 2.0)
// Faster speed (2.0) = shorter duration, slower speed (0.5) = longer duration
export function adjustDuration(baseDuration: number, animationSpeed: number = 1.0): number {
  // Inverse relationship: speed 2.0 = half duration, speed 0.5 = double duration
  return baseDuration / animationSpeed;
}

// Helper to create transition with animationSpeed support
export function createTransition(
  duration: number,
  animationSpeed: number = 1.0,
  ease: string = 'easeOut',
  delay?: number
) {
  return {
    duration: adjustDuration(duration, animationSpeed) / 1000, // Convert to seconds for Framer Motion
    ease,
    ...(delay !== undefined && { delay: adjustDuration(delay, animationSpeed) / 1000 })
  };
}

// Variant creators that accept animationSpeed
export const createDropdownVariants = (animationSpeed: number = 1.0) => ({
  hidden: { opacity: 0, y: -10, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: createTransition(DURATIONS.micro, animationSpeed, 'easeOut')
  }
});

export const createContainerVariants = (animationSpeed: number = 1.0) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: adjustDuration(50, animationSpeed) / 1000 // 50ms stagger adjusted
    }
  }
});

export const createCardVariants = (animationSpeed: number = 1.0) => ({
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: createTransition(DURATIONS.component, animationSpeed, 'easeOut')
  }
});

export const createMarkerVariants = (animationSpeed: number = 1.0) => ({
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      delay: adjustDuration(i * 20, animationSpeed) / 1000, // 20ms stagger adjusted
      duration: adjustDuration(400, animationSpeed) / 1000,
      ease: 'easeOut'
    }
  })
});

export const createShakeVariants = (animationSpeed: number = 1.0) => ({
  shake: {
    x: [-10, 10, -5, 5, 0],
    transition: createTransition(400, animationSpeed, 'easeInOut')
  }
});

export const createCheckmarkVariants = (animationSpeed: number = 1.0) => ({
  hidden: {
    pathLength: 0,
    opacity: 0
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: createTransition(600, animationSpeed, 'easeOut'),
      opacity: {
        duration: adjustDuration(200, animationSpeed) / 1000,
        delay: adjustDuration(400, animationSpeed) / 1000
      }
    }
  }
});

// Legacy variants for backward compatibility (default speed 1.0)
export const cardVariants = createCardVariants(1.0);


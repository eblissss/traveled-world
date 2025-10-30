import { useRef } from 'react';

export function useGlobeControls() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);

  return {
    controlsRef,
    focusOnCity: () => {
      // Will be implemented in Globe3D component
    }
  };
}


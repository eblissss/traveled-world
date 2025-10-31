import React from 'react';
import { afterEach, beforeEach, vi, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { resetStore } from './utils/test-utils';

// Mock Web APIs and browser features
beforeAll(() => {
  // Mock crypto.randomUUID
  Object.defineProperty(window, 'crypto', {
    value: {
      ...window.crypto,
      randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9)
    }
  });

  // Mock URL.createObjectURL and URL.revokeObjectURL
  global.URL.createObjectURL = vi.fn(() => 'mocked-url');
  global.URL.revokeObjectURL = vi.fn();

  // Mock fetch for API calls
  global.fetch = vi.fn();
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
}

global.IntersectionObserver = MockIntersectionObserver as any;

// Mock ResizeObserver
class MockResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

global.ResizeObserver = MockResizeObserver as any;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock WebGL context for 3D globe
const mockWebGLContext = {
  createShader: vi.fn(),
  createProgram: vi.fn(),
  shaderSource: vi.fn(),
  compileShader: vi.fn(),
  attachShader: vi.fn(),
  linkProgram: vi.fn(),
  useProgram: vi.fn(),
  getUniformLocation: vi.fn(),
  uniformMatrix4fv: vi.fn(),
  enable: vi.fn(),
  disable: vi.fn(),
  clear: vi.fn(),
  viewport: vi.fn(),
  getExtension: vi.fn(() => ({})),
  getParameter: vi.fn(() => [1, 1]),
  getContextAttributes: vi.fn(() => ({})),
  createBuffer: vi.fn(),
  bindBuffer: vi.fn(),
  bufferData: vi.fn(),
  createVertexArray: vi.fn(),
  bindVertexArray: vi.fn(),
  enableVertexAttribArray: vi.fn(),
  vertexAttribPointer: vi.fn(),
  drawArrays: vi.fn(),
  drawElements: vi.fn(),
};

HTMLCanvasElement.prototype.getContext = vi.fn((contextType) => {
  if (contextType === 'webgl' || contextType === 'experimental-webgl') {
    return mockWebGLContext;
  }
  return null;
});

// Mock leaflet for map testing
vi.mock('leaflet', () => ({
  map: vi.fn(() => ({
    setView: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    remove: vi.fn(),
  })),
  tileLayer: vi.fn(() => ({
    addTo: vi.fn(),
  })),
  marker: vi.fn(() => ({
    addTo: vi.fn(),
    remove: vi.fn(),
    setLatLng: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  })),
  markerClusterGroup: vi.fn(() => ({
    addTo: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    clearLayers: vi.fn(),
  })),
  popup: vi.fn(() => ({
    setContent: vi.fn(),
    openOn: vi.fn(),
  })),
  icon: vi.fn(),
  Icon: {
    Default: vi.fn(),
  },
  LatLng: vi.fn((lat, lng) => ({ lat, lng })),
  LatLngBounds: vi.fn(),
  Control: {
    Zoom: vi.fn(),
  },
}));

// Mock react-globe.gl
vi.mock('react-globe.gl', () => ({
  default: vi.fn(() => null),
}));

// Mock framer-motion for performance
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_, prop) => {
      // Return a component that passes through all props except motion-specific ones
      return ({ children, ...props }: any) => {
        // Remove framer-motion specific props
        const cleanProps = { ...props };
        delete cleanProps.initial;
        delete cleanProps.animate;
        delete cleanProps.exit;
        delete cleanProps.transition;
        delete cleanProps.variants;
        delete cleanProps.whileHover;
        delete cleanProps.whileTap;
        delete cleanProps.whileFocus;
        delete cleanProps.drag;
        delete cleanProps.dragConstraints;
        delete cleanProps.layout;
        delete cleanProps.layoutId;

        return React.createElement(prop as string, cleanProps, children);
      };
    }
  }),
  AnimatePresence: ({ children }: any) => children,
  useReducedMotion: () => false,
  useAnimation: () => ({
    start: vi.fn(),
    set: vi.fn(),
  }),
  useMotionValue: () => ({
    set: vi.fn(),
    get: vi.fn(),
  }),
  useSpring: () => ({
    set: vi.fn(),
    get: vi.fn(),
  }),
  useTransform: () => 0,
}));

// Cleanup after each test
afterEach(() => {
  cleanup();
  resetStore();
  vi.clearAllMocks();
  vi.useRealTimers();
});

beforeEach(() => {
  // Reset localStorage
  localStorage.clear();
  // Use fake timers for consistent testing
  vi.useFakeTimers();
});

// Global test utilities
global.testUtils = {
  waitForAnimations: () => new Promise(resolve => setTimeout(resolve, 100)),
  mockCanvas: () => {
    const canvas = document.createElement('canvas');
    canvas.getContext = vi.fn(() => mockWebGLContext);
    return canvas;
  },
  createMockEvent: (type: string, options = {}) => ({
    type,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    ...options,
  }),
};


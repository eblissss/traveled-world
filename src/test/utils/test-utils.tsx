// Test utilities for React Testing Library
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';
import { useTravelStore } from '../../store/travelStore';

// Helper to reset store before tests
export function resetStore() {
  useTravelStore.setState({
    cities: [],
    trips: [],
    preferences: {
      defaultView: '3d',
      theme: 'dark',
      animationSpeed: 1.0,
      searchDebounceMs: 50
    },
    history: [{
      cities: [],
      trips: [],
      timestamp: Date.now()
    }],
    historyIndex: 0
  });
}

// Custom render function with providers
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    ),
    ...options,
  });
}

export * from '@testing-library/react';
export { customRender as render };

// Mock city data factory
export function createMockCity(overrides?: Partial<import('../../types/city').City>) {
  return {
    id: crypto.randomUUID(),
    name: 'Tokyo',
    country: 'Japan',
    coordinates: [35.6762, 139.6503] as [number, number],
    type: 'visited' as const,
    lastVisited: '2024-01-01',
    dateAdded: new Date().toISOString(),
    ...overrides
  };
}

// Mock city record factory
export function createMockCityRecord(overrides?: Partial<import('../../types/city').CityRecord>) {
  return {
    city: 'Tokyo',
    city_ascii: 'Tokyo',
    lat: 35.6762,
    lng: 139.6503,
    country: 'Japan',
    iso2: 'JP',
    iso3: 'JPN',
    admin_name: 'Tokyo',
    capital: 'primary',
    population: 37977000,
    ...overrides
  };
}

// Wait for animations to complete
export async function waitForAnimations() {
  await new Promise(resolve => setTimeout(resolve, 500));
}

// Mock performance API
export function mockPerformance() {
  const mockNow = vi.fn(() => Date.now());
  global.performance.now = mockNow;
  return mockNow;
}


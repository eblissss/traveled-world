import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PerformanceManager } from '../../components/map/PerformanceManager';
import { City } from '../../types/city';

// Mock react-leaflet
vi.mock('react-leaflet', () => ({
  useMap: vi.fn(() => ({
    getBounds: vi.fn(() => ({
      pad: vi.fn(() => ({
        contains: vi.fn(() => true),
      })),
    })),
    getZoom: vi.fn(() => 10),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    eachLayer: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  })),
}));

// Mock leaflet globally
vi.stubGlobal('L', {
  latLng: vi.fn((lat, lng) => ({ lat, lng })),
});

// Mock leaflet
vi.mock('leaflet', () => ({}), { virtual: true });

describe('PerformanceManager', () => {
  const mockCities: City[] = [
    {
      id: '1',
      name: 'New York',
      country: 'USA',
      coordinates: [40.7128, -74.0060],
      type: 'visited',
      lastVisited: '2023-01-01',
      population: 8500000,
    },
    {
      id: '2',
      name: 'London',
      country: 'UK',
      coordinates: [51.5074, -0.1278],
      type: 'visited',
      lastVisited: '2023-02-01',
      population: 9000000,
    },
    {
      id: '3',
      name: 'Tokyo',
      country: 'Japan',
      coordinates: [35.6762, 139.6503],
      type: 'lived',
      lastVisited: '2023-03-01',
      population: 14000000,
    },
  ];

  it('renders without crashing', () => {
    const { container } = render(
      <PerformanceManager
        cities={mockCities}
        onVisibleCitiesChange={vi.fn()}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('handles callback when visible cities change', () => {
    const mockCallback = vi.fn();
    const { container } = render(
      <PerformanceManager
        cities={mockCities}
        onVisibleCitiesChange={mockCallback}
      />
    );
    expect(container).toBeInTheDocument();
    // The callback should be called during the effect
    // This test verifies the component can handle the callback prop
  });

  it('handles undefined callback', () => {
    const { container } = render(
      <PerformanceManager
        cities={mockCities}
        onVisibleCitiesChange={undefined}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('handles empty cities array', () => {
    const { container } = render(
      <PerformanceManager
        cities={[]}
        onVisibleCitiesChange={vi.fn()}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('handles large cities array', () => {
    const largeCitiesArray = Array.from({ length: 1000 }, (_, index) => ({
      id: `city${index}`,
      name: `City ${index}`,
      country: 'Test Country',
      coordinates: [40 + index * 0.01, -74 + index * 0.01] as [number, number],
      type: 'visited' as const,
      lastVisited: '2023-01-01',
      population: 100000,
    }));

    const { container } = render(
      <PerformanceManager
        cities={largeCitiesArray}
        onVisibleCitiesChange={vi.fn()}
      />
    );
    expect(container).toBeInTheDocument();
  });
});

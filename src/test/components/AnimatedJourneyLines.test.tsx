import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AnimatedJourneyLines } from '../../components/map/AnimatedJourneyLines';
import { Trip } from '../../types/trip';
import { City } from '../../types/city';

// Mock react-leaflet
vi.mock('react-leaflet', () => ({
  useMap: vi.fn(() => ({
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
  })),
  Polyline: vi.fn(),
}));

// Mock leaflet globally
vi.stubGlobal('L', {
  divIcon: vi.fn(() => ({})),
  marker: vi.fn(() => ({})),
  polyline: vi.fn(() => ({
    addTo: vi.fn(),
    setStyle: vi.fn(),
  })),
  Polyline: class {},
});

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
  },
}));

describe('AnimatedJourneyLines', () => {
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
  ];

  const mockTrips: Trip[] = [
    {
      id: 'trip1',
      name: 'Transatlantic Journey',
      cityIds: ['1', '2'],
      dates: ['2023-01-01', '2023-02-01'],
      color: '#3B82F6',
      createdAt: '2023-01-01T00:00:00.000Z',
    },
  ];

  it('renders without crashing', () => {
    const { container } = render(
      <AnimatedJourneyLines
        trips={mockTrips}
        cities={mockCities}
        animated={true}
        dashPattern={true}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders with animation disabled', () => {
    const { container } = render(
      <AnimatedJourneyLines
        trips={mockTrips}
        cities={mockCities}
        animated={false}
        dashPattern={false}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('handles empty trips array', () => {
    const { container } = render(
      <AnimatedJourneyLines
        trips={[]}
        cities={mockCities}
        animated={true}
        dashPattern={true}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('handles single city trip', () => {
    const singleCityTrip: Trip[] = [
      {
        id: 'trip2',
        name: 'Single City',
        cityIds: ['1'],
        dates: ['2023-01-01'],
        color: '#10B981',
        createdAt: '2023-01-01T00:00:00.000Z',
      },
    ];

    const { container } = render(
      <AnimatedJourneyLines
        trips={singleCityTrip}
        cities={mockCities}
        animated={true}
        dashPattern={true}
      />
    );
    expect(container).toBeInTheDocument();
  });
});

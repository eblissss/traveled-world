import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../App';

// Mock the globe component since it requires WebGL
vi.mock('../../components/map/Globe3D', () => ({
  Globe3D: () => <div data-testid="globe-3d">3D Globe</div>
}));

// Mock leaflet map
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: () => <div data-testid="marker" />,
  Popup: () => <div data-testid="popup" />,
  Polyline: () => <div data-testid="polyline" />,
  useMap: () => ({})
}));

// Mock the worker hook
vi.mock('../../hooks/useCitySearch', () => ({
  useCitySearch: () => ({
    results: [],
    isLoading: false,
    isReady: true,
    error: null,
    search: vi.fn()
  })
}));

describe('App', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('renders the header', () => {
    render(<App />);
    expect(screen.getByText('Traveled World')).toBeInTheDocument();
  });

  it('renders the city search input', () => {
    render(<App />);
    const input = screen.getByLabelText('Search for a city');
    expect(input).toBeInTheDocument();
  });

  it('renders view switcher', () => {
    render(<App />);
    expect(screen.getByText('2D')).toBeInTheDocument();
    expect(screen.getByText('3D')).toBeInTheDocument();
  });

  it('renders style selector', () => {
    render(<App />);
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('Satellite')).toBeInTheDocument();
  });
});

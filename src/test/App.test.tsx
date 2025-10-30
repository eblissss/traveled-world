import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock the globe component since it requires WebGL
vi.mock('../components/map/Globe3D', () => ({
  Globe3D: () => <div data-testid="globe-3d">3D Globe</div>
}));

// Mock leaflet map
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: () => <div data-testid="marker" />,
  Popup: () => <div data-testid="popup" />,
  Polyline: () => <div data-testid="polyline" />,
  useMap: () => ({}),
}));

describe('App', () => {
  it('renders the header', () => {
    render(<App />);
    expect(screen.getByText('Traveled World')).toBeInTheDocument();
  });

  it('renders the city search input', () => {
    render(<App />);
    const input = screen.getByLabelText('Search for a city');
    expect(input).toBeInTheDocument();
  });
});


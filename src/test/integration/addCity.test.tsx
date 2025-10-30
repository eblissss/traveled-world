import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { useTravelStore } from '../../store/travelStore';
import * as useCitySearchModule from '../../hooks/useCitySearch';

// Mock the worker
vi.mock('../../hooks/useCitySearch', () => ({
  useCitySearch: vi.fn()
}));

// Mock globe and map
vi.mock('../../components/map/Globe3D', () => ({
  Globe3D: () => <div data-testid="globe">Globe</div>
}));

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map">{children}</div>
  ),
  TileLayer: () => null,
  Polyline: () => null,
  useMap: () => ({})
}));

describe('Add City Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    useTravelStore.setState({
      cities: [],
      trips: [],
      preferences: {
        defaultView: '3d',
        theme: 'dark',
        animationSpeed: 1.0
      }
    });

    vi.mocked(useCitySearchModule.useCitySearch).mockReturnValue({
      results: [
        {
          city: 'Tokyo',
          city_ascii: 'Tokyo',
          lat: 35.6762,
          lng: 139.6503,
          country: 'Japan',
          iso2: 'JP',
          iso3: 'JPN',
          admin_name: 'Tokyo',
          capital: 'primary',
          population: 37977000
        }
      ],
      isLoading: false,
      isReady: true,
      error: null,
      search: vi.fn()
    });
  });

  it('should add a city successfully', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Find search input
    const searchInput = screen.getByLabelText('Search for a city');
    expect(searchInput).toBeInTheDocument();

    // Type in search
    await user.type(searchInput, 'Tokyo');

    // Wait for results to appear
    const tokyoResult = await screen.findByText(/Tokyo/);
    expect(tokyoResult).toBeInTheDocument();

    // Click on result
    await user.click(tokyoResult);

    // Form should appear
    const cityName = await screen.findByText('Tokyo, Japan');
    expect(cityName).toBeInTheDocument();

    // Fill date
    const dateInput = screen.getByLabelText('Visit Date');
    await user.clear(dateInput);
    await user.type(dateInput, '2024-01-01');

    // Submit form
    const submitButton = screen.getByText('Add City');
    await user.click(submitButton);

    // Wait for city to be added
    const cities = useTravelStore.getState().cities;
    expect(cities).toHaveLength(1);
    expect(cities[0].name).toBe('Tokyo');
  });

  it('should show error when adding duplicate city', async () => {
    const user = userEvent.setup();
    
    // Add a city first
    useTravelStore.getState().addCity({
      id: '1',
      name: 'Tokyo',
      country: 'Japan',
      coordinates: [35.6762, 139.6503],
      type: 'visited',
      lastVisited: '2024-01-01',
      dateAdded: new Date().toISOString()
    });

    render(<App />);

    const searchInput = screen.getByLabelText('Search for a city');
    await user.type(searchInput, 'Tokyo');

    const tokyoResult = await screen.findByText(/Tokyo/);
    await user.click(tokyoResult);

    const cityName = await screen.findByText('Tokyo, Japan');
    expect(cityName).toBeInTheDocument();

    const dateInput = screen.getByLabelText('Visit Date');
    await user.clear(dateInput);
    await user.type(dateInput, '2024-01-02');

    const submitButton = screen.getByText('Add City');
    await user.click(submitButton);

    // Should show error
    const errorMessage = await screen.findByText(/already in your list/i);
    expect(errorMessage).toBeInTheDocument();
  });
});

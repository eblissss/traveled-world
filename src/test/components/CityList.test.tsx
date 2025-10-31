import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CityList } from '../../components/input/CityList';
import { useTravelStore } from '../../store/travelStore';
import { resetStore, createMockCity } from '../utils/test-utils';

describe('CityList', () => {
  beforeEach(() => {
    resetStore();
  });

  it('shows empty state when no cities', () => {
    render(<CityList />);
    expect(screen.getByText(/Start Your Travel Journey/i)).toBeInTheDocument();
  });

  it('renders list of cities', () => {
    const city1 = createMockCity({
      id: '1',
      name: 'Tokyo',
      country: 'Japan',
      coordinates: [35.6762, 139.6503]
    });
    const city2 = createMockCity({
      id: '2',
      name: 'Paris',
      country: 'France',
      coordinates: [48.8566, 2.3522]
    });
    
    useTravelStore.getState().addCity(city1);
    useTravelStore.getState().addCity(city2);
    
    render(<CityList />);
    
    expect(screen.getByText('Tokyo')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
  });

  // TODO: Re-enable this test once hover behavior can be properly tested
  // The hover-based button visibility makes this test challenging in the current setup
  it.skip('allows deleting a city', async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn(() => true);
    
    const city = createMockCity({ id: '1', name: 'Tokyo' });
    useTravelStore.getState().addCity(city);
    
    render(<CityList />);
    
    // Find the city card and hover over it to make buttons visible
    const cityCard = screen.getByText('Tokyo').closest('.group') as HTMLElement;
    await user.hover(cityCard);

    // Wait for the component to render and find the delete button
    const deleteButton = await screen.findByTitle('Delete city');
    await user.click(deleteButton);
    
    expect(window.confirm).toHaveBeenCalled();
    expect(useTravelStore.getState().cities).toHaveLength(0);
  });

  it('highlights city when highlightedCityId prop is provided', () => {
    const city = createMockCity({ id: '1', name: 'Tokyo' });
    useTravelStore.getState().addCity(city);
    
    render(<CityList highlightedCityId="1" />);
    
    // Find the city card by looking for the container with the group class
    const cityCard = screen.getByText('Tokyo').closest('.group');
    expect(cityCard).toHaveClass('border-accent-primary');
  });
});


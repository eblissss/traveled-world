import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TripCreationModal } from '../../components/input/TripCreationModal';
import { useTravelStore } from '../../store/travelStore';
import { resetStore, createMockCity } from '../utils/test-utils';

describe('TripCreationModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  it('renders when open', () => {
    render(<TripCreationModal isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByRole('heading', { name: 'Create Trip' })).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<TripCreationModal isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByRole('heading', { name: 'Create Trip' })).not.toBeInTheDocument();
  });

  it('requires at least 2 cities to create trip', async () => {
    const user = userEvent.setup();
    render(<TripCreationModal isOpen={true} onClose={mockOnClose} />);

    const nameInput = screen.getByLabelText('Trip Name *');
    await user.type(nameInput, 'Test Trip');

    const submitButton = screen.getByRole('button', { name: 'Create Trip' });
    expect(submitButton).toBeDisabled();
  });

  it('creates trip with selected cities', async () => {
    const city1 = createMockCity({
      id: '1',
      name: 'Tokyo',
      country: 'Japan',
      coordinates: [35.6762, 139.6503] as [number, number]
    });
    const city2 = createMockCity({
      id: '2',
      name: 'Paris',
      country: 'France',
      coordinates: [48.8566, 2.3522] as [number, number]
    });

    useTravelStore.getState().addCity(city1);
    useTravelStore.getState().addCity(city2);

    const user = userEvent.setup();
    render(<TripCreationModal isOpen={true} onClose={mockOnClose} />);

    // Enter trip name
    const nameInput = screen.getByLabelText('Trip Name *');
    await user.type(nameInput, 'World Tour');

    // Select cities (checkboxes)
    const tokyoCheckbox = screen.getByLabelText('Tokyo');
    await user.click(tokyoCheckbox);

    const parisCheckbox = screen.getByLabelText('Paris');
    await user.click(parisCheckbox);

    // Submit
    const submitButton = screen.getByRole('button', { name: 'Create Trip' });
    await user.click(submitButton);

    await waitFor(() => {
      const trips = useTravelStore.getState().trips;
      expect(trips).toHaveLength(1);
      expect(trips[0].name).toBe('World Tour');
      expect(trips[0].cityIds).toHaveLength(2);
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows date pickers for selected cities', async () => {
    const city1 = createMockCity({
      id: '1',
      name: 'Tokyo',
      country: 'Japan',
      coordinates: [35.6762, 139.6503] as [number, number]
    });
    useTravelStore.getState().addCity(city1);

    const user = userEvent.setup();
    render(<TripCreationModal isOpen={true} onClose={mockOnClose} />);

    const tokyoCheckbox = screen.getByLabelText('Tokyo');
    await user.click(tokyoCheckbox);

    await waitFor(() => {
      expect(screen.getByLabelText(/Visit date for Tokyo/)).toBeInTheDocument();
    });
  });

  it('validates that cities have different dates', async () => {
    const city1 = createMockCity({
      id: '1',
      name: 'Tokyo',
      country: 'Japan',
      coordinates: [35.6762, 139.6503] as [number, number],
      lastVisited: '2024-01-01'
    });
    const city2 = createMockCity({
      id: '2',
      name: 'Paris',
      country: 'France',
      coordinates: [48.8566, 2.3522] as [number, number],
      lastVisited: '2024-01-01'
    });

    useTravelStore.getState().addCity(city1);
    useTravelStore.getState().addCity(city2);

    const user = userEvent.setup();
    render(<TripCreationModal isOpen={true} onClose={mockOnClose} />);

    const nameInput = screen.getByLabelText('Trip Name *');
    await user.type(nameInput, 'Test Trip');

    await user.click(screen.getByLabelText('Tokyo'));
    await user.click(screen.getByLabelText('Paris'));

    const submitButton = screen.getByRole('button', { name: 'Create Trip' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/different dates/i)).toBeInTheDocument();
    });
  });
});


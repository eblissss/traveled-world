import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CityEditModal } from '../../components/input/CityEditModal';
import type { City } from '../../types/city';

vi.mock('../../store/travelStore', () => ({
  useTravelStore: () => ({
    updateCity: vi.fn()
  })
}));

describe('CityEditModal', () => {
  const mockCity: City = {
    id: '1',
    name: 'Tokyo',
    country: 'Japan',
    coordinates: [35.6762, 139.6503],
    type: 'visited',
    lastVisited: '2024-01-01',
    dateAdded: new Date().toISOString()
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when city is null', () => {
    const { container } = render(
      <CityEditModal city={null} isOpen={true} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal when city is provided', () => {
    render(
      <CityEditModal city={mockCity} isOpen={true} onClose={mockOnClose} />
    );
    expect(screen.getByText('Edit Tokyo')).toBeInTheDocument();
  });

  it('does not crash when city becomes null', () => {
    const { rerender } = render(
      <CityEditModal city={mockCity} isOpen={true} onClose={mockOnClose} />
    );
    
    // Simulate city becoming null
    rerender(
      <CityEditModal city={null} isOpen={true} onClose={mockOnClose} />
    );
    
    // Should not crash
    expect(screen.queryByText('Edit Tokyo')).not.toBeInTheDocument();
  });
});


import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CitySearchInput } from '../../components/input/CitySearchInput';
import * as useCitySearchModule from '../../hooks/useCitySearch';
import { resetStore } from '../utils/test-utils';

// Mock the worker
vi.mock('../../hooks/useCitySearch', () => ({
  useCitySearch: vi.fn()
}));

describe('CitySearchInput', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
    const mockSearch = vi.fn();
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
          population: 37977000,
          id: 1
        }
      ],
      isLoading: false,
      isReady: true,
      error: null,
      search: mockSearch
    });
  });

  it('renders search input', () => {
    render(<CitySearchInput onSelect={mockOnSelect} />);
    const input = screen.getByPlaceholderText('Search for a city...');
    expect(input).toBeInTheDocument();
  });

  it('shows loading placeholder when not ready', () => {
    vi.mocked(useCitySearchModule.useCitySearch).mockReturnValue({
      results: [],
      isLoading: false,
      isReady: false,
      error: null,
      search: vi.fn()
    });
    
    render(<CitySearchInput onSelect={mockOnSelect} />);
    const input = screen.getByPlaceholderText('Loading cities...');
    expect(input).toBeDisabled();
  });


});

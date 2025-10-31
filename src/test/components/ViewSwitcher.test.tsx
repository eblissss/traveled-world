import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ViewSwitcher } from '../../components/layout/ViewSwitcher';
import { resetStore } from '../utils/test-utils';

describe('ViewSwitcher', () => {
  beforeEach(() => {
    resetStore();
  });

  it('renders 2D and 3D buttons', () => {
    render(<ViewSwitcher />);
    expect(screen.getByText('2D')).toBeInTheDocument();
    expect(screen.getByText('3D')).toBeInTheDocument();
  });

  it('switches to 2D view when clicked', async () => {
    const user = userEvent.setup();
    render(<ViewSwitcher />);
    
    const button2D = screen.getByLabelText('Switch to 2D map view');
    await user.click(button2D);
    
    expect(button2D).toHaveAttribute('aria-pressed', 'true');
  });

  it('switches to 3D view when clicked', async () => {
    const user = userEvent.setup();
    render(<ViewSwitcher />);
    
    const button3D = screen.getByLabelText('Switch to 3D globe view');
    await user.click(button3D);
    
    expect(button3D).toHaveAttribute('aria-pressed', 'true');
  });
});


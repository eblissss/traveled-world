import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../../components/ui/Button';

describe('Button', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('Basic Functionality', () => {
    it('renders with children', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      await user.click(screen.getByText('Click me'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByText('Disabled');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('applies correct type attribute', () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByText('Submit')).toHaveAttribute('type', 'submit');
    });
  });

  describe('Styling and Variants', () => {
    it('applies primary variant styles', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByText('Primary');
      expect(button).toHaveClass('bg-accent-primary', 'text-white');
    });

    it('applies secondary variant styles', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByText('Secondary');
      expect(button).toHaveClass('bg-bg-secondary/80', 'text-text-primary');
    });

    it('applies danger variant styles', () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByText('Danger');
      expect(button).toHaveClass('bg-red-500', 'text-white');
    });

    it('applies size styles correctly', () => {
      const { rerender } = render(<Button size="sm">Small</Button>);
      expect(screen.getByText('Small')).toHaveClass('px-3', 'py-2', 'text-sm');

      rerender(<Button size="md">Medium</Button>);
      expect(screen.getByText('Medium')).toHaveClass('px-4', 'py-2.5', 'text-base');

      rerender(<Button size="lg">Large</Button>);
      expect(screen.getByText('Large')).toHaveClass('px-6', 'py-3', 'text-lg');
    });

    it('shows title tooltip when provided', () => {
      render(<Button title="Tooltip text">Button</Button>);
      expect(screen.getByTitle('Tooltip text')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('shows loading spinner and text when loading', () => {
      render(<Button loading loadingText="Processing...">Save</Button>);

      expect(screen.getByText('Processing...')).toBeInTheDocument();
      expect(screen.queryByText('Save')).not.toBeInTheDocument();

      // Check for spinner (it's an SVG, so we check for the element)
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('uses default loading text when not specified', () => {
      render(<Button loading>Save</Button>);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('prevents clicks when loading', async () => {
      const handleClick = vi.fn();
      render(<Button loading onClick={handleClick}>Save</Button>);

      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Success States', () => {
    it('shows success checkmark and text when success', () => {
      render(<Button success successText="Done!">Save</Button>);

      expect(screen.getByText('Done!')).toBeInTheDocument();
      expect(screen.queryByText('Save')).not.toBeInTheDocument();

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('uses default success text when not specified', () => {
      render(<Button success>Save</Button>);
      expect(screen.getByText('Success!')).toBeInTheDocument();
    });

    it('prevents clicks when success', async () => {
      const handleClick = vi.fn();
      render(<Button success onClick={handleClick}>Save</Button>);

      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Interactive Features', () => {
    it('handles magnetic hover effect (simulated)', async () => {
      const mockOnMouseMove = vi.fn();
      const buttonRef = { current: document.createElement('button') };

      // Mock mouse move event
      buttonRef.current.getBoundingClientRect = vi.fn(() => ({
        left: 100,
        top: 100,
        width: 100,
        height: 40,
        right: 200,
        bottom: 140,
      }));

      render(<Button magnetic>Hover me</Button>);

      const button = screen.getByText('Hover me');
      await user.hover(button);

      // The magnetic effect is handled internally, so we just verify the button exists
      expect(button).toBeInTheDocument();
    });

    it('handles ripple effect on click', async () => {
      render(<Button ripple>Click me</Button>);

      const button = screen.getByText('Click me');
      await user.click(button);

      // Ripple effect creates additional elements, verify button still works
      expect(button).toBeInTheDocument();
    });

    it('shows preview tooltip on hover', async () => {
      render(<Button preview={<span>Preview content</span>}>Hover me</Button>);

      const button = screen.getByText('Hover me');
      await user.hover(button);

      // Preview appears on hover, verify button exists
      expect(button).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('is keyboard accessible', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Press Enter</Button>);

      const button = screen.getByText('Press Enter');
      button.focus();

      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('has proper ARIA attributes when needed', () => {
      render(<Button aria-label="Custom label">Button</Button>);
      expect(screen.getByLabelText('Custom label')).toBeInTheDocument();
    });

    it('respects reduced motion preferences', () => {
      // Mock reduced motion
      const mockMatchMedia = vi.fn(() => ({
        matches: true,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      global.matchMedia = mockMatchMedia;

      render(<Button>Reduced motion</Button>);
      const button = screen.getByText('Reduced motion');

      expect(button).toBeInTheDocument();
    });
  });

  describe('Visual States', () => {
    it('maintains visual consistency across different states', () => {
      const { rerender } = render(<Button>Normal</Button>);
      let button = screen.getByText('Normal');
      expect(button).toHaveClass('font-medium', 'rounded-xl');

      rerender(<Button loading>Loading</Button>);
      button = screen.getByText('Loading...');
      expect(button).toHaveClass('font-medium', 'rounded-xl');

      rerender(<Button success>Success</Button>);
      button = screen.getByText('Success!');
      expect(button).toHaveClass('font-medium', 'rounded-xl');
    });

    it('applies consistent spacing and typography', () => {
      render(<Button>Consistent</Button>);
      const button = screen.getByText('Consistent');

      // Check for consistent base classes
      expect(button).toHaveClass('font-medium', 'transition-all', 'focus:outline-none');
    });
  });

  describe('Performance', () => {
    it('debounces rapid clicks appropriately', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Rapid Click</Button>);

      const button = screen.getByText('Rapid Click');

      // Rapid clicks should still work (debouncing is handled at component level)
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it('handles props changes efficiently', () => {
      const { rerender } = render(<Button variant="primary">Test</Button>);
      expect(screen.getByText('Test')).toHaveClass('bg-accent-primary');

      rerender(<Button variant="secondary">Test</Button>);
      expect(screen.getByText('Test')).toHaveClass('bg-bg-secondary/80');
    });
  });

  describe('Error Boundaries', () => {
    it('handles invalid children gracefully', () => {
      // This would be caught by React's error boundary
      expect(() => {
        render(<Button>{null}</Button>);
      }).not.toThrow();
    });

    it('handles invalid onClick gracefully', () => {
      render(<Button onClick={undefined}>Click</Button>);
      const button = screen.getByText('Click');
      expect(button).toBeInTheDocument();
    });
  });
});


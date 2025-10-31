import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast, ToastContainer } from '../../components/ui/Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders toast message', () => {
    render(<Toast message="Test message" type="info" onClose={vi.fn()} />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('calls onClose after duration', async () => {
    const onClose = vi.fn();
    render(<Toast message="Test" type="info" duration={1000} onClose={onClose} />);
    
    vi.advanceTimersByTime(1100);
    
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('renders different toast types', () => {
    const { rerender } = render(<Toast message="Success" type="success" onClose={vi.fn()} />);
    const successToast = screen.getByText('Success');
    expect(successToast.closest('div')).toHaveClass('bg-green-100');
    
    rerender(<Toast message="Error" type="error" onClose={vi.fn()} />);
    const errorToast = screen.getByText('Error');
    expect(errorToast.closest('div')).toHaveClass('bg-red-100');
    
    rerender(<Toast message="Warning" type="warning" onClose={vi.fn()} />);
    const warningToast = screen.getByText('Warning');
    expect(warningToast.closest('div')).toHaveClass('bg-yellow-100');
  });

  it('can be closed manually', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    
    render(<Toast message="Test" type="info" onClose={onClose} />);
    
    const closeButton = screen.getByLabelText('Close notification');
    await user.click(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });
});

describe('ToastContainer', () => {
  it('renders multiple toasts', () => {
    const toasts = [
      { id: '1', message: 'First toast', type: 'info' as const },
      { id: '2', message: 'Second toast', type: 'success' as const }
    ];
    
    render(<ToastContainer toasts={toasts} onRemove={vi.fn()} />);
    
    expect(screen.getByText('First toast')).toBeInTheDocument();
    expect(screen.getByText('Second toast')).toBeInTheDocument();
  });

  it('calls onRemove when toast is closed', async () => {
    const onRemove = vi.fn();
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    
    const toasts = [
      { id: '1', message: 'Test toast', type: 'info' as const }
    ];
    
    render(<ToastContainer toasts={toasts} onRemove={onRemove} />);
    
    const closeButton = screen.getByLabelText('Close notification');
    await user.click(closeButton);
    
    await waitFor(() => {
      expect(onRemove).toHaveBeenCalledWith('1');
    });
    
    vi.useRealTimers();
  });
});


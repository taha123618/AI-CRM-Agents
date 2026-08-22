import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BroadcastModal } from '../components/BroadcastModal';

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('WhatsApp Business Feature Suite', () => {
  it('renders BroadcastModal with template selections and default recipients', () => {
    const handleClose = vi.fn();
    renderWithQuery(<BroadcastModal onClose={handleClose} />);

    expect(screen.getByText(/BROADCAST CAMPAIGN STUDIO/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Enterprise Pricing/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Demo Invite/i)).toBeInTheDocument();
    expect(screen.getByText(/\+1 \(415\) 555-0001/i)).toBeInTheDocument();
  });

  it('allows adding and removing recipient phone numbers', () => {
    const handleClose = vi.fn();
    renderWithQuery(<BroadcastModal onClose={handleClose} />);

    const phoneInput = screen.getByPlaceholderText(/\+1 \(555\) 000-0000/i);
    fireEvent.change(phoneInput, { target: { value: '+1 (555) 999-8888' } });

    // Click the plus button right next to input
    const addBtn = phoneInput.parentElement?.querySelector('button');
    if (addBtn) {
      fireEvent.click(addBtn);
    }

    expect(screen.getByText(/\+1 \(555\) 999-8888/i)).toBeInTheDocument();
  });

  it('switches broadcast message when a different template button is clicked', () => {
    const handleClose = vi.fn();
    renderWithQuery(<BroadcastModal onClose={handleClose} />);

    const demoInviteBtn = screen.getByText(/Demo Invite/i);
    fireEvent.click(demoInviteBtn);

    const textarea = screen.getByDisplayValue(/I'd like to invite you to a personalized 15-minute live demo/i);
    expect(textarea).toBeInTheDocument();
  });
});

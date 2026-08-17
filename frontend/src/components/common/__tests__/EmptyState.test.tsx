import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { EmptyState } from '../EmptyState';

describe('EmptyState Component', () => {
  it('renders title and description', () => {
    const { getByText } = render(
      <EmptyState
        title="No Conversations Found"
        description="Try searching for a different contact name or phone number."
      />
    );
    expect(getByText('No Conversations Found')).toBeInTheDocument();
    expect(getByText(/try searching for a different contact/i)).toBeInTheDocument();
  });

  it('renders action button and triggers callback when clicked', () => {
    const handleAction = vi.fn();
    const { getByRole } = render(
      <EmptyState
        title="No Leads"
        description="No leads match the filter."
        actionLabel="Create Lead"
        onAction={handleAction}
      />
    );
    const actionBtn = getByRole('button', { name: /create lead/i });
    expect(actionBtn).toBeInTheDocument();
    fireEvent.click(actionBtn);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});

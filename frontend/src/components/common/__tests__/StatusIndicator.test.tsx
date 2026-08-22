import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { StatusIndicator } from '../StatusIndicator';

describe('StatusIndicator Component', () => {
  it('renders status indicator with label', () => {
    const { getByText } = render(<StatusIndicator status="online" label="Agent Active" />);
    expect(getByText('Agent Active')).toBeInTheDocument();
  });

  it('renders warning and error status indicators', () => {
    const { getByText, rerender } = render(<StatusIndicator status="warning" label="High Churn Risk" />);
    expect(getByText('High Churn Risk')).toBeInTheDocument();

    rerender(<StatusIndicator status="error" label="Connection Failed" />);
    expect(getByText('Connection Failed')).toBeInTheDocument();
  });
});

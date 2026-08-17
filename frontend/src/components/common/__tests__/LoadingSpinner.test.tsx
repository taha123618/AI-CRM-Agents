import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('renders loading spinner container', () => {
    const { container } = render(<LoadingSpinner size="md" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies custom size and className properly', () => {
    const { container } = render(<LoadingSpinner size="lg" className="custom-spinner" />);
    expect(container.querySelector('.custom-spinner')).toBeInTheDocument();
  });
});

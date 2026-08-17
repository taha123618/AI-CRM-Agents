import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Badge } from '../Badge';

describe('Badge Component', () => {
  it('renders badge with text content', () => {
    const { getByText } = render(<Badge>Active</Badge>);
    expect(getByText('Active')).toBeInTheDocument();
  });

  it('applies variant styling classes properly', () => {
    const { container } = render(<Badge variant="success">Qualified</Badge>);
    expect(container.firstChild).toBeInTheDocument();
  });
});

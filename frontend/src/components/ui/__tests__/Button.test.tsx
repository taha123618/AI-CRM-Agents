import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
  it('renders button with correct text', () => {
    const { getByRole } = render(<Button>Click Me</Button>);
    expect(getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('triggers onClick handler when clicked', () => {
    const handleClick = vi.fn();
    const { getByRole } = render(<Button onClick={handleClick}>Action</Button>);
    fireEvent.click(getByRole('button', { name: /action/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not trigger onClick when disabled', () => {
    const handleClick = vi.fn();
    const { getByRole } = render(<Button disabled onClick={handleClick}>Disabled</Button>);
    const btn = getByRole('button', { name: /disabled/i });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders with custom className', () => {
    const { getByRole } = render(<Button className="custom-test-class">Styled</Button>);
    expect(getByRole('button', { name: /styled/i })).toHaveClass('custom-test-class');
  });
});

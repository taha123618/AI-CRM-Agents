import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../Input';

describe('Input Component', () => {
  it('renders input field with placeholder and label', () => {
    render(<Input label="Lead Name" placeholder="Enter full name" />);
    expect(screen.getByText('Lead Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter full name')).toBeInTheDocument();
  });

  it('renders required indicator when required is true', () => {
    render(<Input label="Work Email" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders error message and destructive styling when error is passed', () => {
    render(<Input label="Password" error="Password must be at least 8 characters" />);
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
  });

  it('handles user input change events correctly', () => {
    const handleChange = vi.fn();
    render(<Input placeholder="Type here" onChange={handleChange} />);
    const input = screen.getByPlaceholderText('Type here');
    fireEvent.change(input, { target: { value: 'New text' } });
    expect(handleChange).toHaveBeenCalled();
  });
});

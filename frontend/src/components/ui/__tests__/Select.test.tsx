import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from '../Select';

const sampleOptions = [
  { value: 'discovery', label: 'Discovery' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed_won', label: 'Closed Won' },
];

describe('Select Component', () => {
  it('renders select dropdown with label and options', () => {
    render(<Select label="Pipeline Stage" options={sampleOptions} defaultValue="discovery" />);
    expect(screen.getByText('Pipeline Stage')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Discovery')).toBeInTheDocument();
    expect(screen.getByText('Closed Won')).toBeInTheDocument();
  });

  it('renders required star indicator when required is true', () => {
    render(<Select label="Deal Type" options={sampleOptions} required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders error message when error is provided', () => {
    render(<Select label="Stage" options={sampleOptions} error="Stage is required" />);
    expect(screen.getByText('Stage is required')).toBeInTheDocument();
  });

  it('triggers onChange callback when option is selected', () => {
    const handleChange = vi.fn();
    render(<Select label="Stage" options={sampleOptions} onChange={handleChange} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'proposal' } });
    expect(handleChange).toHaveBeenCalled();
  });
});

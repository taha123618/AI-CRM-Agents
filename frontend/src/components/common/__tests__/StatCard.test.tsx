import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { StatCard } from '../StatCard';

describe('StatCard Component', () => {
  it('renders title, value, and subtitle', () => {
    const { getByText, getByTestId } = render(
      <StatCard
        title="Total Pipeline"
        value="$520,000"
        subtitle="+12.4% this month"
        icon={<span data-testid="test-icon">💰</span>}
      />
    );
    expect(getByText('Total Pipeline')).toBeInTheDocument();
    expect(getByText('$520,000')).toBeInTheDocument();
    expect(getByText('+12.4% this month')).toBeInTheDocument();
    expect(getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders skeleton placeholder when loading is true', () => {
    const { getByText, queryByText, container } = render(
      <StatCard
        title="Loading Metric"
        value="0"
        loading={true}
        icon={<span>📊</span>}
      />
    );
    expect(getByText('Loading Metric')).toBeInTheDocument();
    expect(queryByText('0')).not.toBeInTheDocument();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});

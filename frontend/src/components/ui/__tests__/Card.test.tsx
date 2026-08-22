import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent } from '../Card';

describe('Card Component', () => {
  it('renders card title and children content', () => {
    const { getByText } = render(
      <Card>
        <CardHeader>
          <CardTitle>Revenue Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Monte Carlo Probability: 85%</p>
        </CardContent>
      </Card>
    );
    expect(getByText('Revenue Forecast')).toBeInTheDocument();
    expect(getByText('Monte Carlo Probability: 85%')).toBeInTheDocument();
  });
});

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConfidenceMeter } from './ConfidenceMeter';

describe('ConfidenceMeter', () => {
  it('renders the percentage rounded from the 0-1 score', () => {
    render(<ConfidenceMeter score={0.826} />);
    expect(screen.getByText('83%')).toBeInTheDocument();
  });

  it('renders 0% for a zero score without crashing', () => {
    render(<ConfidenceMeter score={0} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});

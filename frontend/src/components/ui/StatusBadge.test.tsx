import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders known statuses with the status text', () => {
    render(<StatusBadge status="completed" />);
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  it('falls back gracefully for an unknown status instead of crashing', () => {
    render(<StatusBadge status="some_future_status" />);
    expect(screen.getByText('some_future_status')).toBeInTheDocument();
  });
});

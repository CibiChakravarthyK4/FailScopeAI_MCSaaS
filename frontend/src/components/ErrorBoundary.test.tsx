import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ErrorBoundary } from './ErrorBoundary';

function Bomb(): never {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  it('renders children when nothing throws', () => {
    render(
      <MemoryRouter>
        <ErrorBoundary>
          <div>fine</div>
        </ErrorBoundary>
      </MemoryRouter>
    );
    expect(screen.getByText('fine')).toBeInTheDocument();
  });

  it('renders the friendly 500 page when a child throws during render', () => {
    // React logs the error to the console too; keep the test output clean.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <MemoryRouter>
        <ErrorBoundary>
          <Bomb />
        </ErrorBoundary>
      </MemoryRouter>
    );
    expect(screen.getByText('Something went wrong on our end.')).toBeInTheDocument();
    vi.restoreAllMocks();
  });
});

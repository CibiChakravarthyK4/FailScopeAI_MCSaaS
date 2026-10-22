import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import * as authService from '../services/authService';

vi.mock('../services/authService');

function Probe() {
  const { user, isLoading, login, logout } = useAuth();
  if (isLoading) return <div>loading</div>;
  return (
    <div>
      <div data-testid="user">{user ? user.email : 'none'}</div>
      <button onClick={() => login('a@example.com', 'pw')}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

const fakeUser = {
  id: 1,
  tenant_id: 1,
  email: 'a@example.com',
  full_name: 'A',
  role: 'admin' as const,
  is_active: true,
  tenant_name: 'Acme',
  needs_legal_acceptance: false,
};

beforeEach(() => {
  localStorage.clear();
  vi.resetAllMocks();
});

describe('AuthContext', () => {
  it('starts with no user when there is no stored token', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('none'));
  });

  it('logs in and exposes the resulting user', async () => {
    vi.mocked(authService.login).mockResolvedValue({
      access_token: 'a',
      refresh_token: 'r',
      token_type: 'bearer',
    });
    vi.mocked(authService.me).mockResolvedValue(fakeUser);

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('none'));

    await act(async () => {
      screen.getByText('login').click();
    });

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('a@example.com'));
    expect(localStorage.getItem('access_token')).toBe('a');
  });

  it('logout clears the user and storage', async () => {
    vi.mocked(authService.login).mockResolvedValue({
      access_token: 'a',
      refresh_token: 'r',
      token_type: 'bearer',
    });
    vi.mocked(authService.me).mockResolvedValue(fakeUser);
    vi.mocked(authService.logout).mockResolvedValue(undefined);

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await act(async () => {
      screen.getByText('login').click();
    });
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('a@example.com'));

    await act(async () => {
      screen.getByText('logout').click();
    });

    expect(screen.getByTestId('user')).toHaveTextContent('none');
    expect(localStorage.getItem('access_token')).toBeNull();
  });
});

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';
import * as authService from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, tenantName: string, fullName?: string) => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    authService
      .me()
      .then(setUser)
      .catch(() => localStorage.clear())
      .finally(() => setIsLoading(false));
  }, []);

  const applyTokens = async (accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    setUser(await authService.me());
  };

  const login = async (email: string, password: string) => {
    const tokens = await authService.login(email, password);
    await applyTokens(tokens.access_token, tokens.refresh_token);
  };

  const register = async (email: string, password: string, tenantName: string, fullName?: string) => {
    const tokens = await authService.register(email, password, tenantName, fullName);
    await applyTokens(tokens.access_token, tokens.refresh_token);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      // Best-effort: revoke server-side so the refresh token can't mint new access
      // tokens after logout. The user is logged out locally either way.
      await authService.logout(refreshToken).catch(() => {});
    }
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, setTokens: applyTokens, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

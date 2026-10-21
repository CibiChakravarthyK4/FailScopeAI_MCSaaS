import { createContext, useContext, useState, ReactNode } from 'react';
import * as ownerService from '../services/ownerService';

interface OwnerAuthContextType {
  isOwnerSignedIn: boolean;
  ownerLogin: (email: string, password: string, totpCode: string) => Promise<void>;
  ownerLogout: () => void;
}

const OwnerAuthContext = createContext<OwnerAuthContextType | undefined>(undefined);

export function OwnerAuthProvider({ children }: { children: ReactNode }) {
  const [isOwnerSignedIn, setIsOwnerSignedIn] = useState(() => Boolean(localStorage.getItem('owner_access_token')));

  const ownerLogin = async (email: string, password: string, totpCode: string) => {
    const token = await ownerService.ownerLogin(email, password, totpCode);
    localStorage.setItem('owner_access_token', token);
    setIsOwnerSignedIn(true);
  };

  const ownerLogout = () => {
    localStorage.removeItem('owner_access_token');
    setIsOwnerSignedIn(false);
  };

  return (
    <OwnerAuthContext.Provider value={{ isOwnerSignedIn, ownerLogin, ownerLogout }}>
      {children}
    </OwnerAuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOwnerAuth(): OwnerAuthContextType {
  const ctx = useContext(OwnerAuthContext);
  if (!ctx) throw new Error('useOwnerAuth must be used within OwnerAuthProvider');
  return ctx;
}

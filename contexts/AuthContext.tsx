import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { tokenStorage, TOKEN_KEY } from '../services/tokenStorage';
import { api, User } from '../services/api';
import { stopBackgroundLocation } from '../services/backgroundLocation';

type AuthContextValue = {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, displayName: string, region: string, inviteCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await tokenStorage.get(TOKEN_KEY);
        if (stored) {
          try {
            const { user } = await api.me(stored);
            setToken(stored);
            setUser(user);
          } catch {
            await tokenStorage.remove(TOKEN_KEY);
          }
        }
      } catch {
        // armazenamento indisponível nesta plataforma — segue sem sessão guardada
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { token, user } = await api.login(username, password);
    await tokenStorage.set(TOKEN_KEY, token);
    setToken(token);
    setUser(user);
  }, []);

  const register = useCallback(
    async (username: string, password: string, displayName: string, region: string, inviteCode?: string) => {
      const { token, user } = await api.register(username, password, displayName, region, inviteCode);
      await tokenStorage.set(TOKEN_KEY, token);
      setToken(token);
      setUser(user);
    },
    []
  );

  const logout = useCallback(async () => {
    await stopBackgroundLocation();
    await tokenStorage.remove(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    const { user } = await api.me(token);
    setUser(user);
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}

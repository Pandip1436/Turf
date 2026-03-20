/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user:            User | null;
  token:           string | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  login:           (token: string, user: User) => void;
  logout:          () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // ── Lazy initialisers read localStorage synchronously on the FIRST render.
  //    This means `token` and `user` are already populated before any child
  //    renders — eliminating the "flash to login on refresh" race condition.
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('hg360_token')
  );
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem('hg360_user');
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });

  // isLoading stays true until the useEffect verification runs.
  // Components that gate on auth should wait for isLoading === false.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('hg360_token');
    const storedUser  = localStorage.getItem('hg360_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser) as User);
      } catch {
        // Corrupt storage — wipe it
        localStorage.removeItem('hg360_token');
        localStorage.removeItem('hg360_user');
        setToken(null);
        setUser(null);
      }
    } else {
      setToken(null);
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('hg360_token', newToken);
    localStorage.setItem('hg360_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('hg360_token');
    localStorage.removeItem('hg360_user');
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!token && !!user, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminAuthContextType {
  admin:           AdminUser | null;
  token:           string | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  login:           (token: string, user: AdminUser) => void;
  logout:          () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  // ── Read localStorage synchronously as initial state so first render is correct
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('hg360_admin_token')
  );
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    try {
      const u = localStorage.getItem('hg360_admin_user');
      return u ? (JSON.parse(u) as AdminUser) : null;
    } catch { return null; }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Re-verify on mount (handles multi-tab changes)
    const t = localStorage.getItem('hg360_admin_token');
    const u = localStorage.getItem('hg360_admin_user');
    if (t && u) {
      try {
        setToken(t);
        setAdmin(JSON.parse(u) as AdminUser);
      } catch {
        localStorage.removeItem('hg360_admin_token');
        localStorage.removeItem('hg360_admin_user');
        setToken(null); setAdmin(null);
      }
    } else {
      setToken(null); setAdmin(null);
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, user: AdminUser) => {
    setToken(newToken); setAdmin(user);
    localStorage.setItem('hg360_admin_token', newToken);
    localStorage.setItem('hg360_admin_user', JSON.stringify(user));
  };

  const logout = () => {
    setToken(null); setAdmin(null);
    localStorage.removeItem('hg360_admin_token');
    localStorage.removeItem('hg360_admin_user');
  };

  return (
    <AdminAuthContext.Provider
      value={{ admin, token, isAuthenticated: !!token && !!admin, isLoading, login, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('hg360_admin_token');
    const u = localStorage.getItem('hg360_admin_user');
    if (t && u) { setToken(t); setAdmin(JSON.parse(u)); }
  }, []);

  const login = (token: string, user: AdminUser) => {
    setToken(token); setAdmin(user);
    localStorage.setItem('hg360_admin_token', token);
    localStorage.setItem('hg360_admin_user', JSON.stringify(user));
  };

  const logout = () => {
    setToken(null); setAdmin(null);
    localStorage.removeItem('hg360_admin_token');
    localStorage.removeItem('hg360_admin_user');
  };

  return (
    <AdminAuthContext.Provider value={{ admin, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};

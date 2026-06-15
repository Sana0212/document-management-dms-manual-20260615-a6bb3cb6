'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

/** Client session user — camelCase fields (maps from API /api/auth/me). */
export interface SessionUser {
  userId: string;
  email: string;
  role: string;
  fullName: string;
  department?: string;
}

export interface SessionContextProps {
  user: SessionUser | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextProps>({
  user: null,
  loading: true,
  refreshSession: async () => {},
  logout: async () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const body = await res.json();
        setUser(body.user ?? null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore network errors
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    void refreshSession();
  }, []);

  return (
    <SessionContext.Provider value={{ user, loading, refreshSession, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextProps {
  return useContext(SessionContext);
}

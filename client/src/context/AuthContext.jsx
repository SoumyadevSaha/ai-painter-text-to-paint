import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { API_URL } from '../config';

const STORAGE_KEY = 'ai-painter-auth';
const AuthContext = createContext(null);

const readStoredSession = () => {
  try {
    const rawValue = localStorage.getItem(STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    return null;
  }
};

const persistSession = (session) => {
  if (!session) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => readStoredSession());
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      if (!session?.token) {
        setAuthReady(true);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/v1/auth/me`, {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Session expired');
        }

        const data = await response.json();
        const nextSession = { token: session.token, user: data.user };
        setSession(nextSession);
        persistSession(nextSession);
      } catch {
        setSession(null);
        persistSession(null);
      } finally {
        setAuthReady(true);
      }
    };

    validateSession();
  }, []);

  const updateSession = (nextSession) => {
    setSession(nextSession);
    persistSession(nextSession);
  };

  const authenticate = async (path, payload) => {
    const response = await fetch(`${API_URL}/api/v1/auth/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || 'Authentication failed');
    }

    const nextSession = {
      token: data.token,
      user: data.user,
    };

    updateSession(nextSession);
    return nextSession;
  };

  const authFetch = (path, options = {}) => {
    const headers = {
      ...(options.headers || {}),
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
    };

    return fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  };

  const value = useMemo(() => ({
    authReady,
    token: session?.token || null,
    user: session?.user || null,
    isAuthenticated: Boolean(session?.token),
    login: (payload) => authenticate('login', payload),
    register: (payload) => authenticate('register', payload),
    logout: () => updateSession(null),
    authFetch,
  }), [authReady, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return value;
};

export { AuthProvider, useAuth };

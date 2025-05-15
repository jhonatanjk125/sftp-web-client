import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  async function login({ host, port, username, password }) {
    setError('');
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host, port, username, password }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Login failed');
      }
      setUser({ username, host, port });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function logout() {
    try {
      const res = await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Logout failed');
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Error on logout
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
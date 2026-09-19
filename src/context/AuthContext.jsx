import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * @typedef {Object} User
 * @property {string} _id - User ID
 * @property {string} username - Username
 * @property {string} role - User role (headoffice|subordinate|renter)
 * @property {string} [fullName] - Full name
 * @property {string} [email] - Email address
 * @property {string} [phone] - Phone number
 */

/**
 * @typedef {Object} AuthContextValue
 * @property {User|null} user - Current user object
 * @property {string|null} token - JWT auth token
 * @property {boolean} isAuthenticated - Whether user is logged in
 * @property {(userData: User, authToken: string) => void} login - Login handler
 * @property {() => void} logout - Logout handler
 */

const AuthContext = createContext(null);

/**
 * Provides authentication state and methods to the component tree.
 * Persists auth state to localStorage for session continuity.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const login = useCallback((userData, authToken) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
    setUser(userData);
    setToken(authToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      login,
      logout,
    }),
    [user, token, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access authentication context.
 * Must be used within an AuthProvider.
 * @returns {AuthContextValue}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

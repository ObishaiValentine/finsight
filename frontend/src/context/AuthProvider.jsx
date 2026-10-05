import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { authService } from '../services/authService';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('finsight-token');
      const savedUser = localStorage.getItem('finsight-user');

      if (token && savedUser) {
        try {
          // Set user from cache immediately (fast)
          setUser(JSON.parse(savedUser));

          // Then verify with backend (fresh data)
          const freshUser = await authService.getCurrentUser();
          setUser(freshUser);
          localStorage.setItem('finsight-user', JSON.stringify(freshUser));
        } catch {
          // Token invalid or expired — clear
          localStorage.removeItem('finsight-token');
          localStorage.removeItem('finsight-user');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  // Real login via backend
  const login = async (email, password) => {
    const data = await authService.login(email, password);

    // Store token + user
    localStorage.setItem('finsight-token', data.access_token);
    localStorage.setItem('finsight-user', JSON.stringify(data.user));

    setUser(data.user);
    return data.user;
  };

  // Real signup via backend
  const signup = async (name, email, password) => {
    const data = await authService.signup(email, password, name);

    // Store token + user
    localStorage.setItem('finsight-token', data.access_token);
    localStorage.setItem('finsight-user', JSON.stringify(data.user));

    setUser(data.user);
    return data.user;
  };

  // Logout
  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

    const refreshUser = async () => {
    try {
      const freshUser = await authService.getCurrentUser();
      setUser(freshUser);
      localStorage.setItem('finsight-user', JSON.stringify(freshUser));
      return freshUser;
    } catch {
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
import { useState, useEffect } from 'react';
import { autoSyncOnLogin } from '../services/autoSyncService';
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
          setUser(JSON.parse(savedUser));
          const freshUser = await authService.getCurrentUser();
          setUser(freshUser);
          localStorage.setItem('finsight-user', JSON.stringify(freshUser));

          // Auto-sync Gmail in background (non-blocking)
         autoSyncOnLogin(freshUser.id).catch(() => {});
        } catch {
          localStorage.removeItem('finsight-token');
          localStorage.removeItem('finsight-user');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  // Re-sync whenever user returns to the tab
  useEffect(() => {
    if (!user?.id) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        autoSyncOnLogin(user.id).catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user?.id]);

  // Real login via backend
  const login = async (email, password) => {
  const data = await authService.login(email, password);

    localStorage.setItem('finsight-token', data.access_token);
    localStorage.setItem('finsight-user', JSON.stringify(data.user));

    setUser(data.user);

    // Auto-sync Gmail in background after login (non-blocking)
    autoSyncOnLogin(data.user.id).catch(() => {});

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
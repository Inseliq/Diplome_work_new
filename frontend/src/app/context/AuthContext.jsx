import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const isAuthenticated = Boolean(user);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setIsAuthLoading(false);
    }
  }

  async function login(email, password) {
    const result = await authService.login(email, password);

    if (result.user) {
      setUser(result.user);
    } else {
      await loadUser();
    }

    return result;
  }

  async function register(nickname, email, password, confirmPassword) {
    const result = await authService.register(nickname, email, password, confirmPassword);

    if (result.user) {
      setUser(result.user);
    } else {
      await loadUser();
    }

    return result;
  }

  async function logout() {
    await authService.logout();
    setUser(null);
  }

  function hasRole(role) {
    return user?.roles?.includes(role) ?? false;
  }

  function hasAnyRole(roles) {
    return roles.some((role) => user?.roles?.includes(role));
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAuthLoading,
        login,
        register,
        logout,
        refreshUser: loadUser,
        hasRole,
        hasAnyRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
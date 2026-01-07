import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../config/api';
import { setToken, getToken, removeToken, setUser, getUser, removeUser } from '../utils/localStorage';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = getToken();
      const savedUser = getUser();

      if (token && savedUser) {
        setUserState(savedUser);
        setIsAuthenticated(true);

        // Verify token is still valid
        try {
          const response = await authAPI.getProfile();
          setUserState(response.data.data.user);
          setUser(response.data.data.user);
        } catch (error) {
          // Token is invalid
          logout();
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data.data;

      setToken(token);
      setUser(user);
      setUserState(user);
      setIsAuthenticated(true);

      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data.data;

      setToken(token);
      setUser(user);
      setUserState(user);
      setIsAuthenticated(true);

      return { success: true, user };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = async () => {
    try {
      removeToken();
      removeUser();
      localStorage.clear(); // Clear everything to ensure clean logout
      setUserState(null);
      setIsAuthenticated(false);
      console.log('✅ Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if error occurs
      localStorage.clear();
      setUserState(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (updatedUser) => {
    setUserState(updatedUser);
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

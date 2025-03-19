import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      const { token } = response.data;
      localStorage.setItem('token', token);
      
      // Get user data
      const userResponse = await axios.get('http://localhost:5000/api/auth/me', {
        headers: {
          'x-auth-token': token
        }
      });

      const userData = userResponse.data;
      setUser(userData);
      
      // Return the dashboard route based on user role
      if (userData.role === 0) return '/farmer-dashboard';
      if (userData.role === 1 || userData.role === 2) return '/admin-dashboard';
      
      return '/';
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Check auth status on mount and token change
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.get('http://localhost:5000/api/auth/me', {
        headers: {
          'x-auth-token': token
        }
      });
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
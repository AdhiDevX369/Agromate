import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api'; 

// Create auth context
const AuthContext = createContext();

// Create provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authStatus, setAuthStatus] = useState('idle'); // 'idle', 'pending', 'approved', 'blocked'
  const navigate = useNavigate();

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if token exists in localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Get current user data
        const response = await authAPI.getCurrentUser();
        const userData = response.data.data;
        setUser(userData);
        setAuthStatus(userData.status || 'approved');
      } catch (err) {
        console.error('Error loading user:', err);
        localStorage.removeItem('token');
        setError('Authentication error. Please login again.');
        setAuthStatus('idle');
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Login user
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login(credentials);
      const { token, user } = response.data.data;
      
      // Save token to localStorage first
      localStorage.setItem('token', token);
      
      // Set user in state for all cases
      setUser(user);
      setAuthStatus(user.status);
      
      // Handle different status cases
      if (user.status === 'pending') {
        navigate('/registration-success');
        return user;
      }

      if (user.status === 'blocked') {
        setError('Your account has been blocked. Please contact support.');
        localStorage.removeItem('token');
        return null;
      }
      
      // Redirect based on role for active users
      if (user.status === 'active') {
        if (user.role === 'admin' || user.role === 'super_admin') {
          navigate('/dashboard/admin');
        } else {
          navigate('/dashboard/farmer');
        }
      }
      
      return user;
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle specific error cases
      if (err.response?.status === 403) {
        if (err.response.data.message.includes('pending approval')) {
          setAuthStatus('pending');
          setError('Your account is pending approval from admin. You will be notified once approved.');
          navigate('/registration-success');
        } else if (err.response.data.message.includes('blocked')) {
          setAuthStatus('blocked');
          setError('Your account has been blocked. Please contact support.');
        }
      } else if (err.response?.status === 423) {
        setError(err.response.data.message || 'Account is locked. Please try again later.');
      } else if (err.response?.status === 401) {
        setError(err.response.data.message || 'Invalid email or password.');
      } else {
        setError('Login failed. Please try again.');
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.register(userData);
      const { token } = response.data.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Set status to pending for new registrations
      setAuthStatus('pending');
      
      // Redirect to registration success page
      navigate('/registration-success');
      
      return response.data;
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response?.status === 409) {
        setError('An account with this email already exists.');
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setAuthStatus('idle');
    setError(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        authStatus,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
        isFarmer: user?.role === 'farmer',
        isPending: authStatus === 'pending',
        isBlocked: authStatus === 'blocked'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Create custom hook for using auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
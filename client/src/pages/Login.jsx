import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LockClosedIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, loading, error: authError, authStatus } = useAuth();
  const [error, setError] = useState('');

  // Update local error state when auth error changes
  useEffect(() => {
    setError(authError);
  }, [authError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(formData);
    } catch (err) {
      // The error is already handled in AuthContext
      // We just prevent the form from submitting
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Define error alert styles based on status
  const getErrorStyles = () => {
    if (authStatus === 'blocked') {
      return 'bg-red-50 text-red-800 border-red-300';
    }
    if (authStatus === 'pending') {
      return 'bg-yellow-50 text-yellow-800 border-yellow-300';
    }
    return 'bg-red-50 text-red-800 border-red-300';
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your dashboard and manage your farm
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-md border p-4 ${getErrorStyles()}`}
          >
            <div className="flex">
              <ExclamationCircleIcon className="h-5 w-5 mr-3" />
              <div>
                <p className="text-sm font-medium">{error}</p>
                {authStatus === 'blocked' && (
                  <p className="text-sm mt-1">
                    Please contact support for assistance.
                  </p>
                )}
                {authStatus === 'pending' && (
                  <p className="text-sm mt-1">
                    Your account will be activated once approved by an administrator.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
        
        <motion.form 
          className="mt-8 space-y-6" 
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/register" className="text-primary hover:text-primary-dark">
                Don't have an account? Register
              </Link>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || authStatus === 'blocked'}
            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white ${
              loading || authStatus === 'blocked'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
            } transition-colors duration-200`}
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <LockClosedIcon className={`h-5 w-5 ${
                loading || authStatus === 'blocked' ? 'text-gray-300' : 'text-primary-light group-hover:text-primary'
              }`} />
            </span>
            {loading ? 'Signing in...' : 'Sign in'}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
}
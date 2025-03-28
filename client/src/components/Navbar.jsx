import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const getNavigationItems = (userRole) => {
  // Common navigation items for all users
  const commonItems = [
    { name: 'Home', href: '/' },
    { name: 'Weather', href: '/weather' },
    { name: 'Contact', href: '/contact' },
  ];

  // Role-specific navigation items
  if (userRole === 'farmer') {
    return [
      ...commonItems,
      { name: 'Market Prices', href: '/market' },
      { name: 'My Dashboard', href: '/dashboard/farmer' },
    ];
  } else if (userRole === 'admin' || userRole === 'super_admin') {
    return [
      { name: 'Admin Dashboard', href: '/dashboard/admin' },
    ];
  }

  // For non-authenticated users
  return commonItems;
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const navigation = getNavigationItems(user?.role);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="bg-white shadow-lg sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
          >
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary">Agromate</span>
            </Link>
          </motion.div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <motion.div
                key={item.name}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={item.href}
                  className="text-gray-700 hover:text-primary font-medium transition-colors duration: 200"
                >
                  {item.name}
                </Link>
              </motion.div>
            ))}
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-gray-700">
                  <UserCircleIcon className="h-6 w-6 text-primary mr-2" />
                  <span>{user.name}</span>
                  {user.role === 'super_admin' && (
                    <span className="ml-2 text-xs bg-primary text-white px-2 py-1 rounded-full">
                      Super Admin
                    </span>
                  )}
                  {user.role === 'admin' && (
                    <span className="ml-2 text-xs bg-secondary text-white px-2 py-1 rounded-full">
                      Admin
                    </span>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="text-gray-700 hover:text-primary font-medium"
                >
                  Logout
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/login"
                    className="btn-primary"
                  >
                    Login
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/register"
                    className="btn-secondary"
                  >
                    Register
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100"
            >
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigation.map((item) => (
                <motion.div
                  key={item.name}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={item.href}
                    className="block px-3 py-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              {user ? (
                <>
                  <div className="px-3 py-2 text-gray-700">
                    <div className="flex items-center">
                      <UserCircleIcon className="h-6 w-6 text-primary mr-2" />
                      <span>{user.name}</span>
                      {user.role === 'super_admin' && (
                        <span className="ml-2 text-xs bg-primary text-white px-2 py-1 rounded-full">
                          Super Admin
                        </span>
                      )}
                      {user.role === 'admin' && (
                        <span className="ml-2 text-xs bg-secondary text-white px-2 py-1 rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/login"
                      className="block px-3 py-2 rounded-md text-white bg-primary hover:bg-primary-dark"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/register"
                      className="block px-3 py-2 rounded-md text-white bg-secondary hover:bg-secondary-dark mt-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Register
                    </Link>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [farmerData, setFarmerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch farmer data from API
    // This will be implemented when the backend routes are ready
    setLoading(false);
  }, []);

  if (!user || user.role !== 0) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const dashboardSections = [
    {
      title: "Farm Overview",
      icon: ChartBarIcon,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Current Crops</h3>
            {/* Add crops list here */}
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Farm Details</h3>
            {/* Add farm details here */}
          </div>
        </div>
      ),
    },
    {
      title: "Recent Activity",
      icon: ClockIcon,
      content: (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="space-y-4">
            {/* Add activity list here */}
          </div>
        </div>
      ),
    },
    {
      title: "Financial Summary",
      icon: CurrencyDollarIcon,
      content: (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Income</h3>
              {/* Add income details */}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Expenses</h3>
              {/* Add expense details */}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Notifications",
      icon: BellIcon,
      content: (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="space-y-2">
            {/* Add notifications list */}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.name}</h1>
        <p className="text-gray-600">Here's an overview of your farm</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-8">
        {dashboardSections.map((section, index) => (
          <motion.section
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 p-6 rounded-xl"
          >
            <div className="flex items-center mb-4">
              <section.icon className="h-6 w-6 text-primary mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                {section.title}
              </h2>
            </div>
            {section.content}
          </motion.section>
        ))}
      </div>
    </div>
  );
};

export default FarmerDashboard;
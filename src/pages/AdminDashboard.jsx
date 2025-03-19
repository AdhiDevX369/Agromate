import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
  UsersIcon,
  ClipboardDocumentCheckIcon,
  BanknotesIcon,
  ChartBarIcon,
  UserPlusIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalFarmers: 0,
    pendingApprovals: 0,
    totalTransactions: 0,
    cropStats: {
      growing: 0,
      harvested: 0,
      sold: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [loadingApprovals, setLoadingApprovals] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/dashboard/admin', {
          headers: { 'x-auth-token': token }
        });
        
        setStats(response.data);

        // Fetch pending registrations
        const registrationsResponse = await axios.get(
          'http://localhost:5000/api/auth/pending-registrations',
          { headers: { 'x-auth-token': token } }
        );
        setPendingRegistrations(registrationsResponse.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
        setLoadingApprovals(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleRegistrationStatus = async (userId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/auth/approve-registration/${userId}`,
        { status },
        { headers: { 'x-auth-token': token } }
      );

      // Update local state
      setPendingRegistrations(prev => 
        prev.filter(registration => registration._id !== userId)
      );

      // Update stats
      setStats(prev => ({
        ...prev,
        pendingApprovals: prev.pendingApprovals - 1,
        totalFarmers: status === 'approved' ? prev.totalFarmers + 1 : prev.totalFarmers
      }));
    } catch (err) {
      console.error('Error updating registration status:', err);
    }
  };

  if (!user || (user.role !== 1 && user.role !== 2)) {
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

  // Quick stats cards
  const quickStats = [
    {
      title: 'Total Farmers',
      value: stats.totalFarmers.toString(),
      icon: UsersIcon,
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals.toString(),
      icon: ClipboardDocumentCheckIcon,
      change: stats.pendingApprovals > 0 ? `${stats.pendingApprovals} new` : 'None',
      changeType: stats.pendingApprovals > 0 ? 'increase' : 'neutral'
    },
    {
      title: 'Growing Crops',
      value: stats.cropStats?.growing?.toString() || '0',
      icon: ChartBarIcon,
      change: '+5',
      changeType: 'increase'
    },
    {
      title: 'Total Transactions',
      value: `₨ ${stats.totalTransactions || 0}`,
      icon: BanknotesIcon,
      change: '+18%',
      changeType: 'increase'
    }
  ];

  // Quick actions
  const quickActions = [
    {
      title: 'Add New Admin',
      icon: UserPlusIcon,
      onClick: () => {/* TODO: Implement add admin action */},
      color: 'bg-blue-500',
      showOnlyToSuperAdmin: true
    },
    {
      title: 'Update Market Prices',
      icon: PencilSquareIcon,
      onClick: () => {/* TODO: Implement market price update */},
      color: 'bg-green-500',
      showOnlyToSuperAdmin: false
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back, {user.name} ({user.role === 2 ? 'Super Admin' : 'Admin'})
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-primary/10`}>
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <span className={`text-sm font-medium ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-gray-600">{stat.title}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
      >
        {quickActions.map((action, index) => {
          if (action.showOnlyToSuperAdmin && user.role !== 2) return null;
          return (
            <motion.button
              key={action.title}
              onClick={action.onClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`${action.color} p-4 rounded-xl text-white flex items-center justify-between group hover:opacity-90 transition-opacity`}
            >
              <span className="text-lg font-semibold">{action.title}</span>
              <action.icon className="h-6 w-6 transform group-hover:scale-110 transition-transform" />
            </motion.button>
          );
        })}
      </motion.div>

      {/* Pending Registrations Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Pending Farmer Registrations
          </h2>
        </div>

        <div className="overflow-x-auto">
          {loadingApprovals ? (
            <div className="p-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
              />
            </div>
          ) : pendingRegistrations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No pending registrations
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Farmer Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Farm Information
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingRegistrations.map((registration) => (
                  <tr key={registration._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {registration.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {registration.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {registration.farmerDetails?.farmName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {registration.farmerDetails?.farmSize} acres
                      </div>
                      <div className="text-sm text-gray-500">
                        Crops: {registration.farmerDetails?.cropsGrown?.join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {registration.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {registration.farmerDetails?.contactNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(registration.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="space-x-3">
                        <button
                          onClick={() => handleRegistrationStatus(registration._id, 'approved')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRegistrationStatus(registration._id, 'rejected')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.section>
    </div>
  );
};

export default AdminDashboard;
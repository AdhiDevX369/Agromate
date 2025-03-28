import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BellIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [farmerData, setFarmerData] = useState(null);
  const [cropPrices, setCropPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'x-auth-token': token };

        // Fetch farmer data
        const farmerResponse = await axios.get(
          'http://localhost:5000/api/dashboard/farmer',
          { headers }
        );
        setFarmerData(farmerResponse.data);

        // Fetch prices for farmer's crops
        const prices = [];
        for (const crop of farmerResponse.data.farmer.cropsGrown) {
          try {
            const priceResponse = await axios.get(
              `http://localhost:5000/api/admin/crops`,
              { headers }
            );
            const cropData = priceResponse.data.find(
              c => c.cropType.toLowerCase() === crop.toLowerCase()
            );
            if (cropData) {
              prices.push(cropData);
            }
          } catch (err) {
            console.error(`Error fetching price for ${crop}:`, err);
          }
        }
        setCropPrices(prices);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const getTrendIcon = (priceHistory) => {
    if (!priceHistory || priceHistory.length < 2) return null;
    
    const latestPrice = priceHistory[priceHistory.length - 1].price;
    const previousPrice = priceHistory[priceHistory.length - 2].price;
    const change = ((latestPrice - previousPrice) / previousPrice) * 100;
    
    if (change > 0) {
      return {
        icon: ArrowTrendingUpIcon,
        color: 'text-red-500',
        change: `+${change.toFixed(1)}%`
      };
    } else if (change < 0) {
      return {
        icon: ArrowTrendingDownIcon,
        color: 'text-green-500',
        change: `${change.toFixed(1)}%`
      };
    }
    return null;
  };

  const dashboardSections = [
    {
      title: "Your Crops & Market Prices",
      icon: ChartBarIcon,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cropPrices.map((crop) => {
            const trend = getTrendIcon(crop.priceHistory);
            return (
              <motion.div
                key={crop._id}
                whileHover={{ scale: 1.02 }}
                className="bg-white p-6 rounded-lg shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{crop.cropType}</h3>
                    <p className="text-gray-500 text-sm">{crop.sinhalaName}</p>
                  </div>
                  {trend && (
                    <div className={`flex items-center ${trend.color}`}>
                      <trend.icon className="h-5 w-5 mr-1" />
                      <span className="text-sm">{trend.change}</span>
                    </div>
                  )}
                </div>
                <p className="text-2xl font-bold text-primary">
                  Rs. {crop.price.toFixed(2)}
                  <span className="text-sm text-gray-500 ml-1">/{crop.unit}</span>
                </p>
              </motion.div>
            );
          })}
        </div>
      ),
    },
    {
      title: "Recent Activity",
      icon: ClockIcon,
      content: (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="space-y-4">
            {farmerData?.recentTransactions?.map((transaction, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
                <span className={`font-medium ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'} Rs. {transaction.amount}
                </span>
              </div>
            ))}
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
            {cropPrices.map((crop) => {
              const trend = getTrendIcon(crop.priceHistory);
              if (trend && Math.abs(parseFloat(trend.change)) > 5) {
                return (
                  <div key={crop._id} className="flex items-center space-x-2">
                    <div className={`${
                      trend.color.includes('red') ? 'bg-red-100' : 'bg-green-100'
                    } p-2 rounded-full`}>
                      <trend.icon className={`h-5 w-5 ${trend.color}`} />
                    </div>
                    <div>
                      <p className="font-medium">Price Alert: {crop.cropType}</p>
                      <p className="text-sm text-gray-500">
                        Price has changed by {trend.change}
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            })}
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
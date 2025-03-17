import { useState } from 'react';
import { motion } from 'framer-motion';
import { marketPrices } from '../constants/marketData';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { ChevronUpIcon, ChevronDownIcon, MinusIcon } from '@heroicons/react/24/solid';

const categories = [
  { id: 'vegetables', name: 'Vegetables', sinhala: 'එළවළු' },
  { id: 'fruits', name: 'Fruits', sinhala: 'පලතුරු' },
  { id: 'rice', name: 'Rice', sinhala: 'සහල්' },
  { id: 'spices', name: 'Spices', sinhala: 'කුළුබඩු' }
];

export default function Market() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('vegetables');
  const [searchTerm, setSearchTerm] = useState('');

  if (!user) {
    return <Navigate to="/login" />;
  }

  const filteredProducts = marketPrices[selectedCategory].filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sinhala.includes(searchTerm)
  );

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <ChevronUpIcon className="h-5 w-5 text-red-500" />;
      case 'down':
        return <ChevronDownIcon className="h-5 w-5 text-green-500" />;
      default:
        return <MinusIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Market Prices
        </h1>
        <p className="text-lg text-gray-600">
          Current agricultural market prices in Sri Lanka
        </p>
      </motion.div>

      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-200
                ${selectedCategory === category.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <span>{category.name}</span>
              <span className="ml-2 text-sm">({category.sinhala})</span>
            </motion.button>
          ))}
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-md mx-auto"
        >
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </motion.div>
      </div>

      {/* Price List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">සිංහල</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Price (LKR)</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Unit</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Trend</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredProducts.map((product) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{product.sinhala}</td>
                  <td className="px-6 py-4 text-right text-sm text-gray-900">{product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-500">{product.unit}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {getTrendIcon(product.trend)}
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-right text-sm font-medium 
                    ${product.trend === 'up' ? 'text-red-500' : ''}
                    ${product.trend === 'down' ? 'text-green-500' : ''}
                    ${product.trend === 'stable' ? 'text-gray-500' : ''}`}
                  >
                    {product.change > 0 ? '+' : ''}{product.change}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
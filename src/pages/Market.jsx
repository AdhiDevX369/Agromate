import { useState } from 'react';
import { motion } from 'framer-motion';
import { marketPrices } from '../constants/marketData';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { ChevronUpIcon, ChevronDownIcon, MinusIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';

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
  const [editingPrice, setEditingPrice] = useState(null);
  const [newPrice, setNewPrice] = useState('');

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

  const handlePriceEdit = async (productId) => {
    // TODO: Implement price update API call
    setEditingPrice(null);
    setNewPrice('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {user.role === 0 ? 'Market Prices' : 'Market Price Management'}
        </h1>
        <p className="text-lg text-gray-600">
          {user.role === 0 
            ? 'Current market prices for agricultural products'
            : 'Update and manage market prices for agricultural products'}
        </p>
      </motion.div>

      {/* Search and Category Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
        <div className="flex space-x-4">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                selectedCategory === category.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </motion.button>
          ))}
        </div>
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                සිංහල නම
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price (Rs/kg)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trend
              </th>
              {(user.role === 1 || user.role === 2) && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <motion.tr
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                layout
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {product.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.sinhala}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingPrice === product.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        className="w-24 px-2 py-1 rounded border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="New price"
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handlePriceEdit(product.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckIcon className="h-5 w-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setEditingPrice(null);
                          setNewPrice('');
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </motion.button>
                    </div>
                  ) : (
                    <span>Rs. {product.price.toFixed(2)}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getTrendIcon(product.trend)}
                    <span className="ml-2 text-sm text-gray-500">
                      {product.trend === 'up' ? '+' : product.trend === 'down' ? '-' : ''}
                      {product.change}%
                    </span>
                  </div>
                </td>
                {(user.role === 1 || user.role === 2) && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingPrice !== product.id && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setEditingPrice(product.id);
                          setNewPrice(product.price.toString());
                        }}
                        className="text-primary hover:text-primary-dark"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </motion.button>
                    )}
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
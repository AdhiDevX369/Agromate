import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { ChevronUpIcon, ChevronDownIcon, MinusIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import axios from 'axios';

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
  const [marketPrices, setMarketPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewPriceForm, setShowNewPriceForm] = useState(false);
  const [newPriceData, setNewPriceData] = useState({
    cropType: '',
    sinhalaName: '',
    category: 'vegetables',
    price: '',
    unit: 'kg'
  });

  useEffect(() => {
    fetchMarketPrices();
  }, [selectedCategory]);

  const fetchMarketPrices = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = user?.role === 'farmer' 
        ? 'http://localhost:5000/api/dashboard/market-prices'
        : 'http://localhost:5000/api/admin/market-prices';
      
      const response = await axios.get(
        `${baseUrl}/category/${selectedCategory}`,
        { 
          headers: { 
            'Authorization': `Bearer ${token}` 
          } 
        }
      );
      setMarketPrices(response.data.prices || []);
    } catch (err) {
      setError('Failed to fetch market prices');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceEdit = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/admin/market-prices/${id}`,
        { price: parseFloat(newPrice) },
        { 
          headers: { 
            'Authorization': `Bearer ${token}` 
          } 
        }
      );
      setEditingPrice(null);
      setNewPrice('');
      fetchMarketPrices();
    } catch (err) {
      setError('Failed to update price');
      console.error(err);
    }
  };

  const handleNewPrice = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/admin/market-prices',
        newPriceData,
        { 
          headers: { 
            'Authorization': `Bearer ${token}` 
          } 
        }
      );
      setShowNewPriceForm(false);
      setNewPriceData({
        cropType: '',
        sinhalaName: '',
        category: 'vegetables',
        price: '',
        unit: 'kg'
      });
      fetchMarketPrices();
    } catch (err) {
      setError('Failed to add new price');
      console.error(err);
    }
  };

  const getTrendIcon = (priceHistory) => {
    if (!priceHistory || priceHistory.length < 2) return <MinusIcon className="h-5 w-5 text-gray-500" />;
    
    const latestPrice = priceHistory[priceHistory.length - 1].price;
    const previousPrice = priceHistory[priceHistory.length - 2].price;
    const change = ((latestPrice - previousPrice) / previousPrice) * 100;
    
    if (change > 0) {
      return <ChevronUpIcon className="h-5 w-5 text-red-500" />;
    } else if (change < 0) {
      return <ChevronDownIcon className="h-5 w-5 text-green-500" />;
    }
    return <MinusIcon className="h-5 w-5 text-gray-500" />;
  };

  const getPriceChange = (priceHistory) => {
    if (!priceHistory || priceHistory.length < 2) return { change: 0, trend: 'stable' };
    
    const latestPrice = priceHistory[priceHistory.length - 1].price;
    const previousPrice = priceHistory[priceHistory.length - 2].price;
    const change = ((latestPrice - previousPrice) / previousPrice) * 100;
    
    return {
      change: Math.abs(change).toFixed(1),
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    };
  };

  const filteredProducts = marketPrices.filter(product =>
    product.cropType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sinhalaName.includes(searchTerm)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {user?.role === 'farmer' ? 'Market Prices' : 'Market Price Management'}
        </h1>
        <p className="text-lg text-gray-600">
          {user?.role === 'farmer' 
            ? 'Current market prices for agricultural products'
            : 'Update and manage market prices for agricultural products'}
        </p>
      </motion.div>

      {/* Add New Price Button for Admins */}
      {(user?.role === 'admin' || user?.role === 'super_admin') && (
        <div className="mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowNewPriceForm(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Add New Price
          </motion.button>
        </div>
      )}

      {/* New Price Form Modal */}
      {showNewPriceForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-semibold mb-4">Add New Market Price</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Crop Type</label>
                <input
                  type="text"
                  value={newPriceData.cropType}
                  onChange={(e) => setNewPriceData({...newPriceData, cropType: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sinhala Name</label>
                <input
                  type="text"
                  value={newPriceData.sinhalaName}
                  onChange={(e) => setNewPriceData({...newPriceData, sinhalaName: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={newPriceData.category}
                  onChange={(e) => setNewPriceData({...newPriceData, category: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price (Rs)</label>
                <input
                  type="number"
                  value={newPriceData.price}
                  onChange={(e) => setNewPriceData({...newPriceData, price: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit</label>
                <select
                  value={newPriceData.unit}
                  onChange={(e) => setNewPriceData({...newPriceData, unit: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="g">Gram (g)</option>
                  <option value="unit">Per Unit</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex space-x-3">
              <button
                onClick={handleNewPrice}
                className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Add Price
              </button>
              <button
                onClick={() => setShowNewPriceForm(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

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
              {(user?.role === 'admin' || user?.role === 'super_admin') && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                  />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-red-600">
                  {error}
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <motion.tr
                  key={product._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  layout
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.cropType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.sinhalaName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {editingPrice === product._id ? (
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
                          onClick={() => handlePriceEdit(product._id)}
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
                      `Rs. ${product.price.toFixed(2)}`
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getTrendIcon(product.priceHistory)}
                      <span className="ml-2 text-sm text-gray-500">
                        {getPriceChange(product.priceHistory).change}%
                      </span>
                    </div>
                  </td>
                  {(user?.role === 'admin' || user?.role === 'super_admin') && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingPrice !== product._id && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setEditingPrice(product._id);
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
              ))
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserPlusIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cropCategories, setCropCategories] = useState([]);
  const [selectedCrops, setSelectedCrops] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    location: '',
    farmName: '',
    farmSize: '',
    contactNumber: '',
    address: '',
    cropsGrown: []
  });

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/public/crops');
        const crops = response.data;
        // Group crops by category
        const categories = {};
        crops.forEach(crop => {
          if (!categories[crop.category]) {
            categories[crop.category] = [];
          }
          categories[crop.category].push({
            id: crop._id,
            name: crop.cropType,
            sinhalaName: crop.sinhalaName
          });
        });
        setCropCategories(categories);
      } catch (err) {
        console.error('Error fetching crops:', err);
      }
    };
    fetchCrops();
  }, []);

  const handleCropChange = (cropId) => {
    setSelectedCrops(prev => {
      const newSelected = prev.includes(cropId) 
        ? prev.filter(id => id !== cropId)
        : [...prev, cropId];
      
      // Update formData.cropsGrown based on selected crop IDs
      const selectedCropNames = [];
      Object.values(cropCategories).forEach(crops => {
        crops.forEach(crop => {
          if (newSelected.includes(crop.id)) {
            selectedCropNames.push(crop.name);
          }
        });
      });
      
      setFormData(prev => ({
        ...prev,
        cropsGrown: selectedCropNames
      }));
      
      return newSelected;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        ...formData,
        cropsGrown: formData.cropsGrown.split(',').map(crop => crop.trim()),
        farmSize: parseFloat(formData.farmSize)
      });

      if (response.data) {
        navigate('/registration-success');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"
        >
          <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
            <h2 className="text-center text-3xl font-bold text-gray-900">
              Farmer Registration
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Join our farming community and get access to market prices and weather updates
            </p>
          </div>

          <motion.form 
            className="space-y-6"
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
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
                  <input
                    type="password"
                    name="password"
                    id="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    id="contactNumber"
                    required
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    District/Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Farm Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Farm Information</h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="farmName" className="block text-sm font-medium text-gray-700">
                    Farm Name
                  </label>
                  <input
                    type="text"
                    name="farmName"
                    id="farmName"
                    required
                    value={formData.farmName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="farmSize" className="block text-sm font-medium text-gray-700">
                    Farm Size (Acres)
                  </label>
                  <input
                    type="number"
                    name="farmSize"
                    id="farmSize"
                    required
                    step="0.1"
                    value={formData.farmSize}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Farm Address
                  </label>
                  <textarea
                    name="address"
                    id="address"
                    required
                    rows={3}
                    value={formData.address}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="cropsGrown" className="block text-sm font-medium text-gray-700">
                    Crops Grown (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="cropsGrown"
                    id="cropsGrown"
                    required
                    placeholder="Rice, Vegetables, Fruits"
                    value={formData.cropsGrown}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Select Crops */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Select Crops</h3>
              {Object.entries(cropCategories).map(([category, crops]) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 capitalize">{category}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {crops.map((crop) => (
                      <motion.div
                        key={crop.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                            checked={selectedCrops.includes(crop.id)}
                            onChange={() => handleCropChange(crop.id)}
                          />
                          <span className="ml-2">
                            <span className="block text-sm font-medium text-gray-900">{crop.name}</span>
                            <span className="block text-xs text-gray-500">{crop.sinhalaName}</span>
                          </span>
                        </label>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-600 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
            >
              <UserPlusIcon className="h-5 w-5 mr-2" />
              {loading ? 'Registering...' : 'Register'}
            </motion.button>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}
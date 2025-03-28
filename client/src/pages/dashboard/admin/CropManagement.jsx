import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function CropManagement() {
  const { user } = useAuth();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Grains');
  const [editingCrop, setEditingCrop] = useState(null);
  const [showVarietyModal, setShowVarietyModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newCrop, setNewCrop] = useState({
    name: '',
    sinhalaName: '',
    category: 'Grains',
    description: '',
    varieties: []
  });
  const [varietyForm, setVarietyForm] = useState({
    name: '',
    description: '',
    typicalYield: {
      value: '',
      unit: 'kg/acre'
    },
    growingSeasons: '',
    avgGrowingPeriod: ''
  });

  const resetVarietyForm = () => {
    setVarietyForm({
      name: '',
      description: '',
      typicalYield: {
        value: '',
        unit: 'kg/acre'
      },
      growingSeasons: '',
      avgGrowingPeriod: ''
    });
  };

  const handleVarietyFormChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('typicalYield.')) {
      const field = name.split('.')[1];
      setVarietyForm(prev => ({
        ...prev,
        typicalYield: {
          ...prev.typicalYield,
          [field]: value
        }
      }));
    } else {
      setVarietyForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmitVariety = (e) => {
    e.preventDefault();
    if (!varietyForm.name || !varietyForm.typicalYield.value || !varietyForm.growingSeasons || !varietyForm.avgGrowingPeriod) {
      setError('Please fill in all required fields for the variety');
      return;
    }

    const newVariety = {
      name: varietyForm.name,
      description: varietyForm.description,
      typicalYield: {
        value: parseFloat(varietyForm.typicalYield.value),
        unit: varietyForm.typicalYield.unit
      },
      growingSeasons: varietyForm.growingSeasons.split(',').map(s => s.trim()),
      avgGrowingPeriod: parseInt(varietyForm.avgGrowingPeriod)
    };

    handleSaveVariety(newVariety);
    resetVarietyForm();
  };

  const categories = [
    { id: 'Grains', name: 'Grains' },
    { id: 'Fruits', name: 'Fruits' },
    { id: 'Cash Crops', name: 'Cash Crops' },
    { id: 'Spices', name: 'Spices' }
  ];

  useEffect(() => {
    fetchCrops();
  }, [selectedCategory]);

  // Add access check for admin/super_admin
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return <Navigate to="/login" />;
  }

  const fetchCrops = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/admin/crop-catalog/category/${selectedCategory}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setCrops(response.data.data.crops || []);
    } catch (err) {
      setError('Failed to fetch crop catalog');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCrop = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/admin/crop-catalog',
        {
          ...newCrop,
          category: selectedCategory
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setNewCrop({
        name: '',
        sinhalaName: '',
        category: selectedCategory,
        description: '',
        varieties: []
      });
      fetchCrops();
    } catch (err) {
      setError('Failed to add crop to catalog');
      console.error(err);
    }
  };

  const handleUpdateCrop = async (cropId, updatedCrop) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/admin/crop-catalog/${cropId}`,
        updatedCrop,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setEditingCrop(null);
      fetchCrops();
    } catch (err) {
      setError('Failed to update crop');
      console.error(err);
    }
  };

  const handleDeleteCrop = async (cropId) => {
    if (!window.confirm('Are you sure you want to delete this crop from the catalog?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/admin/crop-catalog/${cropId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      fetchCrops();
    } catch (err) {
      setError('Failed to delete crop from catalog');
      console.error(err);
    }
  };

  const handleAddVariety = () => {
    setShowVarietyModal(true);
  };

  const handleSaveVariety = (variety) => {
    if (editingCrop) {
      const updatedCrop = {
        ...editingCrop,
        varieties: [...editingCrop.varieties, variety]
      };
      setEditingCrop(updatedCrop);
      handleUpdateCrop(editingCrop._id, updatedCrop);
    } else {
      setNewCrop({
        ...newCrop,
        varieties: [...newCrop.varieties, variety]
      });
    }
    setShowVarietyModal(false);
  };

  const handleRemoveVariety = (cropId, varietyIndex) => {
    if (editingCrop && editingCrop._id === cropId) {
      const updatedCrop = {
        ...editingCrop,
        varieties: editingCrop.varieties.filter((_, index) => index !== varietyIndex)
      };
      setEditingCrop(updatedCrop);
      handleUpdateCrop(cropId, updatedCrop);
    }
  };

  const handleEditCrop = (crop) => {
    setEditingCrop(crop);
    setShowEditModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Crop Catalog Management</h2>
        <p className="mt-2 text-gray-600">Manage available crop types and their varieties</p>
      </div>

      {/* Category Tabs */}
      <div className="mb-6">
        <div className="sm:hidden">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <nav className="flex space-x-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Add New Crop Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow-sm mb-8"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Crop Type</h3>
        <form onSubmit={handleAddCrop} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Crop Name (English)
            </label>
            <input
              type="text"
              id="name"
              required
              value={newCrop.name}
              onChange={(e) => setNewCrop({ ...newCrop, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="sinhalaName" className="block text-sm font-medium text-gray-700">
              Crop Name (Sinhala)
            </label>
            <input
              type="text"
              id="sinhalaName"
              required
              value={newCrop.sinhalaName}
              onChange={(e) => setNewCrop({ ...newCrop, sinhalaName: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={newCrop.description}
              onChange={(e) => setNewCrop({ ...newCrop, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              rows="3"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Varieties
              </label>
              <button
                type="button"
                onClick={handleAddVariety}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Variety
              </button>
            </div>
            <div className="bg-gray-50 rounded-md p-4">
              {newCrop.varieties.length === 0 ? (
                <p className="text-gray-500 text-sm">No varieties added yet</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {newCrop.varieties.map((variety, index) => (
                    <li key={index} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{variety.name}</p>
                        <p className="text-sm text-gray-500">
                          {variety.typicalYield.value} {variety.typicalYield.unit} • 
                          {variety.growingSeasons.join(', ')}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewCrop({
                          ...newCrop,
                          varieties: newCrop.varieties.filter((_, i) => i !== index)
                        })}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark flex items-center justify-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add to Catalog
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* Crops Catalog List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
          />
        </div>
      ) : error ? (
        <div className="text-red-600 text-center py-8">{error}</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Crop Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sinhala Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Varieties
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Added By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {crops.map((crop) => (
                <motion.tr
                  key={crop._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {crop.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {crop.sinhalaName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="max-w-xs">
                      {crop.varieties.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {crop.varieties.map((variety, index) => (
                            <li key={index} className="truncate">
                              {variety.name}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        'No varieties'
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {crop.createdBy?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(crop.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEditCrop(crop)}
                        className="text-primary hover:text-primary-dark"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </motion.button>
                      {user.role === 'super_admin' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteCrop(crop._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </motion.button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Variety Modal */}
      {showVarietyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Variety</h3>
            {error && (
              <div className="mb-4 p-2 bg-red-50 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmitVariety}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 required:true">
                    Variety Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={varietyForm.name}
                    onChange={handleVarietyFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows="2"
                    value={varietyForm.description}
                    onChange={handleVarietyFormChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="typicalYield.value" className="block text-sm font-medium text-gray-700">
                      Typical Yield <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="typicalYield.value"
                      id="typicalYield.value"
                      value={varietyForm.typicalYield.value}
                      onChange={handleVarietyFormChange}
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="typicalYield.unit" className="block text-sm font-medium text-gray-700">
                      Unit
                    </label>
                    <select
                      name="typicalYield.unit"
                      id="typicalYield.unit"
                      value={varietyForm.typicalYield.unit}
                      onChange={handleVarietyFormChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    >
                      <option value="kg/acre">kg/acre</option>
                      <option value="tons/acre">tons/acre</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="growingSeasons" className="block text-sm font-medium text-gray-700">
                    Growing Seasons <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="growingSeasons"
                    id="growingSeasons"
                    value={varietyForm.growingSeasons}
                    onChange={handleVarietyFormChange}
                    placeholder="e.g. Yala, Maha"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                  <p className="mt-1 text-sm text-gray-500">Comma-separated list of seasons</p>
                </div>

                <div>
                  <label htmlFor="avgGrowingPeriod" className="block text-sm font-medium text-gray-700">
                    Average Growing Period (days) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="avgGrowingPeriod"
                    id="avgGrowingPeriod"
                    value={varietyForm.avgGrowingPeriod}
                    onChange={handleVarietyFormChange}
                    min="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowVarietyModal(false);
                    setError('');
                    resetVarietyForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Add Variety
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Crop Modal */}
      {showEditModal && editingCrop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Crop: {editingCrop.name}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Crop Name (English)
                  </label>
                  <input
                    type="text"
                    value={editingCrop.name}
                    onChange={(e) => setEditingCrop({ ...editingCrop, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Crop Name (Sinhala)
                  </label>
                  <input
                    type="text"
                    value={editingCrop.sinhalaName}
                    onChange={(e) => setEditingCrop({ ...editingCrop, sinhalaName: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={editingCrop.description}
                  onChange={(e) => setEditingCrop({ ...editingCrop, description: e.target.value })}
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Varieties
                  </label>
                  <button
                    type="button"
                    onClick={handleAddVariety}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Variety
                  </button>
                </div>

                <div className="bg-gray-50 rounded-md p-4 space-y-4">
                  {editingCrop.varieties.length === 0 ? (
                    <p className="text-gray-500 text-sm">No varieties added yet</p>
                  ) : (
                    <ul className="divide-y divide-gray-200 space-y-3">
                      {editingCrop.varieties.map((variety, index) => (
                        <li key={index} className="py-3 flex justify-between items-start">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-900">{variety.name}</p>
                            <p className="text-sm text-gray-500">
                              Yield: {variety.typicalYield.value} {variety.typicalYield.unit}
                            </p>
                            <p className="text-sm text-gray-500">
                              Growing Seasons: {variety.growingSeasons.join(', ')}
                            </p>
                            <p className="text-sm text-gray-500">
                              Growing Period: {variety.avgGrowingPeriod} days
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariety(editingCrop._id, index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCrop(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateCrop(editingCrop._id, editingCrop);
                    setShowEditModal(false);
                    setEditingCrop(null);
                  }}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
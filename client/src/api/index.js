import axios from 'axios';

// Create axios instance with base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API service functions
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me')
};

export const farmerAPI = {
  getDashboard: () => api.get('/dashboard/farmer'),
  updateProfile: (data) => api.put('/dashboard/farmer/profile', data),
  getCrops: () => api.get('/dashboard/farmer/crops'),
  addCrop: (cropData) => api.post('/dashboard/farmer/crops', cropData),
  updateCrop: (id, cropData) => api.put(`/dashboard/farmer/crops/${id}`, cropData)
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  addUser: (userData) => api.post('/admin/users', userData),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  manageCrops: () => api.get('/admin/crops'),
  addCrop: (cropData) => api.post('/admin/crops', cropData),
  updateCrop: (id, cropData) => api.put(`/admin/crops/${id}`, cropData),
  deleteCrop: (id) => api.delete(`/admin/crops/${id}`)
};

export default {
  auth: authAPI,
  farmer: farmerAPI,
  admin: adminAPI
};
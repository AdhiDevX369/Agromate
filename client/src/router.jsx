import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import RegistrationSuccess from './pages/RegistrationSuccess';
import Home from './pages/Home';
import Contact from './pages/Contact';
import Market from './pages/Market';
import Weather from './pages/Weather';
import FarmerDashboard from './pages/FarmerDashboard';
import CropManagement from './pages/dashboard/admin/CropManagement';
import ProtectedRoute from './components/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/contact',
        element: <Contact />,
      },
      {
        path: '/market',
        element: <Market />,
      },
      {
        path: '/weather',
        element: <Weather />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/registration-success',
        element: <RegistrationSuccess />,
      },
      {
        path: '/dashboard/farmer',
        element: (
          <ProtectedRoute allowedRoles={['farmer']}>
            <FarmerDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/dashboard/admin',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: '',
            element: <AdminDashboard />,
          },
          {
            path: 'users',
            element: <div>Users Management</div>, // TODO: Create Users component
          },
          {
            path: 'crops',
            element: <CropManagement />,
          },
          {
            path: 'market-prices',
            element: <div>Market Prices</div>, // TODO: Create MarketPrices component
          },
          {
            path: 'crop-catalog',
            element: <div>Crop Catalog</div>, // TODO: Create CropCatalog component
          },
          {
            path: 'analytics',
            element: <div>Analytics</div>, // TODO: Create Analytics component
          },
        ],
      },
    ],
  },
]);

export default router;
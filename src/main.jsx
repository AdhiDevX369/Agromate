import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import Weather from './pages/Weather'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import RegistrationSuccess from './pages/RegistrationSuccess'
import Market from './pages/Market'
import FarmerDashboard from './pages/FarmerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import './index.css'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: "weather",
        element: <Weather />
      },
      {
        path: "contact",
        element: <Contact />
      },
      {
        path: "login",
        element: <Login />
      },
      {
        path: "register",
        element: <Register />
      },
      {
        path: "registration-success",
        element: <RegistrationSuccess />
      },
      {
        path: "market",
        element: (
          <ProtectedRoute>
            <Market />
          </ProtectedRoute>
        )
      },
      {
        path: "farmer-dashboard",
        element: (
          <ProtectedRoute allowedRoles={[0]}>
            <FarmerDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: "admin-dashboard",
        element: (
          <ProtectedRoute allowedRoles={[1, 2]}>
            <AdminDashboard />
          </ProtectedRoute>
        )
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
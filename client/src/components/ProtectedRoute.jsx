import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If role restriction exists and user's role is not allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // For super_admin, allow access to all dashboards
    if (user.role === 'super_admin') {
      return children;
    }
    
    // Redirect to appropriate dashboard based on role
    if (user.role === 'farmer') {
      return <Navigate to="/dashboard/farmer" />;
    } else if (user.role === 'admin' || user.role === 'super_admin') {
      return <Navigate to="/dashboard/admin" />;
    }
    return <Navigate to="/" />;
  }

  return children;
}
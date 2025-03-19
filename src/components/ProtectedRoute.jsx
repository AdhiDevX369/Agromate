import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If role restriction exists and user's role is not allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 0) {
      return <Navigate to="/farmer-dashboard" />;
    } else if (user.role === 1 || user.role === 2) {
      return <Navigate to="/admin-dashboard" />;
    }
    return <Navigate to="/" />;
  }

  return children;
}
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const { user } = useAuth();

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
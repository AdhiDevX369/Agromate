import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  Square3Stack3DIcon,
  ChartPieIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard/admin', icon: HomeIcon },
  { name: 'User Management', href: '/dashboard/admin/users', icon: UsersIcon },
  { name: 'Crop Management', href: '/dashboard/admin/crops', icon: ClipboardDocumentListIcon },
  { name: 'Market Prices', href: '/dashboard/admin/market-prices', icon: CurrencyDollarIcon },
  { name: 'Crop Catalog', href: '/dashboard/admin/crop-catalog', icon: Square3Stack3DIcon },
  { name: 'Analytics', href: '/dashboard/admin/analytics', icon: ChartPieIcon },
];

const AdminSidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.div 
      className={`flex flex-col h-full ${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 relative transition-all duration-300`}
      layout
    >
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} h-16 px-4`}>
        <div className="flex items-center">
          <img src="/agromate.svg" alt="AgroMate Logo" className="h-8 w-auto" />
          {!isCollapsed && <span className="ml-2 text-lg font-semibold text-primary">AgroMate</span>}
        </div>
      </div>
      
      {/* Toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-white rounded-full p-1 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200"
      >
        {isCollapsed ? (
          <ChevronRightIcon className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronLeftIcon className="h-4 w-4 text-gray-600" />
        )}
      </button>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-primary-light hover:text-white'
              }`}
              title={isCollapsed ? item.name : ''}
            >
              <item.icon
                className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 flex-shrink-0 ${
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                }`}
                aria-hidden="true"
              />
              {!isCollapsed && item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className={`flex-shrink-0 flex border-t border-gray-200 p-4 ${isCollapsed ? 'justify-center' : ''}`}>
        <div className={`flex items-center ${isCollapsed ? 'flex-col' : ''}`}>
          <div className={`${isCollapsed ? 'text-center' : ''}`}>
            <p className="text-sm font-medium text-gray-700">{isCollapsed ? 'Admin' : 'Admin Panel'}</p>
            {!isCollapsed && <p className="text-xs text-gray-500">v1.0.0</p>}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminSidebar;
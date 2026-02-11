/**
 * Premium Sidebar Navigation
 * Full sidebar with text labels like Sopanel
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: '📊', label: 'Overview', section: 'DASHBOARD' },
    { path: '/analytics', icon: '📈', label: 'Analytics', section: 'DASHBOARD' },
    { path: '/optimization', icon: '⚖️', label: 'Energy Balance', section: 'DASHBOARD' },
    { path: '/reports', icon: '📄', label: 'Report', section: 'DASHBOARD' },
    { path: '/calculator', icon: '⚙️', label: 'Service Message', section: 'DASHBOARD' }
  ];

  const settingsItems = [
    { path: '/settings', icon: '🏠', label: 'My Site' },
    { path: '/settings', icon: '👤', label: 'My Account' },
    { path: '/settings', icon: '❓', label: 'Support' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">☀️</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">HelioTrack</span>
        </div>
      </div>

      {/* Dashboard Section */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dashboard</span>
        </div>
        <nav className="px-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Settings Section */}
        <div className="px-4 mb-2 mt-6">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Settings</span>
        </div>
        <nav className="px-2">
          {settingsItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-gray-600 hover:bg-gray-50 transition-all duration-200"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <span className="text-xl">🚪</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

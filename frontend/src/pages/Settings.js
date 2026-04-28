/**
 * Settings Page - System Configuration
 * Configure city, solar capacity, battery, and efficiency
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const INDIAN_CITIES = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", 
  "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", 
  "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara", "Ghaziabad", 
  "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli", 
  "Vasai-Virar", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", 
  "Navi Mumbai", "Prayagraj", "Howrah", "Ranchi", "Gwalior", "Jabalpur", 
  "Coimbatore", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Chandigarh", 
  "Guntur", "Guwahati", "Solapur", "Hubli-Dharwad", "Mysore", "Tiruppur", 
  "Gurgaon", "Noida", "Bhubaneswar", "Salem", "Warangal", "Thiruvananthapuram", 
  "Bhiwandi", "Saharanpur", "Amravati", "Jamshedpur", "Bhilai", "Cuttack", 
  "Kochi", "Udaipur", "Dehradun", "Bidar", "Amaravati", "Ajmer", "Akola", "Gulbarga", 
  "Jamnagar", "Ujjain", "Loni", "Siliguri", "Jhansi", "Ulhasnagar", "Jammu", 
  "Sangli", "Mangalore", "Erode", "Belgaum", "Kurnool", "Ambattur", "Gaya", 
  "Tirunelveli", "Malappuram", "Davanagere", "Kozhikode", "Bokaro", "Bellary", 
  "Patiala", "Bhagalpur", "Jalna", "Muzaffarpur", "Latur", "Dhule", "Rohtak", 
  "Sagar", "Korba", "Bhilwara", "Berhampur", "Muzaffarnagar", "Ahmednagar", 
  "Mathura", "Kollam", "Avadi", "Kadapa", "Kamarhati", "Sambalpur", "Bilaspur", 
  "Shahjahanpur", "Satara", "Bijapur", "Rampur", "Shimoga", "Chandrapur", 
  "Junagadh", "Thrissur", "Alwar", "Bardhaman", "Kakinada", "Nizamabad", "Parbhani", 
  "Tumkur", "Khammam", "Bihar Sharif", "Panvel", "Darbhanga", "Aizawl", "Dewas", 
  "Ichalkaranji", "Karnal", "Bathinda", "Eluru", "Barasat", "Purnia", "Satna", 
  "Mau", "Sonipat", "Farrukhabad", "Durg", "Imphal", "Ratlam", "Hapur", "Arrah", 
  "Anantapur", "Karimnagar", "Etawah", "Ambernath", "Bharatpur", "Begusarai", 
  "New Delhi", "Gandhidham", "Baranagar", "Puducherry", "Sikar", "Thoothukudi", 
  "Rewa", "Mirzapur", "Raichur", "Pali", "Ramagundam", "Silchar", "Haridwar", 
  "Vijayanagaram", "Tenali", "Nagercoil", "Sri Ganganagar", "Thanjavur", 
  "Bulandshahr", "Uluberia", "Katni", "Singrauli", "Nadiad", "Yamunanagar", 
  "Bidhannagar", "Pallavaram", "Munger", "Panchkula", "Burhanpur", "Kharagpur", 
  "Dindigul", "Gandhinagar", "Hospet", "Malda", "Ongole", "Deoghar", "Chapra", 
  "Haldia", "Khandwa", "Nandyal", "Morena", "Amroha", "Anand", "Bhind"
].sort();

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    autoOptimize: true,
    darkMode: true,
    updateInterval: 3
  });

  const [systemConfig, setSystemConfig] = useState({
    city: 'Mumbai',
    solar_capacity: 10,
    battery_size: 10,
    panel_efficiency: 0.85,
    consumption_base: 5,
    simulation_enabled: false
  });


  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/config`);
      if (response.data.success) {
        setSystemConfig(response.data.config);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConfigChange = (key, value) => {
    setSystemConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveConfig = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/config`, systemConfig);
      
      if (response.data.success) {
        setMessage('✅ Configuration saved successfully! Dashboard will update automatically.');
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      setMessage('❌ Error saving configuration. Please try again.');
      console.error('Error saving config:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Configure your solar monitoring system</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl ${message.includes('✅') ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
          {message}
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Solar System Configuration */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-xl flex items-center justify-center border border-yellow-500/30">
              <span className="text-2xl">⚙️</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Solar System Configuration</h3>
              <p className="text-gray-400 text-sm">Configure your solar plant parameters</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* City Selection */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                📍 City Location
              </label>
              <select
                value={systemConfig.city}
                onChange={(e) => handleConfigChange('city', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition"
              >
                {INDIAN_CITIES.map(city => (
                  <option key={city} value={city} className="bg-gray-900 text-white border-0">
                    {city}
                  </option>
                ))}
              </select>
              <p className="text-gray-500 text-xs mt-2">Selecting a different city will update the local weather monitoring.</p>
            </div>
          </div>


          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveConfig}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold rounded-xl hover:shadow-lg hover:shadow-yellow-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : '💾 Save Configuration'}
            </button>
          </div>
        </div>

        {/* General Settings */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 shadow-2xl">
          <h3 className="text-xl font-semibold text-white mb-4">General Settings</h3>
          <div className="space-y-4">
            <SettingItem
              label="Enable Notifications"
              description="Receive alerts for system events"
              checked={settings.notifications}
              onChange={() => handleToggle('notifications')}
            />
            <SettingItem
              label="Auto Optimization"
              description="Automatically optimize energy usage"
              checked={settings.autoOptimize}
              onChange={() => handleToggle('autoOptimize')}
            />
            <SettingItem
              label="Dark Mode"
              description="Use dark theme interface"
              checked={settings.darkMode}
              onChange={() => handleToggle('darkMode')}
            />
          </div>
        </div>

        {/* System Info */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 shadow-2xl">
          <h3 className="text-xl font-semibold text-white mb-4">System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Version" value="2.0.0" />
            <InfoItem label="Update Interval" value="3 seconds" />
            <InfoItem label="API Status" value="Connected" status="success" />
            <InfoItem label="Weather API" value="OpenWeatherMap" />
          </div>
        </div>

        {/* About */}
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/20 shadow-2xl">
          <h3 className="text-xl font-semibold text-white mb-2">About</h3>
          <p className="text-gray-300 mb-4">
            Smart Renewable Energy Optimization & Monitoring Dashboard v2.0
          </p>
          <p className="text-gray-400 text-sm mb-2">
            <strong>New Features:</strong>
          </p>
          <ul className="text-gray-400 text-sm space-y-1 ml-4">
            <li>• Real-time weather data integration</li>
            <li>• Realistic solar generation simulation</li>
            <li>• Configurable system parameters</li>
            <li>• 100+ Indian cities supported</li>
          </ul>
          <p className="text-gray-400 text-sm mt-4">
            BE Electrical Engineering Final Year Project<br />
            Built with React.js, Flask, and OpenWeatherMap API
          </p>
        </div>
      </div>
    </div>
  );
};

const SettingItem = ({ label, description, checked, onChange }) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
      <div>
        <p className="text-white font-medium">{label}</p>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
          checked ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gray-700'
        }`}
      >
        <div
          className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
            checked ? 'transform translate-x-7' : ''
          }`}
        ></div>
      </button>
    </div>
  );
};

const InfoItem = ({ label, value, status }) => {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4">
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className={`font-semibold ${status === 'success' ? 'text-green-400' : 'text-white'}`}>
        {value}
      </p>
    </div>
  );
};

export default Settings;

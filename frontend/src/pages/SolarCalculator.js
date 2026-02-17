/**
 * Solar Calculator Component
 * Calculates solar system requirements based on daily load
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const SolarCalculator = () => {
  const navigate = useNavigate();
  const [dailyLoad, setDailyLoad] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/calculate-solar`, {
        daily_load: parseFloat(dailyLoad)
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error calculating:', error);
      alert('Error calculating solar system requirements');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">Renewable Energy Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-white font-medium"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="text-gray-400 hover:text-white font-medium"
            >
              Analytics
            </button>
            <button
              onClick={() => navigate('/calculator')}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Calculator
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-2">Solar System Calculator</h2>
        <p className="text-gray-400 mb-6">Calculate the required solar panels, battery capacity, and estimated costs</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Enter Your Requirements</h3>
            
            <form onSubmit={handleCalculate}>
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Daily Energy Consumption (kWh)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={dailyLoad}
                  onChange={(e) => setDailyLoad(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                  placeholder="e.g., 25"
                  required
                />
                <p className="text-gray-500 text-xs mt-2">
                  Average household: 20-30 kWh/day
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50"
              >
                {loading ? 'Calculating...' : 'Calculate System Requirements'}
              </button>
            </form>

            {/* Information Box */}
            <div className="mt-6 bg-gray-700 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">How it works:</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• System sized for 5 peak sun hours/day</li>
                <li>• Battery provides 2 days backup</li>
                <li>• Costs include panels, battery, inverter</li>
                <li>• Savings based on $0.12/kWh grid rate</li>
              </ul>
            </div>
          </div>

          {/* Results Display */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">System Requirements</h3>
            
            {!results ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Enter your daily load and click calculate</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* System Size */}
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-4">
                  <p className="text-white text-sm mb-1">Solar System Size</p>
                  <p className="text-3xl font-bold text-white">{results.system_size_kw} kW</p>
                </div>

                {/* Number of Panels */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Number of Solar Panels</span>
                    <span className="text-2xl font-bold text-white">{results.num_panels}</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">400W panels</p>
                </div>

                {/* Battery Capacity */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Battery Capacity</span>
                    <span className="text-2xl font-bold text-white">{results.battery_capacity_kwh} kWh</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">2 days backup</p>
                </div>

                {/* Total Cost */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-4">
                  <p className="text-white text-sm mb-1">Total System Cost</p>
                  <p className="text-3xl font-bold text-white">${results.total_cost.toLocaleString()}</p>
                  <p className="text-green-100 text-xs mt-1">Including installation</p>
                </div>

                {/* Annual Savings */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Annual Savings</span>
                    <span className="text-2xl font-bold text-green-400">${results.annual_savings.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payback Period */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Payback Period</span>
                    <span className="text-2xl font-bold text-blue-400">{results.payback_period_years} years</span>
                  </div>
                </div>

                {/* CO2 Reduction */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-4">
                  <p className="text-white text-sm mb-1">Annual CO₂ Reduction</p>
                  <p className="text-3xl font-bold text-white">{results.co2_reduction_kg_year.toLocaleString()} kg</p>
                  <p className="text-blue-100 text-xs mt-1">Environmental impact</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        {results && (
          <div className="mt-6 bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">System Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-gray-300 text-sm mb-2">Solar Panels</h4>
                <p className="text-white font-semibold">{results.num_panels} × 400W panels</p>
                <p className="text-gray-400 text-sm mt-1">Total capacity: {results.system_size_kw} kW</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-gray-300 text-sm mb-2">Battery Storage</h4>
                <p className="text-white font-semibold">{results.battery_capacity_kwh} kWh capacity</p>
                <p className="text-gray-400 text-sm mt-1">Lithium-ion battery bank</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-gray-300 text-sm mb-2">Inverter</h4>
                <p className="text-white font-semibold">{results.system_size_kw} kW inverter</p>
                <p className="text-gray-400 text-sm mt-1">Hybrid solar inverter</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolarCalculator;

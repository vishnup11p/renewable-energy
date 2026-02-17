/**
 * Analytics Page Component
 * Shows predictions and monthly data with advanced charts
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const [predResponse, monthlyResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/prediction`),
        axios.get(`${API_BASE_URL}/api/monthly`)
      ]);
      
      setPredictions(predResponse.data);
      setMonthlyData(monthlyResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  // Prediction Chart Data
  const predictionChartData = {
    labels: predictions.map(p => p.hour),
    datasets: [
      {
        label: 'Predicted Solar (kW)',
        data: predictions.map(p => p.predicted_solar),
        borderColor: 'rgb(251, 191, 36)',
        backgroundColor: 'rgba(251, 191, 36, 0.5)',
        tension: 0.4
      },
      {
        label: 'Predicted Wind (kW)',
        data: predictions.map(p => p.predicted_wind),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4
      }
    ]
  };

  // Monthly Chart Data
  const monthlyChartData = {
    labels: monthlyData.map(d => `Day ${d.day}`),
    datasets: [
      {
        label: 'Solar (kWh)',
        data: monthlyData.map(d => d.solar),
        backgroundColor: 'rgba(251, 191, 36, 0.8)'
      },
      {
        label: 'Wind (kWh)',
        data: monthlyData.map(d => d.wind),
        backgroundColor: 'rgba(59, 130, 246, 0.8)'
      },
      {
        label: 'Consumption (kWh)',
        data: monthlyData.map(d => d.consumption),
        backgroundColor: 'rgba(239, 68, 68, 0.8)'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#fff',
          font: { size: 12 }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: '#9ca3af' }
      },
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { 
          color: '#9ca3af',
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  // Calculate statistics
  const totalSolar = monthlyData.reduce((sum, d) => sum + d.solar, 0);
  const totalWind = monthlyData.reduce((sum, d) => sum + d.wind, 0);
  const totalConsumption = monthlyData.reduce((sum, d) => sum + d.consumption, 0);
  const avgDaily = (totalSolar + totalWind) / monthlyData.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading analytics...</div>
      </div>
    );
  }

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
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Analytics
            </button>
            <button
              onClick={() => navigate('/calculator')}
              className="text-gray-400 hover:text-white font-medium"
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
      <div className="p-6">
        <h2 className="text-3xl font-bold text-white mb-6">Analytics & Predictions</h2>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">Total Solar (30 days)</h3>
            <p className="text-2xl font-bold text-yellow-400">{totalSolar.toFixed(2)} kWh</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">Total Wind (30 days)</h3>
            <p className="text-2xl font-bold text-blue-400">{totalWind.toFixed(2)} kWh</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">Total Consumption</h3>
            <p className="text-2xl font-bold text-red-400">{totalConsumption.toFixed(2)} kWh</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">Avg Daily Generation</h3>
            <p className="text-2xl font-bold text-green-400">{avgDaily.toFixed(2)} kWh</p>
          </div>
        </div>

        {/* 24-Hour Prediction Chart */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">24-Hour Generation Forecast</h3>
          <div style={{ height: '400px' }}>
            <Line data={predictionChartData} options={chartOptions} />
          </div>
        </div>

        {/* Monthly Data Chart */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Monthly Energy Report (30 Days)</h3>
          <div style={{ height: '400px' }}>
            <Bar data={monthlyChartData} options={chartOptions} />
          </div>
        </div>

        {/* Insights Section */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-lg p-6">
            <h3 className="text-white font-semibold text-lg mb-2">Energy Surplus</h3>
            <p className="text-3xl font-bold text-white mb-2">
              {(totalSolar + totalWind - totalConsumption).toFixed(2)} kWh
            </p>
            <p className="text-green-100 text-sm">
              Excess energy available for grid export or storage
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg p-6">
            <h3 className="text-white font-semibold text-lg mb-2">CO₂ Reduction</h3>
            <p className="text-3xl font-bold text-white mb-2">
              {((totalSolar + totalWind) * 0.92).toFixed(2)} kg
            </p>
            <p className="text-blue-100 text-sm">
              Carbon emissions prevented this month
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

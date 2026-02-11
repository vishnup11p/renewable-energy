/**
 * Dashboard - Overview Page (Sopanel Style)
 * Clean, light-themed energy monitoring interface
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [energyData, setEnergyData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [energyRes, historyRes] = await Promise.all([
        axios.get('http://localhost:5000/api/energy'),
        axios.get('http://localhost:5000/api/history')
      ]);
      setEnergyData(energyRes.data);
      setHistory(historyRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !energyData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Prepare chart data for energy production
  const chartData = {
    labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'],
    datasets: [
      {
        label: 'Solar',
        data: [180, 200, 410, 420, 460, 480, 550, 580, 470, 490, 520, 560, 590, 620, 650],
        backgroundColor: '#f97316',
        borderRadius: 4,
        barThickness: 12
      },
      {
        label: 'Grid',
        data: [120, 150, 200, 180, 220, 240, 260, 280, 250, 270, 290, 310, 330, 350, 370],
        backgroundColor: '#fbbf24',
        borderRadius: 4,
        barThickness: 12
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#1f2937',
        bodyColor: '#6b7280',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        displayColors: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6',
          drawBorder: false
        },
        ticks: {
          color: '#9ca3af',
          font: { size: 11 }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#9ca3af',
          font: { size: 11 }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Overview</h1>
            <p className="text-gray-500 text-sm">Monitor your solar energy system performance</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg">
              <span className="text-gray-600 text-sm">📍 {energyData.city}</span>
            </div>
            <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg">
              <span className="text-gray-600 text-sm">🌡️ {energyData.temperature}°C</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Performance Monitoring Card */}
        <div className="lg:col-span-2 bg-gray-900 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
            <span className="text-yellow-400">☀️</span>
            <span className="text-sm">{energyData.temperature}°C</span>
          </div>

          <h2 className="text-xl font-semibold mb-8">Performance Monitoring</h2>

          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Total Charging */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-400 text-sm">Total Charging</span>
              </div>
              <div className="text-5xl font-bold mb-2">{energyData.total_generation}</div>
              <div className="text-sm text-gray-400">kWh</div>
              <div className="flex items-center gap-4 mt-2 text-xs">
                <span className="text-red-400">Min {Math.min(...history.map(h => h.total_generation || 0)).toFixed(1)}</span>
                <span className="text-green-400">Max {Math.max(...history.map(h => h.total_generation || 0)).toFixed(1)}</span>
              </div>
            </div>

            {/* Power Usage */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-gray-400 text-sm">Power Usage</span>
              </div>
              <div className="text-5xl font-bold mb-2">{energyData.consumption}</div>
              <div className="text-sm text-gray-400">kWh</div>
              <div className="text-xs text-gray-400 mt-2">1 hour usage: {(energyData.consumption * 1).toFixed(2)} kWh</div>
            </div>
          </div>

          {/* Solar Panel Illustration */}
          <div className="relative">
            <div className="absolute right-0 bottom-0">
              <svg width="300" height="200" viewBox="0 0 300 200" fill="none">
                {/* Solar Panel */}
                <g transform="translate(50, 50) rotate(-15)">
                  {/* Panel base */}
                  <rect x="0" y="0" width="200" height="120" fill="#3b82f6" rx="4"/>
                  {/* Grid lines */}
                  <line x1="0" y1="40" x2="200" y2="40" stroke="#1e40af" strokeWidth="2"/>
                  <line x1="0" y1="80" x2="200" y2="80" stroke="#1e40af" strokeWidth="2"/>
                  <line x1="66" y1="0" x2="66" y2="120" stroke="#1e40af" strokeWidth="2"/>
                  <line x1="133" y1="0" x2="133" y2="120" stroke="#1e40af" strokeWidth="2"/>
                  {/* Stand */}
                  <rect x="85" y="120" width="30" height="40" fill="#6b7280"/>
                  <rect x="70" y="160" width="60" height="8" fill="#4b5563"/>
                </g>
              </svg>
            </div>
            
            {/* Capacity and Total Info */}
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-400">🔋</span>
                  <span className="text-sm text-gray-300">Capacity</span>
                </div>
                <div className="text-2xl font-bold">{energyData.battery}</div>
                <div className="text-xs text-gray-400">kWh</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-400">⚡</span>
                  <span className="text-sm text-gray-300">Total kWh</span>
                </div>
                <div className="text-2xl font-bold">{(energyData.total_generation * 24).toFixed(1)}</div>
                <div className="text-xs text-gray-400">kWh</div>
              </div>
            </div>
          </div>
        </div>

        {/* Energy Generation Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Energy Generation</h3>
          
          <div className="space-y-6">
            {/* Solar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Solar</span>
                <span className="text-gray-900 font-semibold">{energyData.solar_generation} kWh</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(energyData.solar_generation / 10) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Grid */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Grid</span>
                <span className="text-gray-900 font-semibold">{energyData.grid_import} kWh</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(energyData.grid_import / 5) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Battery */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Battery</span>
                <span className="text-gray-900 font-semibold">{energyData.battery}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${energyData.battery}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-gray-500 text-xs mb-1">CO₂ Saved</div>
                <div className="text-gray-900 font-semibold">{energyData.co2_saved} kg</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">Savings</div>
                <div className="text-orange-600 font-semibold">₹{energyData.savings}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Energy Production Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Energy Production</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-yellow-400">⚡</span>
                <span className="text-sm text-gray-500">100 kWh</span>
              </div>
            </div>
            <button className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200">
              Monthly
            </button>
          </div>
          
          <div style={{ height: '300px' }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Solar Panel Status */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Solar Panel</h3>
          
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-green-50 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-4xl">☀️</span>
                </div>
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Active
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 text-sm">Efficiency</span>
              <span className="text-gray-900 font-semibold">{energyData.efficiency}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 text-sm">Temperature</span>
              <span className="text-gray-900 font-semibold">{energyData.panel_temperature}°C</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 text-sm">Voltage</span>
              <span className="text-gray-900 font-semibold">{energyData.panel_voltage}V</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-orange-600">✓</span>
              <span className="text-sm font-semibold text-orange-900">System Healthy</span>
            </div>
            <p className="text-xs text-orange-700">All panels operating normally</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

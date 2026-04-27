/**
 * IoT Solar Monitoring Dashboard
 * Real-time voltage monitoring from ESP32
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import API_BASE_URL from '../config/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const IoTDashboard = () => {
  const [data, setData] = useState({
    voltage: 0,
    status: 'Disconnected',
    history: []
  });
  const [loading, setLoading] = useState(true);

  const fetchIoTData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/solar`);
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching IoT data:', error);
    }
  };

  useEffect(() => {
    fetchIoTData();
    const interval = setInterval(fetchIoTData, 3000);
    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: data.history.map(h => h.time),
    datasets: [
      {
        label: 'Panel Voltage (V)',
        data: data.history.map(h => h.voltage),
        fill: true,
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderColor: '#f97316',
        tension: 0.4,
        pointRadius: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#111827',
        padding: 12,
        titleColor: '#9ca3af',
        bodyColor: '#fff',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 25,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#9ca3af' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af', maxRotation: 0 }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6 text-white font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            IoT Solar Monitor
          </h1>
          <p className="text-gray-400 mt-1">Live ESP32 Production Stream</p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 ${
          data.status === 'Charging' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
        }`}>
          <span className={`w-2 h-2 rounded-full animate-pulse ${data.status === 'Charging' ? 'bg-green-400' : 'bg-gray-400'}`}></span>
          {data.status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Voltage Card */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <span className="text-8xl">⚡</span>
          </div>
          <p className="text-gray-400 font-medium mb-2 uppercase tracking-wider text-sm">Output Voltage</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-7xl font-bold font-mono">{data.voltage.toFixed(2)}</h2>
            <span className="text-3xl font-medium text-orange-500">V</span>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
              <p className="text-gray-500 text-xs mb-1">Peak (24h)</p>
              <p className="text-xl font-bold font-mono">
                {data.history.length > 0 ? Math.max(...data.history.map(h => h.voltage)).toFixed(1) : '0.0'}V
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
              <p className="text-gray-500 text-xs mb-1">Avg (Session)</p>
              <p className="text-xl font-bold font-mono">
                {data.history.length > 0 ? (data.history.reduce((a, b) => a + b.voltage, 0) / data.history.length).toFixed(1) : '0.0'}V
              </p>
            </div>
          </div>
        </div>

        {/* Chart Card */}
        <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Voltage Timeline</h3>
            <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">Real-time (5s polling)</span>
          </div>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* System Info */}
        <div className="bg-gradient-to-br from-orange-500/10 to-red-600/10 border border-orange-500/20 rounded-3xl p-6 lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <span className="text-2xl">🌍</span>
              </div>
              <div>
                <p className="text-xs text-orange-400 font-bold uppercase">Device Status</p>
                <p className="text-lg font-medium">ESP32 Node-01 (Active)</p>
              </div>
            </div>
            <div className="flex gap-12">
              <div>
                <p className="text-xs text-gray-500 mb-1">Last Update</p>
                <p className="font-mono">{data.history.length > 0 ? data.history[data.history.length-1].time : '--:--:--'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">RSSI</p>
                <p className="font-mono text-green-400">-62 dBm</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Uptime</p>
                <p className="font-mono">4d 12h</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IoTDashboard;

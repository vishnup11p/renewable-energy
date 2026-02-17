/**
 * Reports Page
 * Monthly summaries and downloadable reports
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const Reports = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonthly = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/monthly`);
        setMonthlyData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching monthly data:', error);
      }
    };

    fetchMonthly();
  }, []);

  const handleDownload = () => {
    alert('PDF Report download simulation - Feature ready for implementation!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading reports...</p>
        </div>
      </div>
    );
  }

  const totalSolar = monthlyData.reduce((sum, d) => sum + d.solar, 0);
  const totalWind = monthlyData.reduce((sum, d) => sum + d.wind, 0);
  const totalGeneration = totalSolar + totalWind;
  const savings = totalGeneration * 8;
  const co2Saved = totalGeneration * 0.92;

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Energy Reports</h1>
          <p className="text-gray-400">Monthly performance summary</p>
        </div>
        <button
          onClick={handleDownload}
          className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold rounded-xl hover:shadow-lg hover:shadow-yellow-500/50 transition-all duration-200"
        >
          📄 Download PDF Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <SummaryCard 
          icon="☀️" 
          label="Total Solar Generated" 
          value={`${totalSolar.toFixed(2)} kWh`}
          color="yellow"
        />
        <SummaryCard 
          icon="💨" 
          label="Total Wind Generated" 
          value={`${totalWind.toFixed(2)} kWh`}
          color="blue"
        />
        <SummaryCard 
          icon="💰" 
          label="Total Savings" 
          value={`₹${savings.toFixed(2)}`}
          color="green"
        />
        <SummaryCard 
          icon="🌍" 
          label="CO₂ Saved" 
          value={`${co2Saved.toFixed(2)} kg`}
          color="emerald"
        />
      </div>

      {/* Monthly Data Table */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 shadow-2xl">
        <h3 className="text-xl font-semibold text-white mb-4">30-Day Detailed Report</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Day</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold">Solar (kWh)</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold">Wind (kWh)</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold">Total (kWh)</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold">Consumption (kWh)</th>
                <th className="text-right py-3 px-4 text-gray-400 font-semibold">Savings (₹)</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((day) => (
                <tr key={day.day} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 px-4 text-white">Day {day.day}</td>
                  <td className="py-3 px-4 text-right text-yellow-400">{day.solar.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right text-blue-400">{day.wind.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right text-green-400 font-semibold">{day.total.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right text-red-400">{day.consumption.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right text-purple-400">₹{(day.total * 8).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ icon, label, value, color }) => {
  const colors = {
    yellow: 'from-yellow-500/10 to-orange-500/10 border-yellow-500/20',
    blue: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20',
    green: 'from-green-500/10 to-emerald-500/10 border-green-500/20',
    emerald: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} backdrop-blur-xl rounded-xl p-6 border shadow-lg`}>
      <div className="text-3xl mb-3">{icon}</div>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-white font-bold text-2xl">{value}</p>
    </div>
  );
};

export default Reports;

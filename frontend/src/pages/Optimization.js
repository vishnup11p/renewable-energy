/**
 * Optimization Page
 * Smart recommendations and timeline visualization
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Optimization = () => {
  const [optimization, setOptimization] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptimization = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/optimization');
        setOptimization(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching optimization:', error);
      }
    };

    fetchOptimization();
    const interval = setInterval(fetchOptimization, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !optimization) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading optimization...</p>
        </div>
      </div>
    );
  }

  const priorityColors = {
    high: 'from-red-500/20 to-orange-500/20 border-red-500/30',
    medium: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
    low: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30'
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Smart Optimization</h1>
        <p className="text-gray-400">AI-powered recommendations for maximum efficiency</p>
      </div>

      {/* Current Recommendation */}
      <div className={`bg-gradient-to-br ${priorityColors[optimization.priority]} backdrop-blur-xl rounded-2xl p-6 border shadow-2xl mb-6`}>
        <div className="flex items-start gap-4">
          <div className="text-5xl">💡</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">
                {optimization.priority} Priority
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Current Recommendation</h2>
            <p className="text-gray-300 text-lg">{optimization.current_tip}</p>
          </div>
        </div>
      </div>

      {/* Battery Optimization */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 shadow-2xl mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🔋</span>
          <h3 className="text-xl font-semibold text-white">Battery Optimization</h3>
        </div>
        <p className="text-gray-300">{optimization.battery_tip}</p>
      </div>

      {/* Timeline Visualization */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 shadow-2xl mb-6">
        <h3 className="text-xl font-semibold text-white mb-6">Daily Energy Timeline</h3>
        <div className="space-y-4">
          {optimization.timeline.map((period, index) => (
            <div key={index} className="relative">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center text-3xl border border-yellow-500/30">
                  {period.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-lg font-semibold text-white">{period.period}</h4>
                    <span className="text-sm text-gray-500">{period.time}</span>
                  </div>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-sm text-gray-400">Solar: <span className="text-yellow-400">{period.solar}</span></span>
                  </div>
                  <p className="text-gray-300">{period.recommendation}</p>
                </div>
              </div>
              {index < optimization.timeline.length - 1 && (
                <div className="absolute left-8 top-16 w-0.5 h-8 bg-gradient-to-b from-yellow-500/50 to-transparent"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Additional Tips */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 shadow-2xl">
        <h3 className="text-xl font-semibold text-white mb-4">Smart Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {optimization.tips.map((tip, index) => (
            <div key={index} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✨</span>
                <p className="text-gray-300 text-sm">{tip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Optimization;

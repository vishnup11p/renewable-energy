/**
 * AI Chatbot Component
 * Helps users with queries about the solar monitoring system
 */

import React, { useState, useRef, useEffect } from 'react';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Hello! I\'m HelioBot, your AI assistant. How can I help you with your solar energy system today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // AI Response Logic
  const getAIResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Solar Generation Questions
    if (message.includes('solar') && (message.includes('not') || message.includes('low') || message.includes('zero'))) {
      return 'Solar generation can be low or zero due to: 1) Night time (6 PM - 6 AM), 2) Heavy cloud cover, 3) Rain or storms, 4) Panel maintenance needed. Check the weather conditions and time of day first.';
    }
    
    if (message.includes('solar') && (message.includes('increase') || message.includes('improve') || message.includes('boost'))) {
      return 'To increase solar generation: 1) Clean panels regularly, 2) Ensure panels face south, 3) Remove shade sources, 4) Check for panel damage, 5) Upgrade to higher efficiency panels. Current efficiency is shown in the dashboard.';
    }
    
    // Battery Questions
    if (message.includes('battery') && (message.includes('charge') || message.includes('charging'))) {
      return 'Battery charges when solar generation exceeds consumption. To charge faster: 1) Reduce consumption during peak sun hours (11 AM - 2 PM), 2) Ensure panels are clean, 3) Check battery health. Battery charges automatically when excess power is available.';
    }
    
    if (message.includes('battery') && message.includes('low')) {
      return 'Low battery can be due to: 1) High consumption, 2) Low solar generation, 3) Cloudy weather, 4) Battery aging. Solutions: Reduce non-essential loads, charge during peak hours, or consider battery upgrade.';
    }
    
    // Configuration Questions
    if (message.includes('city') || message.includes('location') || message.includes('change')) {
      return 'To change your city: Go to Settings page → Select your city from the dropdown (100+ Indian cities available) → Click Save Configuration. The system will fetch real weather data for your location.';
    }
    
    if (message.includes('settings') || message.includes('configure')) {
      return 'You can configure: 1) City location, 2) Solar capacity (kW), 3) Battery size (kWh), 4) Panel efficiency (%), 5) Base consumption (kW). Go to Settings page to make changes.';
    }
    
    // Weather Questions
    if (message.includes('weather') && (message.includes('affect') || message.includes('impact'))) {
      return 'Weather significantly affects solar generation: Clear sky = 100%, Partly cloudy = 70-90%, Cloudy = 30-70%, Rain = 20-40%. The system uses real-time weather data to simulate realistic generation.';
    }
    
    // Efficiency Questions
    if (message.includes('efficiency')) {
      return 'Panel efficiency is affected by: 1) Temperature (higher temp = lower efficiency), 2) Dust/dirt on panels, 3) Panel age, 4) Shading. Optimal efficiency is 85-95%. Clean panels regularly and ensure good ventilation.';
    }
    
    // Grid Questions
    if (message.includes('grid') && (message.includes('export') || message.includes('sell'))) {
      return 'Grid export happens when: 1) Battery is full, 2) Generation exceeds consumption. You can earn by selling excess power to the grid. Check your grid export value in the dashboard for potential earnings.';
    }
    
    // Cost/Savings Questions
    if (message.includes('savings') || message.includes('money') || message.includes('cost')) {
      return 'Your savings are calculated as: Generation × ₹8 per kWh. To maximize savings: 1) Use appliances during peak solar hours, 2) Minimize grid import, 3) Export excess to grid, 4) Maintain system efficiency.';
    }
    
    // Calculator Questions
    if (message.includes('calculator') || message.includes('size') || message.includes('panels')) {
      return 'Use the Solar Calculator page to: 1) Enter your daily load (kWh), 2) Get system size recommendations, 3) See required number of panels, 4) Calculate battery capacity, 5) Estimate costs and payback period.';
    }
    
    // Optimization Questions
    if (message.includes('optimize') || message.includes('best time')) {
      return 'Best practices: 1) Run heavy appliances 11 AM - 2 PM (peak solar), 2) Charge EVs during day, 3) Use battery at night, 4) Minimize grid import during peak rates, 5) Check Optimization page for smart recommendations.';
    }
    
    // API Key Questions
    if (message.includes('api') || message.includes('weather api')) {
      return 'To enable real weather data: 1) Get free API key from openweathermap.org, 2) Open backend/services/weather_service.py, 3) Replace API_KEY on line 10, 4) Restart backend. See WEATHER_API_SETUP.md for details.';
    }
    
    // General Help
    if (message.includes('help') || message.includes('how') || message.includes('what')) {
      return 'I can help you with: Solar generation, Battery management, System configuration, Weather impact, Efficiency tips, Cost savings, Grid export, Calculator usage, and Optimization. What would you like to know?';
    }
    
    // Default Response
    return 'I\'m here to help! You can ask me about: solar generation, battery charging, system settings, weather effects, efficiency, savings, grid export, or optimization tips. What would you like to know?';
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage = {
      type: 'user',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking and respond
    setTimeout(() => {
      const botResponse = {
        type: 'bot',
        text: getAIResponse(inputText),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    'Why is solar generation low?',
    'How to charge battery faster?',
    'How to change city?',
    'Best time to use appliances?'
  ];

  const handleQuickQuestion = (question) => {
    setInputText(question);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 flex items-center justify-center z-50 hover:scale-110"
        >
          <span className="text-2xl">🤖</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 animate-scaleIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h3 className="font-semibold">HelioBot</h3>
                <p className="text-xs text-white/80">AI Assistant • Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 hover:bg-white/20 rounded-lg transition-colors flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                    {message.time}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="px-4 py-2 border-t border-gray-200 bg-white">
              <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-lg">➤</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;

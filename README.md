# 🌞 Smart Renewable Energy Optimization & Monitoring Dashboard v2.0

A premium, realistic solar monitoring system with **real-time weather data integration** and configurable parameters. Built for BE Electrical Engineering final year project.

## ✨ New in Version 2.0

### 🌤️ Real Weather Integration
- **Live weather data** from OpenWeatherMap API
- **100+ Indian cities** supported
- Real-time temperature, clouds, humidity, wind speed
- Automatic weather-based solar simulation

### ⚙️ Configurable System
- **User-selectable city** - Choose your location
- **Solar capacity** - Configure your system size (1-100 kW)
- **Battery size** - Set storage capacity (5-50 kWh)
- **Panel efficiency** - Adjust efficiency (70-95%)
- **Base consumption** - Set household usage (1-20 kW)

### 🎯 Realistic Solar Simulation
- **Time-based generation** - Peaks at noon, zero at night
- **Cloud-responsive** - Generation reduces with cloud cover
- **Weather-aware** - Rain and storms affect output
- **Efficiency modeling** - Temperature affects panel performance

---

## 🚀 Quick Start

### Step 1: Get Weather API Key (FREE)
1. Visit: https://openweathermap.org/api
2. Sign up for free account
3. Get your API key
4. Paste it in `backend/services/weather_service.py` (line 10)

**Detailed instructions:** See `WEATHER_API_SETUP.md`

### Step 2: Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # Mac/Linux
pip install -r requirements.txt
python app.py
```

### Step 3: Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Step 4: Configure Your System
1. Login: `admin` / `admin123`
2. Go to **Settings** page
3. Select your **city**
4. Configure **solar capacity**, **battery size**, **efficiency**
5. Click **Save Configuration**
6. Dashboard updates automatically!

---

## 🎯 Key Features

### Real-Time Monitoring
- Live solar generation based on actual weather
- Battery charging/discharging simulation
- Grid import/export tracking
- CO₂ savings calculation
- Financial savings (₹)

### Weather Integration
- Current temperature and conditions
- Cloud coverage percentage
- Sunrise/sunset times
- Weather icons and descriptions
- Humidity and wind speed

### Smart Analytics
- 24-hour generation forecast
- 30-day monthly reports
- Performance scoring
- Efficiency tracking
- Optimization recommendations

### Solar Calculator
- System sizing based on daily load
- Panel count estimation
- Battery capacity calculation
- Cost breakdown
- ROI and payback period

---

## 📊 How It Works

### Realistic Solar Generation Formula

```
Solar Generation = Capacity × Time Factor × Cloud Factor × Weather Factor × Efficiency

Where:
- Time Factor: Sine curve (0 at night, 1 at noon)
- Cloud Factor: (100 - cloud%) / 100 × 0.7
- Weather Factor: 1.0 (clear), 0.5 (drizzle), 0.3 (rain)
- Efficiency: User-configured panel efficiency
```

### Example Calculation

**Configuration:**
- City: Mumbai
- Time: 12:00 PM (noon)
- Weather: Partly cloudy (30% clouds)
- Capacity: 10 kW
- Efficiency: 85%

**Calculation:**
- Time Factor: 1.0 (peak noon)
- Cloud Factor: 0.79 (30% clouds)
- Weather Factor: 1.0 (no rain)
- **Generation: 10 × 1.0 × 0.79 × 1.0 × 0.85 = 6.7 kW**

---

## 🌍 Supported Cities

100+ Indian cities including:
- **Major metros:** Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata
- **Tier-2 cities:** Pune, Ahmedabad, Jaipur, Surat, Lucknow
- **And many more!**

Full list available in Settings page.

---

## 🔧 Technology Stack

**Frontend:**
- React 18.2
- Tailwind CSS
- Chart.js 4
- Axios

**Backend:**
- Python Flask 3.0
- Flask-CORS
- Requests (for API calls)

**APIs:**
- OpenWeatherMap API (weather data)

---

## 📡 API Endpoints

### Energy & Monitoring
- `GET /api/energy` - Current energy data with real weather
- `GET /api/history` - Recent readings for charts
- `GET /api/prediction` - 24-hour forecast
- `GET /api/monthly` - 30-day report

### Configuration
- `GET /api/config` - Get system configuration
- `POST /api/config` - Update configuration
- `GET /api/weather?city=CityName` - Get weather for any city

### Other
- `POST /api/login` - Authentication
- `POST /api/calculate-solar` - Solar calculator
- `GET /api/optimization` - Smart recommendations

---

## ⚙️ Configuration Options

Access via **Settings** page:

| Parameter | Range | Description |
|-----------|-------|-------------|
| City | 100+ cities | Location for weather data |
| Solar Capacity | 1-100 kW | Total installed capacity |
| Battery Size | 5-50 kWh | Storage capacity |
| Panel Efficiency | 70-95% | Conversion efficiency |
| Base Consumption | 1-20 kW | Average household usage |

---

## 🎓 For Viva Presentation

### Key Highlights:

1. **Real Weather Integration**
   - Live data from OpenWeatherMap API
   - Realistic solar simulation based on actual conditions

2. **Configurable System**
   - User can customize all parameters
   - Adapts to different solar plant sizes

3. **Professional Accuracy**
   - Industry-standard formulas
   - Time-of-day solar curves
   - Weather-responsive generation

4. **Scalable Architecture**
   - Easy hardware integration
   - API-based design
   - Modular components

### Demo Flow:
1. Show Settings - Configure city and parameters
2. Show Dashboard - Real weather and solar generation
3. Change city - Watch weather and generation update
4. Show Analytics - Predictions and reports
5. Show Calculator - System sizing tool

---

## 🐛 Troubleshooting

### Weather API not working?
- Check API key in `backend/services/weather_service.py`
- Wait 10-15 minutes after signup for activation
- Verify internet connection

### Solar generation always zero?
- Check current time (zero at night 6 PM - 6 AM)
- Verify weather API is working
- Check system configuration

### City not found?
- Use exact spelling (e.g., "Mumbai" not "Bombay")
- Try nearby major city
- Check city is in supported list

**Full troubleshooting:** See `WEATHER_API_SETUP.md`

---

## 📝 Project Structure

```
renewable-dashboard/
├── backend/
│   ├── services/
│   │   └── weather_service.py    # Weather API integration
│   ├── app.py                     # Main Flask server
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Sidebar.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js       # Main monitoring page
│   │   │   ├── Analytics.js
│   │   │   ├── Optimization.js
│   │   │   ├── SolarCalculator.js
│   │   │   ├── Reports.js
│   │   │   └── Settings.js        # Configuration page
│   │   ├── App.js
│   │   └── index.css
│   └── package.json
│
├── README.md
└── WEATHER_API_SETUP.md           # API setup instructions
```

---

## 🎉 Success Criteria

Your system is working correctly when:
- ✅ Weather card shows real temperature for selected city
- ✅ Solar generation peaks at noon, zero at night
- ✅ Generation reduces on cloudy days
- ✅ Changing city updates weather immediately
- ✅ Configuration changes reflect in dashboard

---

## 🔮 Future Enhancements

- Real hardware sensor integration (Arduino/Raspberry Pi)
- Machine learning for better predictions
- Historical weather data analysis
- Mobile app version
- Multi-user support
- Cloud deployment

---

## 📞 Support

**Setup Issues?** Check `WEATHER_API_SETUP.md`  
**API Problems?** Verify your OpenWeatherMap API key  
**Configuration Help?** See Settings page tooltips

---

## 🏆 Project Achievements

- ✅ Real-time weather data integration
- ✅ Realistic solar simulation
- ✅ Configurable system parameters
- ✅ Professional UI/UX
- ✅ 100+ cities supported
- ✅ Industry-standard calculations
- ✅ Viva-ready presentation

---

**Version:** 2.0.0  
**Status:** Production Ready  
**Perfect for:** BE Electrical Engineering Final Year Project

🌞⚡🎓

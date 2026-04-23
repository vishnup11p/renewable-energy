# Weather API Setup Instructions

## 🌤️ OpenWeatherMap API Integration

Your dashboard now uses **real-time weather data** to simulate realistic solar generation!

---

## Step 1: Get Your Free API Key

1. Go to: **https://openweathermap.org/api**
2. Click **"Sign Up"** (top right)
3. Create a free account
4. Verify your email
5. Go to **"API keys"** tab in your account
6. Copy your API key (it looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

**Note:** It may take 10-15 minutes for your API key to activate after signup.

---

## Step 2: Add API Key to Backend

1. Open file: `backend/services/weather_service.py`

2. Find this line (line 10):
   ```python
   API_KEY = "PASTE_YOUR_API_KEY_HERE"
   ```

3. Replace with your actual API key:
   ```python
   API_KEY = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
   ```

4. Save the file

---

## Step 3: Install Required Package

The backend needs the `requests` library to call the weather API.

```bash
cd backend
pip install requests
```

Or install all requirements:
```bash
pip install -r requirements.txt
```

---

## Step 4: Restart Backend

```bash
cd backend
python app.py
```

---

## ✅ Verify It's Working

1. Open your dashboard: http://localhost:3000
2. Login with: `admin` / `admin123`
3. Check the weather card - it should show real temperature and conditions
4. Go to Settings page
5. Change the city (e.g., from Mumbai to Delhi)
6. Click "Save Configuration"
7. Go back to Dashboard - weather should update for the new city!

---

## 🎯 What Changed?

### Backend Changes:
- ✅ **Real weather API integration** - Fetches live data from OpenWeatherMap
- ✅ **Realistic solar simulation** - Generation based on actual cloud cover and time
- ✅ **Configuration system** - User can change city, capacity, battery, efficiency
- ✅ **New API endpoints:**
  - `GET /api/weather?city=CityName` - Get weather for any city
  - `GET /api/config` - Get current system configuration
  - `POST /api/config` - Update system configuration

### Frontend Changes:
- ✅ **Settings page upgraded** - Configure solar system parameters
- ✅ **City selector** - Choose from 100+ Indian cities
- ✅ **Real weather display** - Shows actual temperature, clouds, conditions
- ✅ **Realistic solar graph** - Responds to real weather conditions

---

## 🌍 Supported Cities

The system supports **100+ Indian cities** including:
- Mumbai, Delhi, Bangalore, Hyderabad, Chennai
- Kolkata, Pune, Ahmedabad, Jaipur, Surat
- And many more!

Full list available in Settings page dropdown.

---

## 🔧 How Solar Simulation Works Now

### Old System (Fake):
```
solar_generation = random_value
```

### New System (Realistic):
```
1. Fetch real weather for selected city
2. Get cloud coverage percentage
3. Calculate time-of-day factor (sine curve)
4. Apply cloud reduction (clouds reduce generation)
5. Apply weather conditions (rain reduces more)
6. Multiply by system capacity and efficiency

solar_generation = capacity × time_factor × cloud_factor × weather_factor × efficiency
```

### Example:
- **City:** Mumbai
- **Time:** 12:00 PM (noon)
- **Weather:** Partly cloudy (30% clouds)
- **Capacity:** 10 kW
- **Efficiency:** 85%

**Calculation:**
- Time factor: 1.0 (peak noon)
- Cloud factor: 0.79 (30% clouds reduce by 21%)
- Weather factor: 1.0 (no rain)
- Generation: 10 × 1.0 × 0.79 × 1.0 × 0.85 = **6.7 kW**

---

## 📊 Configuration Options

### In Settings Page:

1. **City Location** 
   - Select from 100+ Indian cities
   - Real weather data fetched automatically

2. **Solar Capacity (kW)**
   - Your total installed solar panel capacity
   - Range: 1-100 kW

3. **Battery Capacity (kWh)**
   - Your battery storage size
   - Range: 5-50 kWh

4. **Panel Efficiency (%)**
   - Solar panel conversion efficiency
   - Range: 70-95%

5. **Base Consumption (kW)**
   - Your average household consumption
   - Range: 1-20 kW

---

## 🚨 Troubleshooting

### Problem: "Weather API Error" in console

**Solution 1:** Check API key is correct
- Open `backend/services/weather_service.py`
- Verify API key is pasted correctly (no extra spaces)

**Solution 2:** Wait for API activation
- New API keys take 10-15 minutes to activate
- Try again after waiting

**Solution 3:** Check internet connection
- Weather API requires internet access
- Verify backend can reach api.openweathermap.org

### Problem: Solar generation is always zero

**Solution:** Check the time
- Solar generation is zero at night (6 PM - 6 AM)
- Wait until daytime or change system time for testing

### Problem: City not found

**Solution:** Use exact city name
- Use proper spelling (e.g., "Mumbai" not "Bombay")
- Try nearby major city if small town not found

---

## 🎓 For Viva Presentation

### Key Points to Highlight:

1. **Real Weather Integration**
   - "Our system fetches live weather data from OpenWeatherMap API"
   - "Solar generation responds to actual cloud cover and conditions"

2. **Realistic Simulation**
   - "Generation follows sine curve - peaks at noon, zero at night"
   - "Clouds reduce generation by up to 70%"
   - "Rain and storms further reduce output"

3. **Configurable System**
   - "User can change city, capacity, battery size, efficiency"
   - "System adapts to different solar plant configurations"

4. **Scalable Architecture**
   - "Easy to integrate with real hardware sensors"
   - "API-based design allows future enhancements"

---

## 📝 API Usage Limits

**Free Tier:**
- 60 calls per minute
- 1,000,000 calls per month
- More than enough for this project!

**Our Usage:**
- Dashboard updates every 3 seconds
- Weather updates every 60 seconds
- ~1,440 calls per day
- Well within free limits

---

## 🎉 You're All Set!

Your dashboard now behaves like **real solar monitoring software** with:
- ✅ Live weather data
- ✅ Realistic solar simulation
- ✅ Configurable parameters
- ✅ Professional accuracy

Perfect for your engineering viva! 🌞⚡🎓

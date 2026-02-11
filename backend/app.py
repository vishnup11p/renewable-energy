"""
Smart Renewable Energy Optimization & Monitoring Dashboard - Backend API
Realistic solar monitoring with real weather data integration
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import math
import random
from datetime import datetime, timedelta
import sys
import os

# Add services directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'services'))
from weather_service import get_weather, calculate_sunlight_factor, get_weather_icon_emoji

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# System Configuration - User can modify these settings
system_config = {
    'city': 'Mumbai',           # Default city
    'solar_capacity': 10,       # Solar system capacity in kW
    'battery_size': 10,         # Battery capacity in kWh
    'panel_efficiency': 0.85,   # Panel efficiency (0-1)
    'consumption_base': 5       # Base consumption in kW
}

# Simulated data storage
energy_history = []
battery_level = 65  # Starting battery level (%)

optimization_tips = [
    "Run heavy appliances between 11 AM - 2 PM for maximum solar usage",
    "Battery is at optimal level. Consider exporting excess to grid",
    "Weather forecast shows cloudy afternoon. Charge battery now",
    "Peak efficiency detected. Great time for high-power tasks",
    "Grid rates are high. Switch to battery power for savings"
]

def calculate_realistic_solar_generation(city, solar_capacity, efficiency):
    """
    Calculate realistic solar generation based on real weather and time of day
    
    Args:
        city (str): City name for weather data
        solar_capacity (float): Solar system capacity in kW
        efficiency (float): Panel efficiency (0-1)
    
    Returns:
        tuple: (solar_generation, weather_data, sunlight_factor)
    """
    # Get real weather data
    weather_response = get_weather(city)
    weather_data = weather_response['data']
    
    # Calculate sunlight availability factor
    sunlight_factor = calculate_sunlight_factor(weather_data)
    
    # Calculate solar generation
    # Formula: Generation = Capacity × Sunlight Factor × Efficiency × Random Variation
    random_variation = random.uniform(0.95, 1.05)  # ±5% variation for realism
    solar_generation = solar_capacity * sunlight_factor * efficiency * random_variation
    
    # Ensure non-negative
    solar_generation = max(0, solar_generation)
    
    return round(solar_generation, 2), weather_data, round(sunlight_factor * 100, 1)

def get_time_factor():
    """
    Calculate solar generation factor based on time of day
    Solar generation follows a sine curve (0 at night, peak at noon)
    """
    current_hour = datetime.now().hour
    # Solar generation is 0 from 6 PM to 6 AM, peaks at noon
    if current_hour < 6 or current_hour > 18:
        return 0
    # Use sine wave for realistic solar curve
    time_normalized = (current_hour - 6) / 12  # Normalize to 0-1
    return math.sin(time_normalized * math.pi)

def generate_wind_power():
    """
    Generate realistic wind power output in kW
    Wind is more random and can generate at night
    """
    base_capacity = 5  # 5 kW wind turbine
    wind_speed = random.uniform(0.3, 1.0)  # Wind speed variation
    wind_power = base_capacity * wind_speed
    return round(wind_power, 2)

@app.route('/api/energy', methods=['GET'])
def get_energy_data():
    """
    Main API endpoint - Returns comprehensive energy system status
    Uses real weather data and realistic solar simulation
    """
    global battery_level
    
    # Get realistic solar generation based on weather
    solar, weather_data, sunlight_level = calculate_realistic_solar_generation(
        system_config['city'],
        system_config['solar_capacity'],
        system_config['panel_efficiency']
    )
    
    # Wind generation (optional, can be disabled)
    wind = generate_wind_power()
    total_generation = solar + wind
    
    # Simulate consumption with some variation
    consumption = round(system_config['consumption_base'] * random.uniform(0.8, 1.2), 2)
    
    # Calculate battery level based on generation vs consumption
    net_power = total_generation - consumption
    battery_change = (net_power / system_config['battery_size']) * 100 * 0.05  # 5% per cycle
    
    battery_level = max(0, min(100, battery_level + battery_change))
    battery_level = round(battery_level, 1)
    
    # Calculate efficiency (affected by temperature)
    temperature = weather_data['temperature']
    base_efficiency = system_config['panel_efficiency'] * 100
    temp_loss = max(0, (temperature - 25) * 0.5)  # Efficiency drops with heat
    efficiency = round(base_efficiency - temp_loss, 1)
    
    # Grid usage
    grid_import = max(0, consumption - total_generation) if consumption > total_generation else 0
    grid_export = max(0, total_generation - consumption) if total_generation > consumption else 0
    
    # CO2 saved (0.92 kg per kWh)
    co2_saved = round(total_generation * 0.92, 2)
    
    # Savings in rupees (₹8 per kWh saved)
    savings = round(total_generation * 8, 2)
    
    # Panel voltage and status
    panel_voltage = round(random.uniform(380, 420), 1)
    panel_temp = round(temperature + random.uniform(5, 15), 1)
    
    # Performance score (0-100)
    performance = round((efficiency + (battery_level * 0.3) + (min(total_generation, system_config['solar_capacity']) * 5)) / 2, 1)
    
    # Battery status
    if battery_level > 80:
        battery_status = 'Charging'
    elif battery_level > 20:
        battery_status = 'Optimal'
    else:
        battery_status = 'Low'
    
    # Backup time calculation (hours)
    backup_time = round((battery_level / 100) * (system_config['battery_size'] / consumption), 1)
    
    timestamp = datetime.now().strftime('%H:%M:%S')
    
    data = {
        'solar_generation': solar,
        'wind_generation': wind,
        'total_generation': round(total_generation, 2),
        'consumption': consumption,
        'battery': battery_level,
        'battery_status': battery_status,
        'backup_time': backup_time,
        'temperature': weather_data['temperature'],
        'efficiency': efficiency,
        'co2_saved': co2_saved,
        'savings': savings,
        'timestamp': timestamp,
        'grid_import': round(grid_import, 2),
        'grid_export': round(grid_export, 2),
        'panel_voltage': panel_voltage,
        'panel_temperature': panel_temp,
        'performance_score': performance,
        'weather': weather_data['weather'],
        'weather_description': weather_data['description'],
        'sunlight_level': sunlight_level,
        'clouds': weather_data['clouds'],
        'humidity': weather_data['humidity'],
        'wind_speed': weather_data['wind_speed'],
        'city': weather_data['city'],
        'weather_icon': get_weather_icon_emoji(weather_data['icon'])
    }
    
    # Store in history (keep last 30 readings)
    energy_history.append(data)
    if len(energy_history) > 30:
        energy_history.pop(0)
    
    return jsonify(data)

@app.route('/api/config', methods=['GET'])
def get_config():
    """
    Get current system configuration
    """
    return jsonify({
        'success': True,
        'config': system_config
    })

@app.route('/api/config', methods=['POST'])
def update_config():
    """
    Update system configuration
    Allows user to change city, solar capacity, battery size, efficiency
    """
    global system_config
    
    data = request.get_json()
    
    # Update configuration with provided values
    if 'city' in data:
        system_config['city'] = data['city']
    if 'solar_capacity' in data:
        system_config['solar_capacity'] = float(data['solar_capacity'])
    if 'battery_size' in data:
        system_config['battery_size'] = float(data['battery_size'])
    if 'panel_efficiency' in data:
        system_config['panel_efficiency'] = float(data['panel_efficiency'])
    if 'consumption_base' in data:
        system_config['consumption_base'] = float(data['consumption_base'])
    
    return jsonify({
        'success': True,
        'message': 'Configuration updated successfully',
        'config': system_config
    })

@app.route('/api/weather', methods=['GET'])
def get_weather_data():
    """
    Get real-time weather data for a specific city
    Query parameter: city (optional, defaults to system config city)
    """
    city = request.args.get('city', system_config['city'])
    
    weather_response = get_weather(city)
    
    if weather_response['success']:
        weather_data = weather_response['data']
        weather_data['sunlight_factor'] = calculate_sunlight_factor(weather_data)
        weather_data['icon_emoji'] = get_weather_icon_emoji(weather_data['icon'])
        
        return jsonify({
            'success': True,
            'weather': weather_data
        })
    else:
        return jsonify({
            'success': False,
            'error': weather_response['error'],
            'weather': weather_response['data']
        }), 500

@app.route('/api/optimization', methods=['GET'])
def get_optimization():
    """
    Returns smart optimization suggestions
    """
    hour = datetime.now().hour
    
    # Time-based recommendations
    if 10 <= hour <= 14:
        tip = "Peak solar hours! Run washing machine, dishwasher, or charge EVs now"
        priority = "high"
    elif 6 <= hour <= 10:
        tip = "Morning sun rising. Good time to charge battery for evening use"
        priority = "medium"
    elif 15 <= hour <= 18:
        tip = "Solar declining. Switch to battery power for evening loads"
        priority = "medium"
    else:
        tip = "Night mode. Using battery power. Grid import minimized"
        priority = "low"
    
    # Get current data
    if energy_history:
        current = energy_history[-1]
        battery = current['battery']
        
        if battery > 90:
            battery_tip = "Battery full. Consider exporting to grid for extra income"
        elif battery < 30:
            battery_tip = "Battery low. Reduce non-essential loads"
        else:
            battery_tip = "Battery level optimal. System running efficiently"
    else:
        battery_tip = "System initializing..."
    
    # Timeline data for optimization page
    timeline = [
        {
            'time': '06:00 - 10:00',
            'period': 'Morning',
            'solar': 'Rising',
            'recommendation': 'Light loads, charge battery',
            'icon': '🌅'
        },
        {
            'time': '10:00 - 14:00',
            'period': 'Peak Hours',
            'solar': 'Maximum',
            'recommendation': 'Run heavy appliances, AC, washing machine',
            'icon': '☀️'
        },
        {
            'time': '14:00 - 18:00',
            'period': 'Afternoon',
            'solar': 'Declining',
            'recommendation': 'Moderate loads, prepare battery',
            'icon': '🌤️'
        },
        {
            'time': '18:00 - 22:00',
            'period': 'Evening',
            'solar': 'None',
            'recommendation': 'Use battery, minimize grid import',
            'icon': '🌙'
        },
        {
            'time': '22:00 - 06:00',
            'period': 'Night',
            'solar': 'None',
            'recommendation': 'Essential loads only, sleep mode',
            'icon': '🌃'
        }
    ]
    
    return jsonify({
        'current_tip': tip,
        'priority': priority,
        'battery_tip': battery_tip,
        'timeline': timeline,
        'tips': random.sample(optimization_tips, 3)
    })

@app.route('/api/history', methods=['GET'])
def get_history():
    """
    Returns recent energy history for charts
    """
    return jsonify(energy_history)

@app.route('/api/prediction', methods=['GET'])
def get_prediction():
    """
    Predict solar output for next 24 hours
    Uses mathematical model based on time of day
    """
    predictions = []
    current_time = datetime.now()
    
    for i in range(24):
        future_time = current_time + timedelta(hours=i)
        hour = future_time.hour
        
        # Calculate predicted solar output
        if hour < 6 or hour > 18:
            predicted_solar = 0
        else:
            time_normalized = (hour - 6) / 12
            base_output = 10 * math.sin(time_normalized * math.pi)
            # Add slight random variation
            predicted_solar = round(base_output * random.uniform(0.85, 0.95), 2)
        
        predictions.append({
            'hour': future_time.strftime('%H:00'),
            'predicted_solar': predicted_solar,
            'predicted_wind': round(random.uniform(1.5, 4.5), 2)
        })
    
    return jsonify(predictions)

@app.route('/api/monthly', methods=['GET'])
def get_monthly_data():
    """
    Returns monthly energy generation data
    Simulates 30 days of data
    """
    monthly_data = []
    
    for day in range(1, 31):
        # Average daily generation with some variation
        daily_solar = round(random.uniform(40, 70), 2)  # kWh per day
        daily_wind = round(random.uniform(20, 40), 2)   # kWh per day
        daily_consumption = round(random.uniform(50, 80), 2)
        
        monthly_data.append({
            'day': day,
            'solar': daily_solar,
            'wind': daily_wind,
            'consumption': daily_consumption,
            'total': round(daily_solar + daily_wind, 2)
        })
    
    return jsonify(monthly_data)

@app.route('/api/calculate-solar', methods=['POST'])
def calculate_solar_system():
    """
    Solar system calculator
    Calculates required panels, battery, and costs based on daily load
    """
    from flask import request
    
    data = request.get_json()
    daily_load = float(data.get('daily_load', 10))  # kWh per day
    
    # Calculations
    # Assume 5 peak sun hours per day
    peak_sun_hours = 5
    system_size = daily_load / peak_sun_hours  # kW
    
    # Number of panels (assuming 400W panels)
    panel_wattage = 0.4  # kW
    num_panels = math.ceil(system_size / panel_wattage)
    
    # Battery size (2 days backup)
    battery_capacity = daily_load * 2  # kWh
    
    # Cost estimation (approximate)
    panel_cost = num_panels * 200  # $200 per panel
    battery_cost = battery_capacity * 300  # $300 per kWh
    inverter_cost = system_size * 500  # $500 per kW
    installation_cost = (panel_cost + battery_cost + inverter_cost) * 0.2
    
    total_cost = panel_cost + battery_cost + inverter_cost + installation_cost
    
    # Annual savings (assuming $0.12 per kWh)
    annual_savings = daily_load * 365 * 0.12
    payback_period = total_cost / annual_savings
    
    result = {
        'system_size_kw': round(system_size, 2),
        'num_panels': num_panels,
        'battery_capacity_kwh': round(battery_capacity, 2),
        'total_cost': round(total_cost, 2),
        'annual_savings': round(annual_savings, 2),
        'payback_period_years': round(payback_period, 1),
        'co2_reduction_kg_year': round(daily_load * 365 * 0.92, 2)
    }
    
    return jsonify(result)

@app.route('/api/login', methods=['POST'])
def login():
    """
    Simple login endpoint for demo purposes
    """
    from flask import request
    
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    # Simple authentication (for demo only)
    if username == 'admin' and password == 'admin123':
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'token': 'demo-token-12345'
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid credentials'
        }), 401

@app.route('/', methods=['GET'])
def home():
    """
    API home endpoint
    """
    return jsonify({
        'message': 'Renewable Energy Monitoring API',
        'version': '1.0',
        'endpoints': [
            '/api/energy',
            '/api/history',
            '/api/prediction',
            '/api/monthly',
            '/api/calculate-solar',
            '/api/login'
        ]
    })

if __name__ == '__main__':
    print("🌞 Renewable Energy Monitoring API Server")
    print("📡 Server running on http://localhost:5000")
    print("🔌 Endpoints available:")
    print("   - GET  /api/energy")
    print("   - GET  /api/history")
    print("   - GET  /api/prediction")
    print("   - GET  /api/monthly")
    print("   - POST /api/calculate-solar")
    print("   - POST /api/login")
    app.run(debug=True, port=5000)

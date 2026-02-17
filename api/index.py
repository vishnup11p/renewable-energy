"""
Vercel Serverless API Handler
Smart Renewable Energy Optimization & Monitoring Dashboard Backend
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
CORS(app)

# In-memory storage (replaces SQLite for serverless)
_storage = {
    'config': {
        'city': 'Mumbai',
        'solar_capacity': 10,
        'battery_size': 10,
        'panel_efficiency': 0.85,
        'consumption_base': 5,
        'weather_api_key': None
    },
    'energy_logs': [],
    'initialized': False
}

def get_config():
    """Get system configuration."""
    return _storage['config']

def update_config(data):
    """Update system configuration."""
    if 'city' in data:
        _storage['config']['city'] = data['city']
    if 'solar_capacity' in data:
        _storage['config']['solar_capacity'] = float(data['solar_capacity'])
    if 'battery_size' in data:
        _storage['config']['battery_size'] = float(data['battery_size'])
    if 'panel_efficiency' in data:
        _storage['config']['panel_efficiency'] = float(data['panel_efficiency'])
    if 'consumption_base' in data:
        _storage['config']['consumption_base'] = float(data['consumption_base'])
    if 'weather_api_key' in data:
        _storage['config']['weather_api_key'] = data['weather_api_key']
    return _storage['config']

def seed_history_data():
    """Seed 30 days of hourly energy history (only once)."""
    if _storage['initialized'] or len(_storage['energy_logs']) > 0:
        return
    
    config = get_config()
    current_time = datetime.now() - timedelta(days=30)
    battery = 50.0
    
    for _ in range(30 * 24):
        month = current_time.month
        hour = current_time.hour
        
        # Simulate weather
        is_monsoon = 6 <= month <= 9
        base_temp = 30 - (5 if is_monsoon else 0) + (5 if 10 <= hour <= 15 else 0)
        temp = base_temp + random.uniform(-2, 2)
        
        if is_monsoon and random.random() < 0.4:
            weather = "Rain"
            clouds = random.uniform(70, 100)
        elif random.random() < 0.2:
            weather = "Clouds"
            clouds = random.uniform(30, 80)
        else:
            weather = "Clear"
            clouds = random.uniform(0, 20)
        
        # Solar Gen
        if 6 <= hour <= 18:
            time_factor = math.sin(((hour - 6) / 12) * math.pi)
            cloud_factor = 1.0 - (clouds / 100 * 0.7)
            solar = config['solar_capacity'] * time_factor * cloud_factor * config['panel_efficiency']
        else:
            solar = 0.0
        
        # Wind Gen
        wind = 5.0 * random.uniform(0.1, 0.8)
        total_gen = solar + wind
        
        # Consumption
        base_cons = config['consumption_base']
        usage_factor = 1.5 if (7 <= hour <= 10 or 18 <= hour <= 21) else 0.8
        consumption = base_cons * usage_factor * random.uniform(0.8, 1.2)
        
        # Battery Physics
        net = total_gen - consumption
        battery_change = (net / config['battery_size']) * 100
        battery = max(0, min(100, battery + battery_change))
        
        # Grid
        import_kw = max(0, consumption - total_gen) if battery < 5 else 0
        export_kw = max(0, total_gen - consumption) if battery > 95 else 0
        
        log = {
            'timestamp': current_time,
            'solar_generation': round(solar, 2),
            'wind_generation': round(wind, 2),
            'total_generation': round(total_gen, 2),
            'consumption': round(consumption, 2),
            'battery_level': round(battery, 1),
            'grid_import': round(import_kw, 2),
            'grid_export': round(export_kw, 2),
            'efficiency': round(config['panel_efficiency'] * 100 - max(0, (temp - 25) * 0.5), 1),
            'temperature': round(temp, 1),
            'weather_desc': weather
        }
        _storage['energy_logs'].append(log)
        current_time += timedelta(hours=1)
    
    _storage['initialized'] = True

optimization_tips = [
    "Run heavy appliances between 11 AM - 2 PM for maximum solar usage",
    "Battery is at optimal level. Consider exporting excess to grid",
    "Weather forecast shows cloudy afternoon. Charge battery now",
    "Peak efficiency detected. Great time for high-power tasks",
    "Grid rates are high. Switch to battery power for savings"
]

def calculate_current_state():
    """Calculates one realtime data point."""
    config = get_config()
    
    # Get last log for battery continuity
    last_log = _storage['energy_logs'][-1] if _storage['energy_logs'] else None
    current_battery = last_log['battery_level'] if last_log else 50.0
    
    # Weather
    api_key = config.get('weather_api_key')
    weather_response = get_weather(config['city'], api_key)
    weather_data = weather_response['data']
    
    sunlight_factor = calculate_sunlight_factor(weather_data)
    
    # Solar Gen
    random_variation = random.uniform(0.95, 1.05)
    solar = config['solar_capacity'] * sunlight_factor * config['panel_efficiency'] * random_variation
    solar = max(0, round(solar, 2))
    
    # Wind Gen
    wind = round(5.0 * random.uniform(0.1, 0.6), 2)
    total_gen = round(solar + wind, 2)
    
    # Consumption
    consumption = round(config['consumption_base'] * random.uniform(0.8, 1.2), 2)
    
    # Battery Update
    net_power = total_gen - consumption
    battery_change = (net_power / config['battery_size']) * 0.1
    new_battery = max(0, min(100, current_battery + battery_change))
    
    # Grid
    grid_import = max(0, consumption - total_gen) if total_gen < consumption and new_battery < 5 else 0
    grid_export = max(0, total_gen - consumption) if total_gen > consumption and new_battery > 95 else 0
    
    # Efficiency
    temp = weather_data['temperature']
    base_eff = config['panel_efficiency'] * 100
    eff = round(base_eff - max(0, (temp - 25) * 0.5), 1)
    
    # Create Log
    new_log = {
        'timestamp': datetime.now(),
        'solar_generation': solar,
        'wind_generation': wind,
        'total_generation': total_gen,
        'consumption': consumption,
        'battery_level': round(new_battery, 1),
        'grid_import': round(grid_import, 2),
        'grid_export': round(grid_export, 2),
        'efficiency': eff,
        'temperature': temp,
        'weather_desc': weather_data['weather']
    }
    
    # Keep only last 1000 logs to prevent memory issues
    _storage['energy_logs'].append(new_log)
    if len(_storage['energy_logs']) > 1000:
        _storage['energy_logs'] = _storage['energy_logs'][-1000:]
    
    return new_log, weather_data, sunlight_factor

# Initialize on first import
seed_history_data()

@app.route('/api/energy', methods=['GET'])
def get_energy_data():
    """Main API endpoint - Returns comprehensive energy system status"""
    log, weather_data, sunlight_factor = calculate_current_state()
    config = get_config()
    
    # Derived metrics
    co2 = round(log['total_generation'] * 0.92, 2)
    savings = round(log['total_generation'] * 8, 2)
    
    # Performance score
    perf = round((log['efficiency'] + (log['battery_level'] * 0.3) + (min(log['total_generation'], config['solar_capacity']) * 5)) / 2, 1)
    
    battery_status = 'Optimal'
    if log['battery_level'] > 80:
        battery_status = 'Charging'
    elif log['battery_level'] < 20:
        battery_status = 'Low'
    
    backup_time = round((log['battery_level'] / 100) * (config['battery_size'] / max(0.1, log['consumption'])), 1)
    
    data = {
        'solar_generation': log['solar_generation'],
        'wind_generation': log['wind_generation'],
        'total_generation': log['total_generation'],
        'consumption': log['consumption'],
        'battery': log['battery_level'],
        'battery_status': battery_status,
        'backup_time': backup_time,
        'temperature': log['temperature'],
        'efficiency': log['efficiency'],
        'co2_saved': co2,
        'savings': savings,
        'timestamp': log['timestamp'].strftime('%H:%M:%S'),
        'grid_import': log['grid_import'],
        'grid_export': log['grid_export'],
        'panel_voltage': round(random.uniform(380, 420), 1),
        'panel_temperature': round(log['temperature'] + random.uniform(5, 15), 1),
        'performance_score': perf,
        'weather': weather_data['weather'],
        'weather_description': weather_data['description'],
        'sunlight_level': round(sunlight_factor * 100, 1),
        'clouds': weather_data['clouds'],
        'humidity': weather_data['humidity'],
        'wind_speed': weather_data['wind_speed'],
        'city': weather_data['city'],
        'weather_icon': get_weather_icon_emoji(weather_data['icon'])
    }
    return jsonify(data)

@app.route('/api/config', methods=['GET'])
def get_config_endpoint():
    config = get_config()
    return jsonify({
        'success': True,
        'config': {
            'city': config['city'],
            'solar_capacity': config['solar_capacity'],
            'battery_size': config['battery_size'],
            'panel_efficiency': config['panel_efficiency'],
            'consumption_base': config['consumption_base'],
            'weather_api_key': config.get('weather_api_key') or ''
        }
    })

@app.route('/api/config', methods=['POST'])
def update_config_endpoint():
    data = request.get_json()
    update_config(data)
    return jsonify({'success': True, 'message': 'Configuration updated successfully'})

@app.route('/api/weather', methods=['GET'])
def get_weather_endpoint():
    config = get_config()
    city = request.args.get('city', config['city'])
    
    weather_response = get_weather(city, config.get('weather_api_key'))
    
    if weather_response['success']:
        weather_data = weather_response['data']
        weather_data['sunlight_factor'] = calculate_sunlight_factor(weather_data)
        weather_data['icon_emoji'] = get_weather_icon_emoji(weather_data['icon'])
        return jsonify({'success': True, 'weather': weather_data})
    else:
        return jsonify({'success': False, 'error': weather_response.get('error'), 'weather': weather_response['data']}), 500

@app.route('/api/history', methods=['GET'])
def get_history_endpoint():
    logs = _storage['energy_logs'][-50:] if len(_storage['energy_logs']) > 50 else _storage['energy_logs']
    history_data = []
    for log in logs:
        history_data.append({
            'timestamp': log['timestamp'].strftime('%H:%M:%S'),
            'solar_generation': log['solar_generation'],
            'wind_generation': log['wind_generation'],
            'total_generation': log['total_generation'],
            'consumption': log['consumption'],
            'battery': log['battery_level'],
            'temperature': log['temperature'],
            'efficiency': log['efficiency']
        })
    return jsonify(history_data)

@app.route('/api/monthly', methods=['GET'])
def get_monthly_endpoint():
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    
    logs = [log for log in _storage['energy_logs'] if log['timestamp'] >= start_date]
    
    daily_map = {}
    for log in logs:
        day_str = log['timestamp'].strftime('%Y-%m-%d')
        if day_str not in daily_map:
            daily_map[day_str] = {'solar': 0, 'wind': 0, 'cons': 0, 'count': 0}
        
        daily_map[day_str]['solar'] += log['solar_generation']
        daily_map[day_str]['wind'] += log['wind_generation']
        daily_map[day_str]['cons'] += log['consumption']
        daily_map[day_str]['count'] += 1
    
    monthly_data = []
    for day in sorted(daily_map.keys()):
        d = daily_map[day]
        avg_solar = d['solar'] / d['count'] if d['count'] > 0 else 0
        avg_wind = d['wind'] / d['count'] if d['count'] > 0 else 0
        avg_cons = d['cons'] / d['count'] if d['count'] > 0 else 0
        
        monthly_data.append({
            'day': datetime.strptime(day, '%Y-%m-%d').day,
            'solar': round(avg_solar * 24, 2),
            'wind': round(avg_wind * 24, 2),
            'consumption': round(avg_cons * 24, 2),
            'total': round((avg_solar + avg_wind) * 24, 2)
        })
    
    return jsonify(monthly_data)

@app.route('/api/optimization', methods=['GET'])
def get_optimization_endpoint():
    hour = datetime.now().hour
    
    if 10 <= hour <= 14:
        tip, priority = "Peak solar hours! Run heavy loads now.", "high"
    elif 6 <= hour <= 10:
        tip, priority = "Morning sun. Charge battery.", "medium"
    elif 15 <= hour <= 18:
        tip, priority = "Solar declining. Prepare for evening.", "medium"
    else:
        tip, priority = "Night time. Minimal grid usage.", "low"
    
    last_log = _storage['energy_logs'][-1] if _storage['energy_logs'] else None
    bat = last_log['battery_level'] if last_log else 50
    
    bat_tip = "Battery optimal."
    if bat > 90:
        bat_tip = "Battery full. Exporting recommended."
    elif bat < 30:
        bat_tip = "Battery low. Conserve energy."

    timeline = [
        {'time': '06-10', 'period': 'Morning', 'solar': 'Rising', 'recommendation': 'Charge Battery', 'icon': '🌅'},
        {'time': '10-14', 'period': 'Peak', 'solar': 'Max', 'recommendation': 'Heavy Loads', 'icon': '☀️'},
        {'time': '14-18', 'period': 'Afternoon', 'solar': 'Declining', 'recommendation': 'Moderate Usage', 'icon': '🌤️'},
        {'time': '18-22', 'period': 'Evening', 'solar': 'None', 'recommendation': 'Battery Power', 'icon': '🌙'},
        {'time': '22-06', 'period': 'Night', 'solar': 'None', 'recommendation': 'Sleep Mode', 'icon': '🌃'},
    ]
    
    return jsonify({
        'current_tip': tip,
        'priority': priority,
        'battery_tip': bat_tip,
        'timeline': timeline,
        'tips': random.sample(optimization_tips, 3)
    })

@app.route('/api/prediction', methods=['GET'])
def get_prediction_endpoint():
    predictions = []
    current_time = datetime.now()
    for i in range(24):
        future_time = current_time + timedelta(hours=i)
        h = future_time.hour
        if 6 <= h <= 18:
            norm = (h - 6) / 12
            base = 10 * math.sin(norm * math.pi)
            pred = round(base * random.uniform(0.8, 1.0), 2)
        else:
            pred = 0
        
        predictions.append({
            'hour': future_time.strftime('%H:00'),
            'predicted_solar': pred,
            'predicted_wind': round(random.uniform(1, 4), 2)
        })
    return jsonify(predictions)

@app.route('/api/calculate-solar', methods=['POST'])
def calculate_solar_endpoint():
    data = request.get_json()
    load = float(data.get('daily_load', 10))
    
    size = load / 5
    panels = math.ceil(size / 0.4)
    bat = load * 2
    cost = (panels*200) + (bat*300) + (size*500)
    cost *= 1.2
    
    return jsonify({
        'system_size_kw': round(size, 2),
        'num_panels': panels,
        'battery_capacity_kwh': round(bat, 2),
        'total_cost': round(cost, 2),
        'annual_savings': round(load * 365 * 0.12, 2),
        'payback_period_years': round(cost / (load*365*0.12), 1),
        'co2_reduction_kg_year': round(load * 365 * 0.92, 2)
    })

@app.route('/api/login', methods=['POST'])
def login_endpoint():
    data = request.get_json()
    if data.get('username') == 'admin' and data.get('password') == 'admin123':
        return jsonify({'success': True, 'token': 'demo-token'})
    return jsonify({'success': False}), 401

# Export Flask app for Vercel
# Vercel automatically detects Flask apps when 'app' is exported

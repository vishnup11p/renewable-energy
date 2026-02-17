"""
Smart Renewable Energy Optimization & Monitoring Dashboard - Backend API
Realistic solar monitoring with real weather data integration
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import math
import random
from datetime import datetime, timedelta
import sys
import os

# Add services directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'services'))
from weather_service import get_weather, calculate_sunlight_factor, get_weather_icon_emoji

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///energy.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
CORS(app)  # Enable CORS for frontend communication
db = SQLAlchemy(app)


# --- Models ---
class EnergyLog(db.Model):
    __tablename__ = 'energy_log'
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, nullable=False)
    solar_generation = db.Column(db.Float, default=0)
    wind_generation = db.Column(db.Float, default=0)
    total_generation = db.Column(db.Float, default=0)
    consumption = db.Column(db.Float, default=0)
    battery_level = db.Column(db.Float, default=50)
    grid_import = db.Column(db.Float, default=0)
    grid_export = db.Column(db.Float, default=0)
    efficiency = db.Column(db.Float, default=0)
    temperature = db.Column(db.Float, default=0)
    weather_desc = db.Column(db.String(64), default='Clear')


class SystemConfig(db.Model):
    __tablename__ = 'system_config'
    id = db.Column(db.Integer, primary_key=True)
    city = db.Column(db.String(128), default='Mumbai')
    solar_capacity = db.Column(db.Float, default=10)
    battery_size = db.Column(db.Float, default=10)
    panel_efficiency = db.Column(db.Float, default=0.85)
    consumption_base = db.Column(db.Float, default=5)
    weather_api_key = db.Column(db.String(256), default=None)


def get_config_from_db():
    """Get or create the single system config row."""
    config = SystemConfig.query.first()
    if config is None:
        config = SystemConfig(
            city='Mumbai',
            solar_capacity=10,
            battery_size=10,
            panel_efficiency=0.85,
            consumption_base=5
        )
        db.session.add(config)
        db.session.commit()
    return config


def seed_history_data():
    """Seed 30 days of hourly energy history for charts (only if empty)."""
    if EnergyLog.query.first() is not None:
        return
    config = get_config_from_db()
    current_time = datetime.now() - timedelta(days=30)
    battery = 50.0
    for _ in range(30 * 24):
        month = current_time.month
        hour = current_time.hour
        # Simulate weather based on season (basic approximation)
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
            solar = config.solar_capacity * time_factor * cloud_factor * config.panel_efficiency
        else:
            solar = 0.0
        # Wind Gen
        wind = 5.0 * random.uniform(0.1, 0.8)
        total_gen = solar + wind
        # Consumption
        base_cons = config.consumption_base
        usage_factor = 1.5 if (7 <= hour <= 10 or 18 <= hour <= 21) else 0.8
        consumption = base_cons * usage_factor * random.uniform(0.8, 1.2)
        # Battery Physics
        net = total_gen - consumption
        battery_change = (net / config.battery_size) * 100
        battery = max(0, min(100, battery + battery_change))
        # Grid
        import_kw = max(0, consumption - total_gen) if battery < 5 else 0
        export_kw = max(0, total_gen - consumption) if battery > 95 else 0
        log = EnergyLog(
            timestamp=current_time,
            solar_generation=round(solar, 2),
            wind_generation=round(wind, 2),
            total_generation=round(total_gen, 2),
            consumption=round(consumption, 2),
            battery_level=round(battery, 1),
            grid_import=round(import_kw, 2),
            grid_export=round(export_kw, 2),
            efficiency=round(config.panel_efficiency * 100 - max(0, (temp - 25) * 0.5), 1),
            temperature=round(temp, 1),
            weather_desc=weather
        )
        db.session.add(log)
        current_time += timedelta(hours=1)
    db.session.commit()
    print("Seeded 30 days of history!")


optimization_tips = [
    "Run heavy appliances between 11 AM - 2 PM for maximum solar usage",
    "Battery is at optimal level. Consider exporting excess to grid",
    "Weather forecast shows cloudy afternoon. Charge battery now",
    "Peak efficiency detected. Great time for high-power tasks",
    "Grid rates are high. Switch to battery power for savings"
]

def calculate_current_state():
    """Calculates one realtime data point and saves to DB"""
    config = get_config_from_db()
    
    # Get last log for battery continuity
    last_log = EnergyLog.query.order_by(EnergyLog.timestamp.desc()).first()
    current_battery = last_log.battery_level if last_log else 50.0
    
    # Weather
    # Pass API key if available
    api_key = config.weather_api_key
    weather_response = get_weather(config.city, api_key)
    weather_data = weather_response['data']
    
    sunlight_factor = calculate_sunlight_factor(weather_data)
    
    # Solar Gen
    random_variation = random.uniform(0.95, 1.05)
    solar = config.solar_capacity * sunlight_factor * config.panel_efficiency * random_variation
    solar = max(0, round(solar, 2))
    
    # Wind Gen
    wind = round(5.0 * random.uniform(0.1, 0.6), 2)
    total_gen = round(solar + wind, 2)
    
    # Consumption
    consumption = round(config.consumption_base * random.uniform(0.8, 1.2), 2)
    
    # Battery Update
    net_power = total_gen - consumption
    # Simulate 5% capacity change per hour equivalent update (since we update every few secs, this logic is simplified for realtime feel)
    # Ideally should be: (net_power / capacity) * (time_delta_in_hours)
    # We'll just nudge it slightly for the realtime effect
    battery_change = (net_power / config.battery_size) * 0.1 
    new_battery = max(0, min(100, current_battery + battery_change))
    
    # Grid
    grid_import = max(0, consumption - total_gen) if total_gen < consumption and new_battery < 5 else 0
    grid_export = max(0, total_gen - consumption) if total_gen > consumption and new_battery > 95 else 0
    
    # Efficiency
    temp = weather_data['temperature']
    base_eff = config.panel_efficiency * 100
    eff = round(base_eff - max(0, (temp - 25) * 0.5), 1)
    
    # Create Log
    new_log = EnergyLog(
        timestamp=datetime.now(),
        solar_generation=solar,
        wind_generation=wind,
        total_generation=total_gen,
        consumption=consumption,
        battery_level=round(new_battery, 1),
        grid_import=round(grid_import, 2),
        grid_export=round(grid_export, 2),
        efficiency=eff,
        temperature=temp,
        weather_desc=weather_data['weather']
    )
    db.session.add(new_log)
    db.session.commit()
    
    return new_log, weather_data, sunlight_factor

@app.route('/api/energy', methods=['GET'])
def get_energy_data():
    """Main API endpoint - Returns comprehensive energy system status"""
    log, weather_data, sunlight_factor = calculate_current_state()
    config = get_config_from_db()
    
    # Derived metrics
    co2 = round(log.total_generation * 0.92, 2)
    savings = round(log.total_generation * 8, 2)
    
    # Performance score
    perf = round((log.efficiency + (log.battery_level * 0.3) + (min(log.total_generation, config.solar_capacity) * 5)) / 2, 1)
    
    battery_status = 'Optimal'
    if log.battery_level > 80: battery_status = 'Charging'
    elif log.battery_level < 20: battery_status = 'Low'
    
    backup_time = round((log.battery_level / 100) * (config.battery_size / max(0.1, log.consumption)), 1)
    
    data = {
        'solar_generation': log.solar_generation,
        'wind_generation': log.wind_generation,
        'total_generation': log.total_generation,
        'consumption': log.consumption,
        'battery': log.battery_level,
        'battery_status': battery_status,
        'backup_time': backup_time,
        'temperature': log.temperature,
        'efficiency': log.efficiency,
        'co2_saved': co2,
        'savings': savings,
        'timestamp': log.timestamp.strftime('%H:%M:%S'),
        'grid_import': log.grid_import,
        'grid_export': log.grid_export,
        'panel_voltage': round(random.uniform(380, 420), 1),
        'panel_temperature': round(log.temperature + random.uniform(5, 15), 1),
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
    config = get_config_from_db()
    return jsonify({
        'success': True,
        'config': {
            'city': config.city,
            'solar_capacity': config.solar_capacity,
            'battery_size': config.battery_size,
            'panel_efficiency': config.panel_efficiency,
            'consumption_base': config.consumption_base,
            'weather_api_key': config.weather_api_key or ''
        }
    })

@app.route('/api/config', methods=['POST'])
def update_config_endpoint():
    data = request.get_json()
    config = get_config_from_db()
    
    if 'city' in data: config.city = data['city']
    if 'solar_capacity' in data: config.solar_capacity = float(data['solar_capacity'])
    if 'battery_size' in data: config.battery_size = float(data['battery_size'])
    if 'panel_efficiency' in data: config.panel_efficiency = float(data['panel_efficiency'])
    if 'consumption_base' in data: config.consumption_base = float(data['consumption_base'])
    if 'weather_api_key' in data: config.weather_api_key = data['weather_api_key']
    
    db.session.commit()
    return jsonify({'success': True, 'message': 'Configuration updated successfully'})

@app.route('/api/weather', methods=['GET'])
def get_weather_endpoint():
    config = get_config_from_db()
    city = request.args.get('city', config.city)
    
    # Use stored API key
    weather_response = get_weather(city, config.weather_api_key)
    
    if weather_response['success']:
        weather_data = weather_response['data']
        # Recalculate sunlight for this specific weather check
        weather_data['sunlight_factor'] = calculate_sunlight_factor(weather_data)
        weather_data['icon_emoji'] = get_weather_icon_emoji(weather_data['icon'])
        return jsonify({'success': True, 'weather': weather_data})
    else:
        return jsonify({'success': False, 'error': weather_response.get('error'), 'weather': weather_response['data']}), 500

@app.route('/api/history', methods=['GET'])
def get_history_endpoint():
    # Return last 50 entries
    logs = EnergyLog.query.order_by(EnergyLog.timestamp.desc()).limit(50).all()
    # Reverse to show chronological order for charts
    history_data = []
    for log in reversed(logs):
        history_data.append({
            'timestamp': log.timestamp.strftime('%H:%M:%S'),
            'solar_generation': log.solar_generation,
            'wind_generation': log.wind_generation,
            'total_generation': log.total_generation,
            'consumption': log.consumption,
            'battery': log.battery_level,
            'temperature': log.temperature,
            'efficiency': log.efficiency
        })
    return jsonify(history_data)

@app.route('/api/monthly', methods=['GET'])
def get_monthly_endpoint():
    # Aggregate data by day for the last 30 days
    # Since specific daily aggregation query might be complex in raw SQL/ORM for this quick setup,
    # we'll fetch all hourly logs and aggregate in python or just take daily snapshots if we had them.
    # For now, let's take one reading per day from the logs we seeded/have.
    
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    
    # Simple approach: Fetch all logs in range and aggregate by day
    logs = EnergyLog.query.filter(EnergyLog.timestamp >= start_date).all()
    
    daily_map = {}
    for log in logs:
        day_str = log.timestamp.strftime('%Y-%m-%d')
        if day_str not in daily_map:
            daily_map[day_str] = {'solar': 0, 'wind': 0, 'cons': 0, 'count': 0}
        
        daily_map[day_str]['solar'] += log.solar_generation
        daily_map[day_str]['wind'] += log.wind_generation
        daily_map[day_str]['cons'] += log.consumption
        daily_map[day_str]['count'] += 1
    
    monthly_data = []
    # Sort keys
    for day in sorted(daily_map.keys()):
        d = daily_map[day]
        # Average power (kW) * 24h = Energy (kWh) approx? 
        # Actually our logs are hourly in seed, so sum of kW happens to be kWh approximately if sampled hourly.
        # But if we have multiple samples per hour, we need to average power then multiply by 24?
        # Let's just assume the sum of samples / samples * 24 roughly.
        
        avg_solar = d['solar'] / d['count']
        avg_wind = d['wind'] / d['count']
        avg_cons = d['cons'] / d['count']
        
        monthly_data.append({
            'day': datetime.strptime(day, '%Y-%m-%d').day,
            'solar': round(avg_solar * 24, 2), # kWh
            'wind': round(avg_wind * 24, 2),
            'consumption': round(avg_cons * 24, 2),
            'total': round((avg_solar + avg_wind) * 24, 2)
        })
        
    return jsonify(monthly_data)

@app.route('/api/optimization', methods=['GET'])
def get_optimization_endpoint():
    hour = datetime.now().hour
    
    # Logic similar to before
    if 10 <= hour <= 14:
        tip, priority = "Peak solar hours! Run heavy loads now.", "high"
    elif 6 <= hour <= 10:
        tip, priority = "Morning sun. Charge battery.", "medium"
    elif 15 <= hour <= 18:
        tip, priority = "Solar declining. Prepare for evening.", "medium"
    else:
        tip, priority = "Night time. Minimal grid usage.", "low"
        
    log = EnergyLog.query.order_by(EnergyLog.timestamp.desc()).first()
    bat = log.battery_level if log else 50
    
    bat_tip = "Battery optimal."
    if bat > 90: bat_tip = "Battery full. Exporting recommended."
    elif bat < 30: bat_tip = "Battery low. Conserve energy."

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
    # Simple prediction based on time
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
    
    # logic ...
    size = load / 5
    panels = math.ceil(size / 0.4)
    bat = load * 2
    cost = (panels*200) + (bat*300) + (size*500)
    cost *= 1.2 # install
    
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

# --- Init ---

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        seed_history_data()
        
    print("Server running with SQLite persistence on http://127.0.0.1:5000")
    app.run(debug=True, port=5000)


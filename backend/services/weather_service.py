"""
Weather Service - Real-time weather data integration
Fetches live weather data from Open-Meteo API (Free, No Key Required)
"""

import requests
from datetime import datetime

# Open-Meteo APIs
GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
WEATHER_URL = "https://api.open-meteo.com/v1/forecast"

def get_lat_lon(city):
    """
    Geocode city name to latitude/longitude using Open-Meteo Geocoding API
    """
    try:
        # Default to India context if not specified, but API handles standard cities well
        params = {'name': city, 'count': 1, 'format': 'json'}
        response = requests.get(GEOCODING_URL, params=params, timeout=5)
        data = response.json()
        
        if 'results' in data and data['results']:
            result = data['results'][0]
            return result['latitude'], result['longitude'], result['name'], result.get('country', '')
            
    except Exception as e:
        print(f"Geocoding Error: {e}")
        
    return None, None, city, None

def get_weather(city, api_key=None):
    """
    Fetch real-time weather data for a given city using Open-Meteo
    api_key param is preserved for interface compatibility but ignored
    """
    
    # 1. Resolve City to Lat/Lon
    lat, lon, resolved_name, country = get_lat_lon(city)
    
    if not lat:
         return {
            'success': False,
            'error': f"City '{city}' not found",
            'data': get_fallback_weather(city)
        }

    try:
        # 2. Fetch Weather Data
        params = {
            'latitude': lat,
            'longitude': lon,
            'current': 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m',
            'daily': 'sunrise,sunset',
            'timezone': 'auto'
        }
        
        response = requests.get(WEATHER_URL, params=params, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        current = data['current']
        daily = data['daily']
        
        # 3. Parse and Map Data
        wmo_code = current['weather_code']
        is_day = current['is_day']
        weather_info = get_wmo_info(wmo_code, is_day)
        
        # Parse sunrise/sunset (ISO 8601 format)
        sunrise_ts = int(datetime.fromisoformat(daily['sunrise'][0]).timestamp())
        sunset_ts = int(datetime.fromisoformat(daily['sunset'][0]).timestamp())
        
        weather_data = {
            'city': resolved_name,
            'temperature': round(current['temperature_2m'], 1),
            'feels_like': round(current['apparent_temperature'], 1),
            'humidity': current['relative_humidity_2m'],
            'clouds': current['cloud_cover'],
            'weather': weather_info['main'],
            'description': weather_info['description'],
            'wind_speed': round(current['wind_speed_10m'], 1),
            'sunrise': sunrise_ts,
            'sunset': sunset_ts,
            'visibility': 10.0, # Not provided by free tier, default to 10km
            'pressure': round(current['pressure_msl']),
            'icon': weather_info['icon']
        }

        return {
            'success': True,
            'data': weather_data
        }

    except requests.exceptions.RequestException as e:
        print(f"Weather API Error: {e}")
        return {
            'success': False,
            'error': str(e),
            'data': get_fallback_weather(city)
        }

def get_wmo_info(code, is_day):
    """
    Map WMO Weather Codes to OpenWeatherMap-style descriptions and icons
    Source: https://open-meteo.com/en/docs
    """
    prefix = 'd' if is_day else 'n'
    
    # Default
    info = {'main': 'Clear', 'description': 'clear sky', 'icon': f'01{prefix}'}
    
    # WMO Code Mapping
    if code == 0:
        info = {'main': 'Clear', 'description': 'clear sky', 'icon': f'01{prefix}'}
    elif code in [1, 2, 3]:
        info = {'main': 'Clouds', 'description': 'partly cloudy', 'icon': f'02{prefix}'}
    elif code in [45, 48]:
        info = {'main': 'Mist', 'description': 'foggy', 'icon': f'50{prefix}'}
    elif code in [51, 53, 55]:
        info = {'main': 'Drizzle', 'description': 'light drizzle', 'icon': f'09{prefix}'}
    elif code in [56, 57]:
        info = {'main': 'Drizzle', 'description': 'freezing drizzle', 'icon': f'09{prefix}'}
    elif code in [61, 63, 65]:
        info = {'main': 'Rain', 'description': 'rain', 'icon': f'10{prefix}'}
    elif code in [66, 67]:
        info = {'main': 'Rain', 'description': 'freezing rain', 'icon': f'10{prefix}'}
    elif code in [71, 73, 75, 77]:
        info = {'main': 'Snow', 'description': 'snowfall', 'icon': f'13{prefix}'}
    elif code in [80, 81, 82]:
        info = {'main': 'Rain', 'description': 'rain showers', 'icon': f'09{prefix}'}
    elif code in [85, 86]:
        info = {'main': 'Snow', 'description': 'snow showers', 'icon': f'13{prefix}'}
    elif code in [95, 96, 99]:
        info = {'main': 'Thunderstorm', 'description': 'thunderstorm', 'icon': f'11{prefix}'}
        
    return info

def get_fallback_weather(city):
    """
    Provide fallback weather data when API is unavailable
    Uses reasonable defaults for Indian cities based on time of day
    """
    hour = datetime.now().hour
    
    # Simple temperature curve
    if 12 <= hour <= 15: temp = 32.0; weather='Clear'; desc='sunny'
    elif 10 <= hour < 12: temp = 30.0; weather='Clear'; desc='clear sky'
    elif 15 < hour <= 18: temp = 29.0; weather='Clouds'; desc='partly cloudy'
    elif 6 <= hour < 10: temp = 26.0; weather='Mist'; desc='haze'
    else: temp = 24.0; weather='Clear'; desc='clear night'
    
    return {
        'city': city,
        'temperature': temp,
        'feels_like': temp + 2,
        'humidity': 65,
        'clouds': 20,
        'weather': weather,
        'description': desc,
        'wind_speed': 3.5,
        'sunrise': int(datetime.now().replace(hour=6, minute=0).timestamp()),
        'sunset': int(datetime.now().replace(hour=18, minute=30).timestamp()),
        'visibility': 10,
        'pressure': 1013,
        'icon': '01d' if 6 <= hour <= 18 else '01n'
    }

def calculate_sunlight_factor(weather_data):
    """
    Calculate sunlight availability factor (0-1) based on weather conditions
    """
    # Check if it's daytime
    current_time = datetime.now().timestamp()
    sunrise = weather_data['sunrise']
    sunset = weather_data['sunset']
    
    if current_time < sunrise or current_time > sunset:
        return 0.0  # Night time, no sunlight
    
    # Base sunlight factor
    base_factor = 1.0
    
    # Reduce based on cloud coverage
    cloud_percent = weather_data['clouds']
    cloud_factor = 1 - (cloud_percent / 100) * 0.7  # Clouds reduce up to 70%
    
    # Reduce based on weather conditions
    weather_condition = weather_data['weather'].lower()
    if 'rain' in weather_condition or 'storm' in weather_condition:
        weather_factor = 0.3  # Heavy reduction for rain
    elif 'drizzle' in weather_condition:
        weather_factor = 0.5
    elif 'snow' in weather_condition:
        weather_factor = 0.4
    elif 'mist' in weather_condition or 'fog' in weather_condition:
        weather_factor = 0.6
    else:
        weather_factor = 1.0
    
    # Calculate time-of-day factor (peak at solar noon)
    # Simple sine wave approximation between sunrise and sunset
    day_duration = sunset - sunrise
    if day_duration <= 0: return 0
    
    time_since_sunrise = current_time - sunrise
    progress = time_since_sunrise / day_duration
    
    import math
    time_factor = math.sin(progress * math.pi)
    
    # Combine all factors
    sunlight_factor = base_factor * cloud_factor * weather_factor * time_factor
    
    return max(0.0, min(1.0, sunlight_factor))  # Clamp between 0 and 1

def get_weather_icon_emoji(icon_code):
    """
    Convert OpenWeatherMap icon code to emoji
    """
    icon_map = {
        '01d': '☀️',  # clear sky day
        '01n': '🌙',  # clear sky night
        '02d': '⛅',  # few clouds day
        '02n': '☁️',  # few clouds night
        '03d': '☁️',  # scattered clouds
        '03n': '☁️',
        '04d': '☁️',  # broken clouds
        '04n': '☁️',
        '09d': '🌧️',  # shower rain
        '09n': '🌧️',
        '10d': '🌦️',  # rain day
        '10n': '🌧️',  # rain night
        '11d': '⛈️',  # thunderstorm
        '11n': '⛈️',
        '13d': '🌨️',  # snow
        '13n': '🌨️',
        '50d': '🌫️',  # mist
        '50n': '🌫️'
    }
    return icon_map.get(icon_code, '🌤️')

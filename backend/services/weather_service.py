"""
Weather Service - Real-time weather data integration
Fetches live weather data from OpenWeatherMap API
"""

import requests
from datetime import datetime

# OpenWeatherMap API Configuration
API_KEY = "PASTE_YOUR_API_KEY_HERE"  # Get free API key from: https://openweathermap.org/api
BASE_URL = "http://api.openweathermap.org/data/2.5/weather"

def get_weather(city):
    """
    Fetch real-time weather data for a given city
    
    Args:
        city (str): City name (e.g., "Mumbai", "Delhi", "Bangalore")
    
    Returns:
        dict: Weather data including temperature, clouds, conditions, sunrise, sunset
    """
    try:
        # Build API request
        params = {
            'q': city,
            'appid': API_KEY,
            'units': 'metric'  # Use Celsius
        }
        
        # Make API call
        response = requests.get(BASE_URL, params=params, timeout=5)
        response.raise_for_status()
        
        data = response.json()
        
        # Extract relevant weather information
        weather_data = {
            'city': data['name'],
            'temperature': round(data['main']['temp'], 1),
            'feels_like': round(data['main']['feels_like'], 1),
            'humidity': data['main']['humidity'],
            'clouds': data['clouds']['all'],  # Cloud coverage percentage (0-100)
            'weather': data['weather'][0]['main'],  # e.g., "Clear", "Clouds", "Rain"
            'description': data['weather'][0]['description'],  # e.g., "clear sky", "few clouds"
            'wind_speed': data['wind']['speed'],
            'sunrise': data['sys']['sunrise'],  # Unix timestamp
            'sunset': data['sys']['sunset'],    # Unix timestamp
            'visibility': data.get('visibility', 10000) / 1000,  # Convert to km
            'pressure': data['main']['pressure'],
            'icon': data['weather'][0]['icon']
        }
        
        return {
            'success': True,
            'data': weather_data
        }
        
    except requests.exceptions.RequestException as e:
        print(f"Weather API Error: {e}")
        # Return fallback data if API fails
        return {
            'success': False,
            'error': str(e),
            'data': get_fallback_weather(city)
        }

def get_fallback_weather(city):
    """
    Provide fallback weather data when API is unavailable
    Uses reasonable defaults for Indian cities
    """
    return {
        'city': city,
        'temperature': 28.0,
        'feels_like': 30.0,
        'humidity': 65,
        'clouds': 20,
        'weather': 'Clear',
        'description': 'clear sky',
        'wind_speed': 3.5,
        'sunrise': int(datetime.now().replace(hour=6, minute=0).timestamp()),
        'sunset': int(datetime.now().replace(hour=18, minute=30).timestamp()),
        'visibility': 10,
        'pressure': 1013,
        'icon': '01d'
    }

def calculate_sunlight_factor(weather_data):
    """
    Calculate sunlight availability factor (0-1) based on weather conditions
    
    Args:
        weather_data (dict): Weather data from get_weather()
    
    Returns:
        float: Sunlight factor between 0 and 1
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
    time_since_sunrise = (current_time - sunrise) / (sunset - sunrise)
    # Use sine curve for realistic solar intensity throughout the day
    import math
    time_factor = math.sin(time_since_sunrise * math.pi)
    
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

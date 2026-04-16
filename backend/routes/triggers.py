import os

import requests
from dotenv import load_dotenv
from fastapi import APIRouter

load_dotenv()

router = APIRouter()

CITIES = {
    "Mumbai": {"lat": 19.0760, "lon": 72.8777, "zones": ["Andheri", "Bandra", "Dadar", "Kurla", "Borivali"]},
    "Chennai": {"lat": 13.0827, "lon": 80.2707, "zones": ["T.Nagar", "Adyar", "Velachery", "Tambaram", "Anna Nagar"]},
    "Delhi": {"lat": 28.6139, "lon": 77.2090, "zones": ["Dwarka", "Rohini", "Lajpat Nagar", "Saket", "Janakpuri"]},
    "Bengaluru": {"lat": 12.9716, "lon": 77.5946, "zones": ["Koramangala", "Indiranagar", "Whitefield", "HSR Layout", "Marathahalli"]},
    "Hyderabad": {"lat": 17.3850, "lon": 78.4867, "zones": ["Hitech City", "Banjara Hills", "Gachibowli", "Madhapur", "Kondapur"]},
}

THRESHOLDS = {
    "rainfall": 35,
    "temperature": 42,
    "aqi": 350,
    "wind_speed": 60,
}


def get_weather(lat, lon):
    api_key = os.getenv("WEATHER_API_KEY", "demo")
    if api_key == "demo" or api_key == "your_openweathermap_api_key":
        return {
            "rain": {"1h": 12},
            "main": {"temp": 38, "humidity": 85},
            "wind": {"speed": 20},
            "weather": [{"description": "moderate rain"}],
            "mock": True,
        }
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
        response = requests.get(url, timeout=5)
        return response.json()
    except Exception:
        return None


def get_aqi(lat, lon):
    return {"aqi": 280, "mock": True}


@router.get("/status")
def get_all_trigger_status():
    results = {}
    for city, coords in CITIES.items():
        weather = get_weather(coords["lat"], coords["lon"])
        aqi_data = get_aqi(coords["lat"], coords["lon"])

        rainfall = weather.get("rain", {}).get("1h", 0) if weather else 0
        temperature = weather.get("main", {}).get("temp", 30) if weather else 30
        aqi = aqi_data.get("aqi", 100)

        results[city] = {
            "city": city,
            "zones": coords["zones"],
            "readings": {
                "rainfall_mm": rainfall,
                "temperature_c": temperature,
                "aqi": aqi,
            },
            "triggers": {
                "heavy_rain": rainfall >= THRESHOLDS["rainfall"],
                "extreme_heat": temperature >= THRESHOLDS["temperature"],
                "severe_aqi": aqi >= THRESHOLDS["aqi"],
                "flood_alert": False,
                "bandh_strike": False,
                "night_curfew": False,
                "app_downtime": False,
            },
            "any_active": (
                rainfall >= THRESHOLDS["rainfall"]
                or temperature >= THRESHOLDS["temperature"]
                or aqi >= THRESHOLDS["aqi"]
            ),
            "mock_data": weather.get("mock", False),
        }

    return {"status": "ok", "cities": results}


@router.get("/status/{city}")
def get_city_trigger_status(city: str):
    if city not in CITIES:
        return {"error": f"City {city} not supported"}

    coords = CITIES[city]
    weather = get_weather(coords["lat"], coords["lon"])
    aqi_data = get_aqi(coords["lat"], coords["lon"])

    rainfall = weather.get("rain", {}).get("1h", 0) if weather else 0
    temperature = weather.get("main", {}).get("temp", 30) if weather else 30
    aqi = aqi_data.get("aqi", 100)

    return {
        "city": city,
        "readings": {
            "rainfall_mm": rainfall,
            "temperature_c": temperature,
            "aqi": aqi,
        },
        "triggers": {
            "heavy_rain": {"active": rainfall >= THRESHOLDS["rainfall"], "reading": f"{rainfall}mm/hr", "threshold": f">{THRESHOLDS['rainfall']}mm/hr"},
            "extreme_heat": {"active": temperature >= THRESHOLDS["temperature"], "reading": f"{temperature}°C", "threshold": f">{THRESHOLDS['temperature']}°C"},
            "severe_aqi": {"active": aqi >= THRESHOLDS["aqi"], "reading": str(aqi), "threshold": f">{THRESHOLDS['aqi']}"},
            "flood_alert": {"active": False, "reading": "No alert", "threshold": "IMD flood alert"},
            "bandh_strike": {"active": False, "reading": "No bandh", "threshold": "Verified notification"},
            "night_curfew": {"active": False, "reading": "No curfew", "threshold": "Post 10pm restriction"},
            "app_downtime": {"active": False, "reading": "Apps operational", "threshold": "2+ hour outage"},
        },
    }


@router.post("/simulate/{city}/{trigger_type}")
def simulate_trigger(city: str, trigger_type: str):
    valid_triggers = [
        "heavy_rain",
        "extreme_heat",
        "severe_aqi",
        "flood_alert",
        "bandh_strike",
        "night_curfew",
        "app_downtime",
    ]
    if trigger_type not in valid_triggers:
        return {"error": f"Unknown trigger type: {trigger_type}"}

    trigger_readings = {
        "heavy_rain": {"reading": "52mm/hr", "threshold": ">35mm/hr"},
        "extreme_heat": {"reading": "44°C for 3hrs", "threshold": ">42°C 2hrs"},
        "severe_aqi": {"reading": "AQI 410", "threshold": ">350"},
        "flood_alert": {"reading": "IMD Red Alert", "threshold": "Flood zone activated"},
        "bandh_strike": {"reading": "Verified bandh", "threshold": "Govt. notification"},
        "night_curfew": {"reading": "Curfew after 10pm", "threshold": "Post 10pm restriction"},
        "app_downtime": {"reading": "App down 3hrs", "threshold": "2+ hour outage"},
    }

    return {
        "success": True,
        "city": city,
        "trigger_type": trigger_type,
        "active": True,
        "reading": trigger_readings[trigger_type]["reading"],
        "threshold": trigger_readings[trigger_type]["threshold"],
        "message": f"{trigger_type.replace('_', ' ').title()} trigger activated in {city}",
        "next_step": "claim_initiation",
    }

from models.forecast import forecaster

@router.get("/forecast/{city}")
def get_disruption_forecast(city: str):
    if city not in CITIES:
        return {"error": f"City {city} not supported"}
        
    forecast_data = forecaster.get_7_day_forecast(city)
    
    return {
        "success": True,
        "city": city,
        "model": "Prophet",
        "forecast": forecast_data
    }

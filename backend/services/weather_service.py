import httpx
from datetime import datetime, timezone
from config import settings
from db import get_db
from models.search import (
    WeatherSnapshot,
    CurrentWeatherResponse,
    ForecastResponse,
    ForecastDay,
)

HEADERS = {"User-Agent": "SkylineWeatherApp/1.0 (contact@example.com)"}
GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"


async def geocode_city(city: str) -> tuple[float, float, str, str]:
    """Convert city name to lat/lon using Open-Meteo geocoding (free, no key)."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(GEOCODE_URL, params={
            "name": city, "count": 1, "language": "en", "format": "json"
        })
        resp.raise_for_status()
        data = resp.json()

    results = data.get("results")
    if not results:
        raise ValueError(f"City '{city}' not found.")

    r = results[0]
    lat = r["latitude"]
    lon = r["longitude"]
    city_name = r.get("name", city)
    country = r.get("country_code", "US").upper()

    if country != "US":
        raise ValueError(
            f"'{city}' is not in the United States. "
            f"weather.gov only covers US cities."
        )

    return lat, lon, city_name, country


async def get_grid_info(lat: float, lon: float) -> dict:
    async with httpx.AsyncClient(timeout=10.0, headers=HEADERS) as client:
        resp = await client.get(
            f"{settings.weather_base_url}/points/{lat:.4f},{lon:.4f}"
        )
        resp.raise_for_status()
        data = resp.json()
    return data["properties"]


def _to_celsius(value, unit_code: str = "unit:degC") -> float:
    if value is None:
        return 0.0
    if "degF" in str(unit_code):
        return round((value - 32) * 5 / 9, 1)
    return round(float(value), 1)


def _wind_to_ms(value) -> float:
    if value is None:
        return 0.0
    return round(float(value) * 0.44704, 1)


def _map_condition(text: str) -> str:
    t = text.lower()
    if "thunderstorm" in t: return "Thunderstorm"
    if "snow" in t or "blizzard" in t: return "Snow"
    if "rain" in t or "shower" in t: return "Rain"
    if "drizzle" in t: return "Drizzle"
    if "fog" in t or "mist" in t: return "Fog"
    if "cloudy" in t or "overcast" in t: return "Clouds"
    if "clear" in t or "sunny" in t: return "Clear"
    if "wind" in t: return "Windy"
    return "Clear"


async def fetch_current_weather(city: str) -> CurrentWeatherResponse:
    lat, lon, city_name, state = await geocode_city(city)
    grid = await get_grid_info(lat, lon)

    observation_stations_url = grid["observationStations"]
    city_name = grid.get("relativeLocation", {}).get("properties", {}).get("city", city_name)
    state = grid.get("relativeLocation", {}).get("properties", {}).get("state", state)

    async with httpx.AsyncClient(timeout=10.0, headers=HEADERS) as client:
        st_resp = await client.get(observation_stations_url)
        st_resp.raise_for_status()
        station_id = st_resp.json()["features"][0]["properties"]["stationIdentifier"]

    async with httpx.AsyncClient(timeout=10.0, headers=HEADERS) as client:
        obs_resp = await client.get(
            f"{settings.weather_base_url}/stations/{station_id}/observations/latest"
        )
        obs_resp.raise_for_status()
        obs = obs_resp.json()["properties"]

    temp_c = _to_celsius(
        obs.get("temperature", {}).get("value"),
        obs.get("temperature", {}).get("unitCode", "unit:degC"),
    )
    feels_raw = obs.get("windChill", {}).get("value") or obs.get("heatIndex", {}).get("value")
    feels_c = _to_celsius(
        feels_raw, obs.get("windChill", {}).get("unitCode", "unit:degC")
    ) if feels_raw else temp_c
    wind_ms = _wind_to_ms(obs.get("windSpeed", {}).get("value"))
    humidity = int(obs.get("relativeHumidity", {}).get("value") or 0)
    visibility_m = obs.get("visibility", {}).get("value")
    short_desc = obs.get("textDescription", "Clear")

    snapshot = WeatherSnapshot(
        temp=temp_c,
        feels_like=feels_c,
        temp_min=temp_c,
        temp_max=temp_c,
        humidity=humidity,
        condition=_map_condition(short_desc),
        description=short_desc,
        icon="",
        wind_speed=wind_ms,
        visibility=int(visibility_m) if visibility_m else None,
    )

    result = CurrentWeatherResponse(
        city=city_name, country=state, lat=lat, lon=lon,
        weather=snapshot, timezone=0,
        dt=int(datetime.now(timezone.utc).timestamp()),
    )
    await save_search_history(city_name, state, snapshot)
    return result


async def fetch_forecast(city: str) -> ForecastResponse:
    lat, lon, city_name, state = await geocode_city(city)
    grid = await get_grid_info(lat, lon)

    forecast_url = grid["forecast"]
    city_name = grid.get("relativeLocation", {}).get("properties", {}).get("city", city_name)
    state = grid.get("relativeLocation", {}).get("properties", {}).get("state", state)

    async with httpx.AsyncClient(timeout=10.0, headers=HEADERS) as client:
        resp = await client.get(forecast_url)
        resp.raise_for_status()
        periods = resp.json()["properties"]["periods"]

    days: dict = {}
    for period in periods:
        date_str = period["startTime"][:10]
        if date_str not in days:
            days[date_str] = {
                "temps": [], "conditions": [], "descs": [], "winds": [], "pop": []
            }
        d = days[date_str]
        temp_f = period.get("temperature", 32)
        d["temps"].append(round((temp_f - 32) * 5 / 9, 1))
        d["conditions"].append(_map_condition(period.get("shortForecast", "")))
        d["descs"].append(period.get("shortForecast", ""))
        wind_str = period.get("windSpeed", "0 mph").split()[0]
        try:
            d["winds"].append(_wind_to_ms(float(wind_str)))
        except ValueError:
            d["winds"].append(0.0)
        pop = period.get("probabilityOfPrecipitation", {}).get("value") or 0
        d["pop"].append(pop)

    forecast_days = []
    for date_str, d in list(days.items())[:7]:
        condition = max(set(d["conditions"]), key=d["conditions"].count)
        max_pop = max(d["pop"])
        forecast_days.append(ForecastDay(
            date=date_str,
            temp_min=min(d["temps"]),
            temp_max=max(d["temps"]),
            condition=condition,
            description=d["descs"][0],
            icon="",
            humidity=0,
            wind_speed=round(sum(d["winds"]) / len(d["winds"]), 1),
            pop=round(max_pop / 100, 2) if max_pop > 1 else round(max_pop, 2),
        ))

    return ForecastResponse(city=city_name, country=state, forecast=forecast_days)


async def save_search_history(city: str, country: str, snapshot: WeatherSnapshot):
    db = get_db()
    await db.search_history.insert_one({
        "city": city,
        "country": country,
        "queried_at": datetime.now(timezone.utc),
        "weather_snapshot": snapshot.model_dump(),
    })


async def get_search_history(limit: int = 20) -> list[dict]:
    db = get_db()
    cursor = db.search_history.find(
        {}, {"_id": 1, "city": 1, "country": 1, "queried_at": 1, "weather_snapshot": 1}
    ).sort("queried_at", -1).limit(limit)
    results = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        results.append(doc)
    return results


async def delete_history_entry(entry_id: str) -> bool:
    from bson import ObjectId
    db = get_db()
    result = await db.search_history.delete_one({"_id": ObjectId(entry_id)})
    return result.deleted_count > 0


async def clear_all_history() -> int:
    db = get_db()
    result = await db.search_history.delete_many({})
    return result.deleted_count
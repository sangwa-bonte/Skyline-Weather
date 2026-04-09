from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from bson import ObjectId


class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return str(v)


class WeatherSnapshot(BaseModel):
    temp: float
    feels_like: float
    temp_min: float
    temp_max: float
    humidity: int
    condition: str
    description: str
    icon: str
    wind_speed: float
    visibility: Optional[int] = None


class SearchHistoryCreate(BaseModel):
    city: str
    country: str
    weather_snapshot: WeatherSnapshot


class SearchHistoryResponse(BaseModel):
    id: str
    city: str
    country: str
    queried_at: datetime
    weather_snapshot: WeatherSnapshot

    class Config:
        populate_by_name = True


class CurrentWeatherResponse(BaseModel):
    city: str
    country: str
    lat: float
    lon: float
    weather: WeatherSnapshot
    timezone: int
    dt: int


class ForecastDay(BaseModel):
    date: str
    temp_min: float
    temp_max: float
    condition: str
    description: str
    icon: str
    humidity: int
    wind_speed: float
    pop: float  # probability of precipitation


class ForecastResponse(BaseModel):
    city: str
    country: str
    forecast: list[ForecastDay]

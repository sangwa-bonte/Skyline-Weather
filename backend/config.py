from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongo_uri: str = "mongodb://localhost:27017"
    db_name: str = "weather_app"
    weather_base_url: str = "https://api.weather.gov"
    geocode_base_url: str = "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

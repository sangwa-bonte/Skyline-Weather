from fastapi import APIRouter, HTTPException, Query
from services.weather_service import fetch_current_weather, fetch_forecast
import httpx

router = APIRouter()


@router.get("/current")
async def get_current_weather(city: str = Query(..., description="City name")):
    try:
        data = await fetch_current_weather(city)
        return data
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(status_code=404, detail=f"City '{city}' not found")
        raise HTTPException(status_code=502, detail="Weather API error")
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Weather API timeout")


@router.get("/forecast")
async def get_forecast(city: str = Query(..., description="City name")):
    try:
        data = await fetch_forecast(city)
        return data
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(status_code=404, detail=f"City '{city}' not found")
        raise HTTPException(status_code=502, detail="Weather API error")
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Weather API timeout")

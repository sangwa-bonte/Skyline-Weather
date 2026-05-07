# Skyline — Weather App

A full-stack weather application built with **FastAPI**, **MongoDB**, and **React**. Uses the **weather.gov API** (completely free, no API key required) for weather data, and **Open-Meteo geocoding** to resolve city names to coordinates.

> ⚠️ **Skyline weather only covers US cities.** Searching for cities outside the United States will return a clear error message.

---

## Features

- 🔍 Search any US city by name
- 🌡️ Current weather conditions (temperature, humidity, wind, visibility)
- 📅 7-day forecast with daily summaries
- 🕓 Search history persisted in MongoDB
- 🗑️ Delete individual or all history entries
- 📱 Responsive dark UI with smooth animations

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 18, React Query, Axios, Vite              |
| Backend   | FastAPI, Pydantic, httpx, Motor                 |
| Database  | MongoDB (via Motor async driver)                |
| Weather   | weather.gov API (free, no key)                  |
| Geocoding | Open-Meteo Geocoding API (free, no key)         |
| Container | Docker, docker-compose, Nginx                   |

---

## How the Weather API Works

Since weather.gov doesn't accept city names directly, the backend uses a 3-step process:

```
City name
   → Open-Meteo Geocoding API → lat/lon
   → weather.gov /points/{lat},{lon} → grid metadata + station list
   → Nearest observation station → current weather & forecast
```
 
No API keys needed anywhere in this flow.

---

## Project Structure

```
weather-app/
├── backend/
│   ├── main.py                  # FastAPI app, CORS, lifespan
│   ├── config.py                # Settings loaded from .env
│   ├── db.py                    # Motor async MongoDB connection
│   ├── routes/
│   │   ├── weather.py           # GET /weather/current, /weather/forecast
│   │   └── history.py           # GET/DELETE /history
│   ├── services/
│   │   └── weather_service.py   # Geocoding + weather.gov logic + MongoDB ops
│   ├── models/
│   │   └── search.py            # Pydantic request/response models
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Root layout and state
│   │   ├── components/
│   │   │   ├── SearchBar.jsx    # City search input
│   │   │   ├── WeatherCard.jsx  # Current weather display
│   │   │   ├── ForecastPanel.jsx# 7-day forecast grid
│   │   │   ├── HistoryPanel.jsx # Search history from MongoDB
│   │   │   └── ErrorMessage.jsx # Error display
│   │   ├── hooks/
│   │   │   └── useWeather.js    # React Query hooks
│   │   └── services/
│   │       └── api.js           # Axios instance
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vite.config.js
└── docker-compose.yml
```

---

## Local Development Setup

### Prerequisites

- Python 3.12+
- Node.js 20+
- MongoDB running locally (or via Docker)

### 1. Start MongoDB

```bash
docker run -d -p 27017:27017 --name weather_mongo mongo:7
```

### 2. Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows

# Install dependencies (pinned for compatibility)
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# No API keys needed — .env only has MongoDB connection settings

# Start the server
uvicorn main:app --reload --port 8000
```

API docs available at [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at [http://localhost:5173](http://localhost:5173)

---

## Docker Setup (Recommended)

Runs MongoDB, FastAPI, and React all at once — no manual setup needed.

```bash
docker-compose up --build
```

Then open [http://localhost:5173](http://localhost:5173)

---

## Environment Variables

Copy `.env.example` to `.env` in the `backend/` folder. No API keys required.

```env
MONGO_URI=mongodb://localhost:27017
DB_NAME=weather_app
WEATHER_BASE_URL=https://api.weather.gov
GEOCODE_BASE_URL=https://geocoding.geo.census.gov/geocoder/locations/onelineaddress
```

> Never commit `.env` — it is already in `.gitignore`.

---

## API Endpoints

| Method | Endpoint                      | Description                          |
|--------|-------------------------------|--------------------------------------|
| GET    | `/api/weather/current?city=`  | Current weather + auto-saves history |
| GET    | `/api/weather/forecast?city=` | 7-day forecast                       |
| GET    | `/api/history?limit=20`       | Fetch search history from MongoDB    |
| DELETE | `/api/history/{id}`           | Delete one history entry             |
| DELETE | `/api/history`                | Clear all history                    |

---

## Common Issues & Fixes

**`ImportError: cannot import name '_QUERY_OPTIONS'`**

Motor and PyMongo version mismatch. Fix with:
```bash
pip uninstall motor pymongo -y
pip install motor==3.3.2 pymongo==4.6.3
```

**`[Errno 98] Address already in use`**

Port 8000 is occupied by a previous process. Kill it:
```bash
pkill -f "uvicorn main:app"
# or find and kill manually:
lsof -i :8000
kill -9 <PID>
```

**`sh: vite: not found`**

You haven't installed frontend dependencies yet:
```bash
cd frontend && npm install
```

**City not found / non-US city error**

weather.gov only covers US locations. Search for US cities like `New York`, `Chicago`, `Los Angeles`, `Miami`, etc.

---

## Deployment Notes

- The frontend Dockerfile builds a production React bundle served by Nginx
- Nginx proxies `/api/` requests to the FastAPI backend
- For production, set `MONGO_URI` to your hosted MongoDB connection string (e.g. MongoDB Atlas)
- Update the `CORS` origins in `backend/main.py` to match your production domain

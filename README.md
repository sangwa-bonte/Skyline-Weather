# Skyline — Weather App

A full-stack weather application built with **FastAPI**, **MongoDB**, and **React**.

## Features

- Current weather conditions for any city
- 7-day forecast with daily summaries
- Search history persisted in MongoDB
- Delete individual or all history entries
- Responsive dark UI with real-time data

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, React Query, Axios, Vite  |
| Backend   | FastAPI, Pydantic, httpx            |
| Database  | MongoDB (via Motor async driver)    |
| Container | Docker, docker-compose, Nginx       |

---

## Quick Start (Docker)

1. **Get a free API key** from [openweathermap.org](https://openweathermap.org/api)

2. **Clone and configure:**
   ```bash
   git clone <your-repo>
   cd weather-app
   cp backend/.env.example backend/.env
   # Edit backend/.env and set WEATHER_API_KEY=your_key_here
   ```

3. **Run everything:**
   ```bash
   WEATHER_API_KEY=your_key docker-compose up --build
   ```

4. **Open** [http://localhost:5173](http://localhost:5173)

---

## Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env with your API key and MongoDB URI

uvicorn main:app --reload --port 8000
```

API docs available at [http://localhost:8000/docs](http://localhost:8000/docs)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at [http://localhost:5173](http://localhost:5173)

### MongoDB

```bash
# Using Docker just for MongoDB:
docker run -d -p 27017:27017 --name weather_mongo mongo:7
```

---

## API Endpoints

| Method   | Endpoint                     | Description                    |
|----------|------------------------------|--------------------------------|
| GET      | `/api/weather/current?city=` | Current weather + saves history|
| GET      | `/api/weather/forecast?city=`| 7-day forecast                 |
| GET      | `/api/history?limit=20`      | Fetch search history           |
| DELETE   | `/api/history/{id}`          | Delete one history entry       |
| DELETE   | `/api/history`               | Clear all history              |

---

## Project Structure

```
weather-app/
├── backend/
│   ├── main.py              # FastAPI app, CORS, lifespan
│   ├── config.py            # Pydantic settings from .env
│   ├── db.py                # Motor async MongoDB connection
│   ├── routes/
│   │   ├── weather.py       # /weather/current, /weather/forecast
│   │   └── history.py       # /history CRUD
│   ├── services/
│   │   └── weather_service.py  # API calls + MongoDB ops
│   ├── models/
│   │   └── search.py        # Pydantic request/response models
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Root layout and state
│   │   ├── components/      # WeatherCard, ForecastPanel, HistoryPanel, SearchBar
│   │   ├── hooks/           # useWeather, useSearchHistory (React Query)
│   │   └── services/        # api.js (Axios instance)
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vite.config.js
└── docker-compose.yml
```

---

## Environment Variables

```env
MONGO_URI=mongodb://localhost:27017
DB_NAME=weather_app
WEATHER_API_KEY=your_openweathermap_api_key
WEATHER_BASE_URL=https://api.openweathermap.org/data/2.5
```

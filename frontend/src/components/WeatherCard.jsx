import { Wind, Droplets, Eye, Thermometer } from 'lucide-react'
import styles from './WeatherCard.module.css'

function getTempColor(temp) {
  if (temp >= 35) return 'var(--temp-hot)'
  if (temp >= 25) return 'var(--temp-warm)'
  if (temp >= 15) return 'var(--temp-mild)'
  if (temp >= 5)  return 'var(--temp-cool)'
  return 'var(--temp-cold)'
}

function getWeatherEmoji(condition) {
  const map = {
    Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️',
    Thunderstorm: '⛈️', Snow: '❄️', Mist: '🌫️', Fog: '🌫️',
    Haze: '🌫️', Smoke: '🌫️', Dust: '🌪️', Sand: '🌪️',
    Ash: '🌋', Squall: '💨', Tornado: '🌪️',
  }
  return map[condition] || '🌡️'
}

export default function WeatherCard({ data }) {
  const { city, country, weather } = data
  const tempColor = getTempColor(weather.temp)
  const emoji = getWeatherEmoji(weather.condition)

  return (
    <div className={styles.card} style={{ '--temp-color': tempColor }}>
      <div className={styles.glow} />

      <div className={styles.header}>
        <div>
          <h2 className={styles.city}>{city}</h2>
          <p className={styles.country}>{country} &mdash; {weather.description}</p>
        </div>
        <span className={styles.emoji}>{emoji}</span>
      </div>

      <div className={styles.tempRow}>
        <span className={styles.temp}>{Math.round(weather.temp)}°</span>
        <div className={styles.tempMeta}>
          <span className={styles.feels}>Feels like {Math.round(weather.feels_like)}°</span>
          <span className={styles.range}>
            {Math.round(weather.temp_min)}° / {Math.round(weather.temp_max)}°
          </span>
        </div>
      </div>

      <div className={styles.stats}>
        <Stat icon={<Wind size={15} />} label="Wind" value={`${weather.wind_speed} m/s`} />
        <Stat icon={<Droplets size={15} />} label="Humidity" value={`${weather.humidity}%`} />
        {weather.visibility && (
          <Stat icon={<Eye size={15} />} label="Visibility" value={`${(weather.visibility / 1000).toFixed(1)} km`} />
        )}
        <Stat icon={<Thermometer size={15} />} label="Condition" value={weather.condition} />
      </div>
    </div>
  )
}

function Stat({ icon, label, value }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statIcon}>{icon}</span>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
  )
}

import { format, parseISO } from 'date-fns'
import { Droplets } from 'lucide-react'
import styles from './ForecastPanel.module.css'

function getTempColor(temp) {
  if (temp >= 35) return 'var(--temp-hot)'
  if (temp >= 25) return 'var(--temp-warm)'
  if (temp >= 15) return 'var(--temp-mild)'
  if (temp >= 5)  return 'var(--temp-cool)'
  return 'var(--temp-cold)'
}

function getConditionEmoji(condition) {
  const map = {
    Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️',
    Thunderstorm: '⛈️', Snow: '❄️', Mist: '🌫️', Fog: '🌫️',
    Haze: '🌫️', Smoke: '🌫️',
  }
  return map[condition] || '🌡️'
}

export default function ForecastPanel({ data }) {
  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>7-Day Forecast</h3>
      <div className={styles.grid}>
        {data.forecast.map((day, i) => (
          <ForecastDay key={day.date} day={day} index={i} />
        ))}
      </div>
    </div>
  )
}

function ForecastDay({ day, index }) {
  const date = parseISO(day.date)
  const isToday = index === 0
  const maxColor = getTempColor(day.temp_max)
  const minColor = getTempColor(day.temp_min)

  return (
    <div
      className={styles.day}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <span className={styles.dayName}>
        {isToday ? 'Today' : format(date, 'EEE')}
      </span>
      <span className={styles.dayDate}>{format(date, 'MMM d')}</span>
      <span className={styles.emoji}>{getConditionEmoji(day.condition)}</span>
      <div className={styles.temps}>
        <span className={styles.maxTemp} style={{ color: maxColor }}>
          {Math.round(day.temp_max)}°
        </span>
        <span className={styles.minTemp} style={{ color: minColor }}>
          {Math.round(day.temp_min)}°
        </span>
      </div>
      {day.pop > 0.1 && (
        <div className={styles.rain}>
          <Droplets size={11} />
          <span>{Math.round(day.pop * 100)}%</span>
        </div>
      )}
    </div>
  )
}

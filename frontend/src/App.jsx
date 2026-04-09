import { useState } from 'react'
import { useCurrentWeather, useForecast } from './hooks/useWeather'
import SearchBar from './components/SearchBar'
import WeatherCard from './components/WeatherCard'
import ForecastPanel from './components/ForecastPanel'
import HistoryPanel from './components/HistoryPanel'
import ErrorMessage from './components/ErrorMessage'
import styles from './App.module.css'

export default function App() {
  const [activeCity, setActiveCity] = useState('')
  const [searchedCity, setSearchedCity] = useState('')

  const {
    data: currentData,
    isLoading: currentLoading,
    error: currentError,
  } = useCurrentWeather(searchedCity)

  const {
    data: forecastData,
    isLoading: forecastLoading,
    error: forecastError,
  } = useForecast(searchedCity)

  const handleSearch = (city) => {
    setActiveCity(city)
    setSearchedCity(city)
  }

  const isLoading = currentLoading || forecastLoading
  const error = currentError || forecastError

  return (
    <div className={styles.app}>
      {/* Ambient background orbs */}
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.orb3} />

      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>◈</span>
            <span className={styles.logoText}>Skyline</span>
          </div>
          <p className={styles.tagline}>Real-time weather intelligence</p>
        </header>

        {/* Search */}
        <div className={styles.searchWrap}>
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Loading shimmer */}
        {isLoading && (
          <div className={styles.shimmerWrap}>
            <div className={styles.shimmer} />
            <div className={styles.shimmer} style={{ height: '160px', animationDelay: '0.1s' }} />
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <ErrorMessage message={error.message} />
        )}

        {/* Weather results */}
        {!isLoading && !error && currentData && (
          <div className={styles.results}>
            <WeatherCard data={currentData} />
            {forecastData && <ForecastPanel data={forecastData} />}
          </div>
        )}

        {/* History (always shown) */}
        <div className={styles.historyWrap}>
          <HistoryPanel onSelect={handleSearch} />
        </div>
      </div>
    </div>
  )
}

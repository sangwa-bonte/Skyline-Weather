import { formatDistanceToNow } from 'date-fns'
import { Clock, X, Trash2, Search } from 'lucide-react'
import { useSearchHistory, useDeleteHistory, useClearHistory } from '../hooks/useWeather'
import styles from './HistoryPanel.module.css'

export default function HistoryPanel({ onSelect }) {
  const { data, isLoading } = useSearchHistory(15)
  const deleteMutation = useDeleteHistory()
  const clearMutation = useClearHistory()

  const history = data?.history || []

  if (isLoading) {
    return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <h3 className={styles.title}>Recent Searches</h3>
        </div>
        <div className={styles.loading}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className={styles.skeleton} style={{ animationDelay: `${i * 80}ms` }} />
          ))}
        </div>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <h3 className={styles.title}>Recent Searches</h3>
        </div>
        <div className={styles.empty}>
          <Search size={28} strokeWidth={1.5} />
          <p>Your search history will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>Recent Searches</h3>
        <button
          className={styles.clearBtn}
          onClick={() => clearMutation.mutate()}
          disabled={clearMutation.isPending}
          title="Clear all history"
        >
          <Trash2 size={13} />
          Clear all
        </button>
      </div>

      <ul className={styles.list}>
        {history.map((item, i) => (
          <li
            key={item.id}
            className={styles.item}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <button
              className={styles.itemMain}
              onClick={() => onSelect(item.city)}
            >
              <div className={styles.itemLeft}>
                <span className={styles.itemCity}>{item.city}</span>
                <span className={styles.itemCountry}>{item.country}</span>
              </div>
              <div className={styles.itemRight}>
                <span className={styles.itemTemp}>
                  {Math.round(item.weather_snapshot.temp)}°
                </span>
                <span className={styles.itemTime}>
                  <Clock size={10} />
                  {formatDistanceToNow(new Date(item.queried_at), { addSuffix: true })}
                </span>
              </div>
            </button>
            <button
              className={styles.deleteBtn}
              onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(item.id) }}
              disabled={deleteMutation.isPending}
              title="Remove"
            >
              <X size={13} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

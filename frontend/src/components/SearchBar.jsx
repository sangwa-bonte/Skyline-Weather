import { useState } from 'react'
import { Search, Loader } from 'lucide-react'
import styles from './SearchBar.module.css'

export default function SearchBar({ onSearch, isLoading }) {
  const [value, setValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (trimmed) onSearch(trimmed)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.wrapper}>
        <Search className={styles.icon} size={18} />
        <input
          className={styles.input}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search any city..."
          disabled={isLoading}
          autoFocus
        />
        <button className={styles.button} type="submit" disabled={isLoading || !value.trim()}>
          {isLoading ? <Loader size={16} className={styles.spinner} /> : 'Search'}
        </button>
      </div>
    </form>
  )
}

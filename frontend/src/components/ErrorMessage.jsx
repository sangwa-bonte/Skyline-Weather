import { AlertTriangle } from 'lucide-react'
import styles from './ErrorMessage.module.css'

export default function ErrorMessage({ message }) {
  return (
    <div className={styles.error}>
      <AlertTriangle size={18} />
      <span>{message || 'Something went wrong. Please try again.'}</span>
    </div>
  )
}

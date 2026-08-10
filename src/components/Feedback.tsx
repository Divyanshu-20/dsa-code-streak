export function Feedback({ message, tone = 'error' }: { message?: string; tone?: 'error' | 'success' }) {
  if (!message) return null
  return (
    <div className={`feedback feedback--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {message}
    </div>
  )
}

export function LoadingScreen() {
  return (
    <div className="loading-screen" role="status">
      <span className="loading-mark" aria-hidden="true">C</span>
      <p>Loading your streak...</p>
    </div>
  )
}

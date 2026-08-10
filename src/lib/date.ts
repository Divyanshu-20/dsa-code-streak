export function localDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function lastSevenDates() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setHours(12, 0, 0, 0)
    date.setDate(date.getDate() - (6 - index))
    return localDateKey(date)
  })
}

export function compactDay(dateKey: string) {
  return new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric' }).format(
    new Date(`${dateKey}T12:00:00`),
  )
}

export function formatTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp))
}

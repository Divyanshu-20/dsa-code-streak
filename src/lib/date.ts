export const COMMUNITY_TIME_ZONE = 'Asia/Kolkata'

const INDIA_OFFSET_MILLISECONDS = 5.5 * 60 * 60 * 1000
const dateKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: COMMUNITY_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

function dateParts(date: Date) {
  const parts = dateKeyFormatter.formatToParts(date)
  const values = new Map(parts.map((part) => [part.type, part.value]))
  return {
    year: Number(values.get('year')),
    month: Number(values.get('month')),
    day: Number(values.get('day')),
  }
}

export function communityDateKey(date = new Date()) {
  const { year, month, day } = dateParts(date)
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function millisecondsUntilNextCommunityMidnight(date = new Date()) {
  const { year, month, day } = dateParts(date)
  const nextMidnightUtc = Date.UTC(year, month - 1, day + 1) - INDIA_OFFSET_MILLISECONDS
  return Math.max(0, nextMidnightUtc - date.getTime())
}

export function lastSevenDates(today = communityDateKey()) {
  const [year, month, day] = today.split('-').map(Number)
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 1, day - (6 - index), 12))
    return communityDateKey(date)
  })
}

export function formatCommunityDate(dateKey = communityDateKey()) {
  return new Intl.DateTimeFormat(undefined, {
    timeZone: COMMUNITY_TIME_ZONE,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${dateKey}T00:00:00+05:30`))
}

export function compactDay(dateKey: string) {
  return new Intl.DateTimeFormat(undefined, {
    timeZone: COMMUNITY_TIME_ZONE,
    weekday: 'short',
    day: 'numeric',
  }).format(new Date(`${dateKey}T00:00:00+05:30`))
}

export function formatTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat(undefined, {
    timeZone: COMMUNITY_TIME_ZONE,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp))
}

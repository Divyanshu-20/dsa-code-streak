import { useEffect, useState } from 'react'
import { communityDateKey, millisecondsUntilNextCommunityMidnight } from '../lib/date'

const MIDNIGHT_SETTLE_MILLISECONDS = 250

export function useCommunityDate() {
  const [today, setToday] = useState(() => communityDateKey())

  useEffect(() => {
    let timeoutId: number

    const scheduleNextRefresh = () => {
      window.clearTimeout(timeoutId)
      timeoutId = window.setTimeout(
        refreshDate,
        millisecondsUntilNextCommunityMidnight() + MIDNIGHT_SETTLE_MILLISECONDS,
      )
    }

    const refreshDate = () => {
      setToday((current) => {
        const next = communityDateKey()
        return current === next ? current : next
      })
      scheduleNextRefresh()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshDate()
    }

    scheduleNextRefresh()
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', refreshDate)

    return () => {
      window.clearTimeout(timeoutId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', refreshDate)
    }
  }, [])

  return today
}

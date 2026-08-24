import type { CheckInStatus, ProblemCheckIn } from '../types'

export type CheckInSelection = CheckInStatus | 'not_started'

export interface CheckInCounts {
  solved: number
  attempted: number
  needsHelp: number
  notStarted: number
  checkedIn: number
  total: number
}

export type DayProgressState = 'empty' | 'missed' | 'partial' | 'done'

export function summarizeCheckIns(checkIns: ProblemCheckIn[], total: number): CheckInCounts {
  let solved = 0
  let attempted = 0
  let needsHelp = 0

  for (const checkIn of checkIns) {
    if (checkIn.status === 'solved') solved += 1
    else if (checkIn.status === 'attempted') attempted += 1
    else needsHelp += 1
  }

  const checkedIn = solved + attempted + needsHelp
  return {
    solved,
    attempted,
    needsHelp,
    notStarted: Math.max(0, total - checkedIn),
    checkedIn,
    total,
  }
}

export function formatCheckInCounts(counts: CheckInCounts) {
  return `${counts.solved} solved · ${counts.attempted} attempted · ${counts.needsHelp} need help · ${counts.notStarted} not started`
}

export function memberDayProgress(
  problemIds: string[],
  checkIns: ProblemCheckIn[],
  userId: string,
) {
  if (problemIds.length === 0) {
    return {
      state: 'empty' as DayProgressState,
      counts: summarizeCheckIns([], 0),
    }
  }

  const problemIdSet = new Set(problemIds)
  const memberCheckIns = checkIns.filter(
    (checkIn) => checkIn.user_id === userId && problemIdSet.has(checkIn.problem_id),
  )
  const counts = summarizeCheckIns(memberCheckIns, problemIds.length)
  const state: DayProgressState = counts.solved === problemIds.length
    ? 'done'
    : counts.checkedIn > 0
      ? 'partial'
      : 'missed'

  return { state, counts }
}

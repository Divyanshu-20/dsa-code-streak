import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Feedback } from '../components/Feedback'
import { useCommunityDate } from '../hooks/useCommunityDate'
import { formatCheckInCounts, memberDayProgress } from '../lib/checkIns'
import { compactDay, lastSevenDates } from '../lib/date'
import { loadGroup, loadMembers } from '../lib/data'
import { errorMessage, requireSupabase } from '../lib/supabase'
import type { Group, Member, Problem, ProblemCheckIn } from '../types'

export function ProgressPage() {
  const { groupId = '' } = useParams()
  const today = useCommunityDate()
  const dates = useMemo(() => lastSevenDates(today), [today])
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [problems, setProblems] = useState<Problem[]>([])
  const [checkIns, setCheckIns] = useState<ProblemCheckIn[]>([])
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    try {
      const [nextGroup, nextMembers, problemResult] = await Promise.all([
        loadGroup(groupId),
        loadMembers(groupId),
        requireSupabase().from('problems').select('*').eq('group_id', groupId).gte('problem_date', dates[0]).lte('problem_date', dates[6]),
      ])
      if (problemResult.error) throw problemResult.error
      const nextProblems = (problemResult.data ?? []) as Problem[]
      setGroup(nextGroup)
      setMembers(nextMembers)
      setProblems(nextProblems)
      if (nextProblems.length) {
        const result = await requireSupabase().from('problem_check_ins').select('*').in('problem_id', nextProblems.map((item) => item.id))
        if (result.error) throw result.error
        setCheckIns((result.data ?? []) as ProblemCheckIn[])
      } else {
        setCheckIns([])
      }
    } catch (error) {
      setMessage(errorMessage(error))
    }
  }, [dates, groupId])

  useEffect(() => { void load() }, [load])

  const problemsByDate = useMemo(() => {
    const grouped = new Map<string, Problem[]>()
    for (const problem of problems) {
      const dayProblems = grouped.get(problem.problem_date) ?? []
      dayProblems.push(problem)
      grouped.set(problem.problem_date, dayProblems)
    }
    return grouped
  }, [problems])
  return (
    <AppShell backTo={`/group/${groupId}`} backLabel={group?.name ?? 'Dashboard'}>
      <div className="page page--narrow progress-page">
        <div className="page-heading">
          <p className="eyebrow">Last seven days</p>
          <h1>Consistency, made visible.</h1>
          <p>A day counts as complete after every posted problem is solved. Attempts and help requests remain visible as partial progress.</p>
        </div>
        <Feedback message={message} />

        <section className="card heatmap-card">
          <div className="heatmap" style={{ '--days': dates.length } as React.CSSProperties}>
            <div className="heatmap-corner">Member</div>
            {dates.map((date) => <div className="heatmap-day" key={date}>{compactDay(date)}</div>)}
            {members.map((member) => (
              <div className="heatmap-row" key={member.user_id}>
                <div className="heatmap-name" title={member.profile.display_name}>{member.profile.display_name}</div>
                {dates.map((date) => {
                  const dayProblems = problemsByDate.get(date) ?? []
                  const progress = memberDayProgress(dayProblems.map((problem) => problem.id), checkIns, member.user_id)
                  const detail = progress.state === 'empty' ? 'No problems' : formatCheckInCounts(progress.counts)
                  return <div key={date} className={`heatmap-cell heatmap-cell--${progress.state}`} title={`${member.profile.display_name} | ${date} | ${detail}`} />
                })}
              </div>
            ))}
          </div>
          {members.length === 0 && !message && <p className="empty-copy">No members to show yet.</p>}
          <div className="heatmap-legend">
            <span><i className="heatmap-cell--empty" /> No problem</span>
            <span><i className="heatmap-cell--missed" /> Not started</span>
            <span><i className="heatmap-cell--partial" /> Attempted or partly solved</span>
            <span><i className="heatmap-cell--done" /> All solved</span>
          </div>
        </section>
      </div>
    </AppShell>
  )
}

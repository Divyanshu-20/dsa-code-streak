import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Feedback } from '../components/Feedback'
import { compactDay, lastSevenDates } from '../lib/date'
import { loadGroup, loadMembers } from '../lib/data'
import { errorMessage, requireSupabase } from '../lib/supabase'
import type { Completion, Group, Member, Problem } from '../types'

export function ProgressPage() {
  const { groupId = '' } = useParams()
  const dates = useMemo(() => lastSevenDates(), [])
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [problems, setProblems] = useState<Problem[]>([])
  const [completions, setCompletions] = useState<Completion[]>([])
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
        const result = await requireSupabase().from('completions').select('*').in('problem_id', nextProblems.map((item) => item.id))
        if (result.error) throw result.error
        setCompletions((result.data ?? []) as Completion[])
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
  const completed = useMemo(
    () => new Set(completions.map((item) => `${item.problem_id}:${item.user_id}`)),
    [completions],
  )

  return (
    <AppShell backTo={`/group/${groupId}`} backLabel={group?.name ?? 'Dashboard'}>
      <div className="page page--narrow progress-page">
        <div className="page-heading">
          <p className="eyebrow">Last seven days</p>
          <h1>Consistency, made visible.</h1>
          <p>A day counts as complete after every posted problem is done. Blank cells mean no problem was posted.</p>
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
                  const completedCount = dayProblems.filter((problem) => completed.has(`${problem.id}:${member.user_id}`)).length
                  const state = dayProblems.length === 0 ? 'empty' : completedCount === dayProblems.length ? 'done' : completedCount > 0 ? 'partial' : 'missed'
                  const detail = dayProblems.length === 0 ? 'No problems' : `${completedCount} of ${dayProblems.length} completed`
                  return <div key={date} className={`heatmap-cell heatmap-cell--${state}`} title={`${member.profile.display_name} | ${date} | ${detail}`} />
                })}
              </div>
            ))}
          </div>
          {members.length === 0 && !message && <p className="empty-copy">No members to show yet.</p>}
          <div className="heatmap-legend">
            <span><i className="heatmap-cell--empty" /> No problem</span>
            <span><i className="heatmap-cell--missed" /> Not completed</span>
            <span><i className="heatmap-cell--partial" /> Partly completed</span>
            <span><i className="heatmap-cell--done" /> Completed</span>
          </div>
        </section>
      </div>
    </AppShell>
  )
}

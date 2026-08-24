import { ArrowUpRight, CalendarDays, Check, CheckCircle2, Copy, MessageCircle, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Feedback } from '../components/Feedback'
import { useAuth } from '../context/AuthContext'
import { useCommunityDate } from '../hooks/useCommunityDate'
import { formatCheckInCounts, summarizeCheckIns } from '../lib/checkIns'
import type { CheckInCounts, CheckInSelection } from '../lib/checkIns'
import { loadDailySchedule, loadGroup, loadMembers } from '../lib/data'
import { formatCommunityDate } from '../lib/date'
import { errorMessage, requireSupabase } from '../lib/supabase'
import type { Group, Member, Problem, ProblemCheckIn, ScheduleDay } from '../types'

const CHECK_IN_OPTIONS: { value: CheckInSelection; label: string }[] = [
  { value: 'not_started', label: 'Not started' },
  { value: 'attempted', label: 'Attempted' },
  { value: 'needs_help', label: 'Need help' },
  { value: 'solved', label: 'Solved' },
]

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function memberStatus(counts: CheckInCounts) {
  if (counts.total === 0) return { label: '-', className: '' }
  if (counts.solved === counts.total) return { label: 'All solved', className: 'is-done' }
  if (counts.needsHelp > 0) return { label: `${counts.needsHelp} need help`, className: 'needs-help' }
  if (counts.attempted > 0) return { label: `${counts.solved} solved · ${counts.attempted} attempted`, className: 'has-attempt' }
  if (counts.solved > 0) return { label: `${counts.solved}/${counts.total} solved`, className: 'has-attempt' }
  return { label: 'Not started', className: '' }
}

export function GroupDashboardPage() {
  const { groupId = '' } = useParams()
  const { user } = useAuth()
  const today = useCommunityDate()
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [scheduleDay, setScheduleDay] = useState<ScheduleDay | null>(null)
  const [problems, setProblems] = useState<Problem[]>([])
  const [checkIns, setCheckIns] = useState<ProblemCheckIn[]>([])
  const [loading, setLoading] = useState(true)
  const [savingProblemId, setSavingProblemId] = useState<string | null>(null)
  const [removingUserId, setRemovingUserId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setMessage('')
    try {
      const [nextGroup, nextMembers, dailySchedule] = await Promise.all([
        loadGroup(groupId),
        loadMembers(groupId),
        loadDailySchedule(groupId, today),
      ])
      const nextProblems = dailySchedule.problems
      setGroup(nextGroup)
      setMembers(nextMembers)
      setScheduleDay(dailySchedule.day)
      setProblems(nextProblems)
      if (nextProblems.length) {
        const { data, error } = await requireSupabase()
          .from('problem_check_ins')
          .select('*')
          .in('problem_id', nextProblems.map((problem) => problem.id))
        if (error) throw error
        const currentMemberIds = new Set(nextMembers.map((member) => member.user_id))
        setCheckIns(((data ?? []) as ProblemCheckIn[]).filter((checkIn) => currentMemberIds.has(checkIn.user_id)))
      } else {
        setCheckIns([])
      }
    } catch (error) {
      setMessage('This group could not be loaded. You may not be a member, or the link is invalid.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [groupId, today])

  useEffect(() => { void load() }, [load])

  const totalCheckInSlots = members.length * problems.length
  const checkInSummary = useMemo(() => {
    const byProblemId = new Map<string, ProblemCheckIn[]>()
    const byUserId = new Map<string, ProblemCheckIn[]>()
    const ownByProblemId = new Map<string, ProblemCheckIn>()

    for (const checkIn of checkIns) {
      const problemCheckIns = byProblemId.get(checkIn.problem_id) ?? []
      problemCheckIns.push(checkIn)
      byProblemId.set(checkIn.problem_id, problemCheckIns)

      const memberCheckIns = byUserId.get(checkIn.user_id) ?? []
      memberCheckIns.push(checkIn)
      byUserId.set(checkIn.user_id, memberCheckIns)

      if (checkIn.user_id === user?.id) ownByProblemId.set(checkIn.problem_id, checkIn)
    }

    return {
      byProblemId,
      byUserId,
      ownByProblemId,
      totals: summarizeCheckIns(checkIns, totalCheckInSlots),
    }
  }, [checkIns, totalCheckInSlots, user?.id])
  const isOwner = group?.owner_id === user?.id

  async function saveCheckIn(problem: Problem, status: CheckInSelection) {
    if (!user) return
    const existing = checkInSummary.ownByProblemId.get(problem.id)
    if (status === (existing?.status ?? 'not_started')) return

    setSavingProblemId(problem.id)
    setMessage('')
    try {
      if (status === 'not_started') {
        if (!existing) return
        const { error } = await requireSupabase()
          .from('problem_check_ins')
          .delete()
          .eq('id', existing.id)
        if (error) throw error
        setCheckIns((current) => current.filter((checkIn) => checkIn.id !== existing.id))
      } else if (existing) {
        const { data, error } = await requireSupabase()
          .from('problem_check_ins')
          .update({ status })
          .eq('id', existing.id)
          .select('*')
          .single()
        if (error) throw error
        const saved = data as ProblemCheckIn
        setCheckIns((current) => current.map((checkIn) => checkIn.id === saved.id ? saved : checkIn))
      } else {
        const { data, error } = await requireSupabase()
          .from('problem_check_ins')
          .insert({ problem_id: problem.id, user_id: user.id, status })
          .select('*')
          .single()
        if (error) throw error
        setCheckIns((current) => [...current, data as ProblemCheckIn])
      }
    } catch (error) {
      const failureMessage = errorMessage(error)
      await load()
      setMessage(failureMessage)
    } finally {
      setSavingProblemId(null)
    }
  }

  async function copyInvite() {
    if (!group) return
    const link = `${window.location.origin}/onboarding?invite=${group.invite_code}`
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setMessage(`Copy this invite link: ${link}`)
    }
  }

  async function removeMember(member: Member) {
    if (!isOwner || member.user_id === user?.id) return

    const confirmed = window.confirm(
      `Remove ${member.profile.display_name} from ${group?.name ?? 'this group'}? They will lose access, but their sign-in account will not be deleted.`,
    )
    if (!confirmed) return

    setRemovingUserId(member.user_id)
    setMessage('')
    try {
      const { data, error } = await requireSupabase()
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', member.user_id)
        .select('user_id')

      if (error) throw error
      if (data?.length !== 1) throw new Error('The member was not removed. Refresh and try again.')

      await load()
      setMessage(`${member.profile.display_name} was removed from the group.`)
    } catch (error) {
      setMessage(errorMessage(error))
    } finally {
      setRemovingUserId(null)
    }
  }

  return (
    <AppShell>
      <div className="page dashboard-page">
        {loading ? (
          <div className="dashboard-skeleton" role="status">Loading today's problems...</div>
        ) : group ? (
          <>
            <div className="dashboard-topline">
              <div>
                <p className="eyebrow">{formatCommunityDate(today)} - India time</p>
                <h1>{group.name}</h1>
              </div>
              <button className="button button--ghost" type="button" onClick={copyInvite}>
                {copied ? <Check size={17} /> : <Copy size={17} />} {copied ? 'Copied' : 'Invite'}
              </button>
            </div>

            <Feedback message={message} />

            <div className="dashboard-grid">
              <div className="problem-list">
                {scheduleDay && (
                  <section className="schedule-summary" aria-label={`Roadmap Day ${scheduleDay.dayNumber}`}>
                    <div>
                      <span className={`schedule-badge schedule-badge--${scheduleDay.kind}`}>
                        Day {scheduleDay.dayNumber} - Week {scheduleDay.weekNumber}
                      </span>
                      <strong>{scheduleDay.topic}</strong>
                    </div>
                    <p>{scheduleDay.milestone}</p>
                  </section>
                )}
                {problems.length ? (
                  <>
                    {problems.map((problem, index) => {
                      const myCheckIn = checkInSummary.ownByProblemId.get(problem.id)
                      const selectedStatus = myCheckIn?.status ?? 'not_started'
                      const problemCounts = summarizeCheckIns(checkInSummary.byProblemId.get(problem.id) ?? [], members.length)
                      const saving = savingProblemId === problem.id
                      return (
                        <section className="problem-card" key={problem.id}>
                          <div className="problem-card__header">
                            <div>
                              <p className="eyebrow">Today's problem {problems.length > 1 ? `${index + 1} of ${problems.length}` : ''}</p>
                              <span className={`difficulty difficulty--${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
                            </div>
                            {isOwner && (
                              <Link className="icon-button" to={`/group/${groupId}/admin/problem?problemId=${problem.id}`} aria-label={`Edit ${problem.title}`}>
                                <Pencil size={17} />
                              </Link>
                            )}
                          </div>
                          <div className="problem-copy">
                            <span className="platform">{problem.platform}</span>
                            <h2>{problem.title}</h2>
                            {problem.prompt && <p className="problem-prompt">{problem.prompt}</p>}
                            {problem.note && <p className="problem-note">{problem.note}</p>}
                          </div>
                          <div className="problem-actions">
                            {problem.url && (
                              <a className="button button--secondary" href={problem.url} target="_blank" rel="noopener noreferrer">
                                Open problem <ArrowUpRight size={17} />
                              </a>
                            )}
                          </div>
                          <div className="check-in-control">
                            <div className="check-in-control__heading">
                              <span>Your check-in</span>
                              {saving && <small role="status">Saving...</small>}
                            </div>
                            <div className="check-in-options" role="group" aria-label={`Your check-in for ${problem.title}`}>
                              {CHECK_IN_OPTIONS.map((option) => (
                                <button
                                  className={`check-in-option check-in-option--${option.value} ${selectedStatus === option.value ? 'is-selected' : ''}`}
                                  type="button"
                                  key={option.value}
                                  disabled={saving}
                                  aria-pressed={selectedStatus === option.value}
                                  onClick={() => void saveCheckIn(problem, option.value)}
                                >
                                  {option.value === 'solved' && <CheckCircle2 size={16} />}
                                  {option.label}
                                </button>
                              ))}
                            </div>
                            {selectedStatus === 'needs_help' && (
                              <Link className="check-in-help-link" to={`/group/${groupId}/problem/${problem.id}`}>
                                Tell the group what is blocking you <ArrowUpRight size={14} />
                              </Link>
                            )}
                          </div>
                          <div className="problem-card__footer">
                            <Link className="discussion-link" to={`/group/${groupId}/problem/${problem.id}`}>
                              <MessageCircle size={17} /> Open discussion
                            </Link>
                            <span>{formatCheckInCounts(problemCounts)}</span>
                          </div>
                        </section>
                      )
                    })}
                    {isOwner && (
                      <Link className="button button--primary add-problem-button" to={`/group/${groupId}/admin/problem`}>
                        <Plus size={18} /> Add another problem
                      </Link>
                    )}
                  </>
                ) : scheduleDay ? (
                  <section className={`problem-card schedule-card schedule-card--${scheduleDay.kind}`}>
                    <div className="empty-problem">
                      <span className="empty-icon"><CalendarDays size={26} /></span>
                      <p className="eyebrow">Day {scheduleDay.dayNumber} - {scheduleDay.cadence}</p>
                      <h2>{scheduleDay.kind === 'rest' ? 'Recovery day.' : scheduleDay.kind === 'revision' ? 'Revision checkpoint.' : 'Mock checkpoint.'}</h2>
                      <p>{scheduleDay.instructions}</p>
                      <p className="schedule-milestone">{scheduleDay.milestone}</p>
                      {isOwner && <Link className="button button--primary" to={`/group/${groupId}/admin/problem`}><Plus size={18} /> Add an optional problem</Link>}
                    </div>
                  </section>
                ) : (
                  <section className="problem-card">
                    <div className="empty-problem">
                      <span className="empty-icon"><CalendarDays size={26} /></span>
                      <p className="eyebrow">Today's problems</p>
                      <h2>No problem posted yet.</h2>
                      <p>{isOwner ? "Publish today's first problem so the group can start checking in." : 'Your group owner has not posted a problem for today yet.'}</p>
                      {isOwner && <Link className="button button--primary" to={`/group/${groupId}/admin/problem`}><Plus size={18} /> Add today's first problem</Link>}
                    </div>
                  </section>
                )}
              </div>

              <aside className="progress-card">
                <div className="progress-card__top">
                  <div>
                    <p className="eyebrow">Today's check-ins</p>
                    {problems.length ? <h2>{checkInSummary.totals.checkedIn}<span> / {totalCheckInSlots}</span></h2> : <h2 className="progress-card__quiet">-</h2>}
                  </div>
                  <span className="progress-icon"><Users size={20} /></span>
                </div>
                <div className="progress-bar" aria-label={`${checkInSummary.totals.checkedIn} of ${totalCheckInSlots} problem statuses updated`}>
                  <span style={{ width: `${totalCheckInSlots ? Math.round((checkInSummary.totals.checkedIn / totalCheckInSlots) * 100) : 0}%` }} />
                </div>
                {problems.length > 0 && <p className="check-in-summary-line">{formatCheckInCounts(checkInSummary.totals)}</p>}
                <div className="member-list">
                  {members.map((member) => {
                    const counts = summarizeCheckIns(checkInSummary.byUserId.get(member.user_id) ?? [], problems.length)
                    const status = problems.length > 0 ? memberStatus(counts) : { label: scheduleDay ? 'No check-in' : '-', className: '' }
                    return (
                      <div className="member-row" key={member.user_id}>
                        <span className="member-avatar">{initials(member.profile.display_name)}</span>
                        <span className="member-name">{member.profile.display_name}{member.user_id === user?.id && <small>You</small>}</span>
                        <span className="member-actions">
                          <span className={`status-pill ${status.className}`}>
                            {status.label}
                          </span>
                          {isOwner && member.user_id !== user?.id && (
                            <button
                              className="member-remove"
                              type="button"
                              disabled={removingUserId === member.user_id}
                              onClick={() => void removeMember(member)}
                              aria-label={`Remove ${member.profile.display_name} from the group`}
                              title="Remove user"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <Link className="button button--ghost button--wide" to={`/group/${groupId}/progress`}>
                  View seven-day progress <ArrowUpRight size={16} />
                </Link>
              </aside>
            </div>
          </>
        ) : (
          <Feedback message={message || 'Group not found.'} />
        )}
      </div>
    </AppShell>
  )
}

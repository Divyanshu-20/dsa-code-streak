import { ArrowUpRight, CalendarDays, Check, CheckCircle2, Copy, MessageCircle, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Feedback } from '../components/Feedback'
import { useAuth } from '../context/AuthContext'
import { loadGroup, loadMembers, loadProblems } from '../lib/data'
import { localDateKey } from '../lib/date'
import { errorMessage, requireSupabase } from '../lib/supabase'
import type { Completion, Group, Member, Problem } from '../types'

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

export function GroupDashboardPage() {
  const { groupId = '' } = useParams()
  const { user } = useAuth()
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [problems, setProblems] = useState<Problem[]>([])
  const [completions, setCompletions] = useState<Completion[]>([])
  const [loading, setLoading] = useState(true)
  const [savingProblemId, setSavingProblemId] = useState<string | null>(null)
  const [removingUserId, setRemovingUserId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setMessage('')
    try {
      const [nextGroup, nextMembers, nextProblems] = await Promise.all([
        loadGroup(groupId),
        loadMembers(groupId),
        loadProblems(groupId, localDateKey()),
      ])
      setGroup(nextGroup)
      setMembers(nextMembers)
      setProblems(nextProblems)
      if (nextProblems.length) {
        const { data, error } = await requireSupabase()
          .from('completions')
          .select('*')
          .in('problem_id', nextProblems.map((problem) => problem.id))
        if (error) throw error
        const currentMemberIds = new Set(nextMembers.map((member) => member.user_id))
        setCompletions(((data ?? []) as Completion[]).filter((completion) => currentMemberIds.has(completion.user_id)))
      } else {
        setCompletions([])
      }
    } catch (error) {
      setMessage('This group could not be loaded. You may not be a member, or the link is invalid.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [groupId])

  useEffect(() => { void load() }, [load])

  const completionSummary = useMemo(() => {
    const countByProblemId = new Map<string, number>()
    const completedProblemIdsByUser = new Map<string, Set<string>>()
    const ownByProblemId = new Map<string, Completion>()

    for (const completion of completions) {
      countByProblemId.set(completion.problem_id, (countByProblemId.get(completion.problem_id) ?? 0) + 1)
      const userProblemIds = completedProblemIdsByUser.get(completion.user_id) ?? new Set<string>()
      userProblemIds.add(completion.problem_id)
      completedProblemIdsByUser.set(completion.user_id, userProblemIds)
      if (completion.user_id === user?.id) ownByProblemId.set(completion.problem_id, completion)
    }

    return { countByProblemId, completedProblemIdsByUser, ownByProblemId }
  }, [completions, user?.id])
  const totalCheckIns = members.length * problems.length
  const isOwner = group?.owner_id === user?.id

  async function toggleCompletion(problem: Problem) {
    if (!user) return
    const myCompletion = completions.find((item) => item.problem_id === problem.id && item.user_id === user.id)
    if (myCompletion && !window.confirm(`Undo your completion for ${problem.title}?`)) return
    setSavingProblemId(problem.id)
    setMessage('')
    try {
      if (myCompletion) {
        const { error } = await requireSupabase().from('completions').delete().eq('id', myCompletion.id)
        if (error) throw error
      } else {
        const { error } = await requireSupabase().from('completions').insert({ problem_id: problem.id, user_id: user.id })
        if (error) throw error
      }
      await load()
    } catch (error) {
      setMessage(errorMessage(error))
      await load()
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
                <p className="eyebrow">{new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}</p>
                <h1>{group.name}</h1>
              </div>
              <button className="button button--ghost" type="button" onClick={copyInvite}>
                {copied ? <Check size={17} /> : <Copy size={17} />} {copied ? 'Copied' : 'Invite'}
              </button>
            </div>

            <Feedback message={message} />

            <div className="dashboard-grid">
              <div className="problem-list">
                {problems.length ? (
                  <>
                    {problems.map((problem, index) => {
                      const myCompletion = completionSummary.ownByProblemId.get(problem.id)
                      const problemCompletionCount = completionSummary.countByProblemId.get(problem.id) ?? 0
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
                            {problem.note && <p>{problem.note}</p>}
                          </div>
                          <div className="problem-actions">
                            <a className="button button--secondary" href={problem.url} target="_blank" rel="noopener noreferrer">
                              Open problem <ArrowUpRight size={17} />
                            </a>
                            <button className={`button button--complete ${myCompletion ? 'is-complete' : ''}`} type="button" disabled={saving} onClick={() => void toggleCompletion(problem)}>
                              <CheckCircle2 size={19} />
                              {saving ? 'Saving...' : myCompletion ? 'Completed - Undo' : 'Mark done'}
                            </button>
                          </div>
                          <div className="problem-card__footer">
                            <Link className="discussion-link" to={`/group/${groupId}/problem/${problem.id}`}>
                              <MessageCircle size={17} /> Open discussion
                            </Link>
                            <span>{problemCompletionCount} of {members.length} done</span>
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
                  <div><p className="eyebrow">Today's check-ins</p><h2>{completions.length}<span> / {totalCheckIns}</span></h2></div>
                  <span className="progress-icon"><Users size={20} /></span>
                </div>
                <div className="progress-bar" aria-label={`${completions.length} of ${totalCheckIns} problem check-ins completed`}>
                  <span style={{ width: `${totalCheckIns ? Math.round((completions.length / totalCheckIns) * 100) : 0}%` }} />
                </div>
                <div className="member-list">
                  {members.map((member) => {
                    const completedCount = completionSummary.completedProblemIdsByUser.get(member.user_id)?.size ?? 0
                    const done = problems.length > 0 && completedCount === problems.length
                    return (
                      <div className="member-row" key={member.user_id}>
                        <span className="member-avatar">{initials(member.profile.display_name)}</span>
                        <span className="member-name">{member.profile.display_name}{member.user_id === user?.id && <small>You</small>}</span>
                        <span className="member-actions">
                          <span className={`status-pill ${done ? 'is-done' : ''}`}>{done ? 'All done' : problems.length ? `${completedCount}/${problems.length} done` : '-'}</span>
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

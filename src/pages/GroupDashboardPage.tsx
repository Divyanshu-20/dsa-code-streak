import { ArrowUpRight, CalendarDays, Check, CheckCircle2, Copy, MessageCircle, Pencil, Users } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Feedback } from '../components/Feedback'
import { useAuth } from '../context/AuthContext'
import { loadGroup, loadMembers, loadProblem } from '../lib/data'
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
  const [problem, setProblem] = useState<Problem | null>(null)
  const [completions, setCompletions] = useState<Completion[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setMessage('')
    try {
      const [nextGroup, nextMembers, nextProblem] = await Promise.all([
        loadGroup(groupId),
        loadMembers(groupId),
        loadProblem(groupId, localDateKey()),
      ])
      setGroup(nextGroup)
      setMembers(nextMembers)
      setProblem(nextProblem)
      if (nextProblem) {
        const { data, error } = await requireSupabase().from('completions').select('*').eq('problem_id', nextProblem.id)
        if (error) throw error
        setCompletions((data ?? []) as Completion[])
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

  const completedUsers = useMemo(() => new Set(completions.map((item) => item.user_id)), [completions])
  const myCompletion = completions.find((item) => item.user_id === user?.id)
  const isOwner = group?.owner_id === user?.id

  async function toggleCompletion() {
    if (!problem || !user) return
    if (myCompletion && !window.confirm('Undo your completion for today?')) return
    setSaving(true)
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
      setSaving(false)
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

  return (
    <AppShell>
      <div className="page dashboard-page">
        {loading ? (
          <div className="dashboard-skeleton" role="status">Loading today’s problem…</div>
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
              <section className="problem-card">
                {problem ? (
                  <>
                    <div className="problem-card__header">
                      <div>
                        <p className="eyebrow">Today’s problem</p>
                        <span className={`difficulty difficulty--${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
                      </div>
                      {isOwner && (
                        <Link className="icon-button" to={`/group/${groupId}/admin/problem?problemId=${problem.id}`} aria-label="Edit today's problem">
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
                      <button className={`button button--complete ${myCompletion ? 'is-complete' : ''}`} type="button" disabled={saving} onClick={toggleCompletion}>
                        <CheckCircle2 size={19} />
                        {saving ? 'Saving…' : myCompletion ? 'Completed · Undo' : 'Mark done'}
                      </button>
                    </div>
                    <Link className="discussion-link" to={`/group/${groupId}/problem/${problem.id}`}>
                      <MessageCircle size={17} /> Open discussion
                    </Link>
                  </>
                ) : (
                  <div className="empty-problem">
                    <span className="empty-icon"><CalendarDays size={26} /></span>
                    <p className="eyebrow">Today’s problem</p>
                    <h2>No problem posted yet.</h2>
                    <p>{isOwner ? 'Publish today’s problem so the group can start checking in.' : 'Your group owner has not posted today’s problem yet.'}</p>
                    {isOwner && <Link className="button button--primary" to={`/group/${groupId}/admin/problem`}>Post today’s problem</Link>}
                  </div>
                )}
              </section>

              <aside className="progress-card">
                <div className="progress-card__top">
                  <div><p className="eyebrow">Group progress</p><h2>{completions.length}<span> / {members.length}</span></h2></div>
                  <span className="progress-icon"><Users size={20} /></span>
                </div>
                <div className="progress-bar" aria-label={`${completions.length} of ${members.length} members completed`}>
                  <span style={{ width: `${members.length ? Math.round((completions.length / members.length) * 100) : 0}%` }} />
                </div>
                <div className="member-list">
                  {members.map((member) => {
                    const done = problem ? completedUsers.has(member.user_id) : false
                    return (
                      <div className="member-row" key={member.user_id}>
                        <span className="member-avatar">{initials(member.profile.display_name)}</span>
                        <span className="member-name">{member.profile.display_name}{member.user_id === user?.id && <small>You</small>}</span>
                        <span className={`status-pill ${done ? 'is-done' : ''}`}>{done ? 'Done' : problem ? 'Pending' : '—'}</span>
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

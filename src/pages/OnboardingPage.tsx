import { ArrowRight, Copy, Plus, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Feedback } from '../components/Feedback'
import { useAuth } from '../context/AuthContext'
import { errorMessage, requireSupabase } from '../lib/supabase'
import type { Group } from '../types'

const CENTRAL_ADMIN_EMAIL = 'media.divy4nshu@gmail.com'

export function OnboardingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [groups, setGroups] = useState<Group[]>([])
  const [groupName, setGroupName] = useState('')
  const [inviteCode, setInviteCode] = useState(searchParams.get('invite') ?? '')
  const [busy, setBusy] = useState<'create' | 'join' | ''>('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const canCreateGroups = user?.email?.toLowerCase() === CENTRAL_ADMIN_EMAIL

  async function loadGroups() {
    setLoading(true)
    const { data, error } = await requireSupabase().from('groups').select('*').order('created_at')
    if (error) setMessage(errorMessage(error))
    else setGroups((data ?? []) as Group[])
    setLoading(false)
  }

  useEffect(() => {
    void loadGroups()
  }, [])

  async function createGroup(event: React.FormEvent) {
    event.preventDefault()
    setBusy('create')
    setMessage('')
    try {
      const { data, error } = await requireSupabase().rpc('create_group', { group_name: groupName.trim() })
      if (error) throw error
      const group = (Array.isArray(data) ? data[0] : data) as Group
      navigate(`/group/${group.id}`)
    } catch (error) {
      setMessage(errorMessage(error))
    } finally {
      setBusy('')
    }
  }

  async function joinGroup(event: React.FormEvent) {
    event.preventDefault()
    setBusy('join')
    setMessage('')
    try {
      const { data, error } = await requireSupabase().rpc('join_group', { code: inviteCode.trim().toUpperCase() })
      if (error) throw error
      const group = (Array.isArray(data) ? data[0] : data) as Group
      navigate(`/group/${group.id}`)
    } catch (error) {
      const detail = errorMessage(error)
      setMessage(detail.includes('Group not found') ? detail : `Could not join the group. ${detail}`)
    } finally {
      setBusy('')
    }
  }

  return (
    <AppShell>
      <div className="page page--narrow onboarding-page">
        <div className="page-heading">
          <p className="eyebrow">Your accountability circle</p>
          <h1>Choose where you’ll show up.</h1>
          <p>
            {canCreateGroups
              ? 'Create a private group or enter an invite code.'
              : 'Enter the private invite code shared by your central admin.'}
          </p>
        </div>

        {groups.length > 0 && (
          <section className="section-block">
            <div className="section-title"><h2>Your groups</h2><span>{groups.length}</span></div>
            <div className="group-list">
              {groups.map((group) => (
                <button key={group.id} className="group-row" onClick={() => navigate(`/group/${group.id}`)}>
                  <span className="group-avatar"><Users size={20} /></span>
                  <span><strong>{group.name}</strong><small>Invite {group.invite_code}</small></span>
                  <ArrowRight size={19} />
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="choice-grid">
          {canCreateGroups && (
            <form className="card form-card" onSubmit={createGroup}>
              <span className="card-icon"><Plus size={20} /></span>
              <h2>Create a group</h2>
              <p>You’ll become the owner and post the daily problem.</p>
              <label>
                Group name
                <input value={groupName} onChange={(event) => setGroupName(event.target.value)} required minLength={2} maxLength={80} placeholder="Nagpur DSA Circle" />
              </label>
              <button className="button button--primary button--wide" disabled={Boolean(busy)}>
                {busy === 'create' ? 'Creating…' : 'Create group'}
              </button>
            </form>
          )}

          <form className="card form-card" onSubmit={joinGroup}>
            <span className="card-icon card-icon--soft"><Copy size={20} /></span>
            <h2>Join with a code</h2>
            <p>Use the private invite code from your group admin.</p>
            <label>
              Invite code
              <input className="code-input" value={inviteCode} onChange={(event) => setInviteCode(event.target.value.toUpperCase())} required maxLength={12} placeholder="A1B2C3D4" />
            </label>
            <button className="button button--secondary button--wide" disabled={Boolean(busy)}>
              {busy === 'join' ? 'Joining…' : 'Join group'}
            </button>
          </form>
        </div>
        <Feedback message={message} />
        {loading && <p className="muted center">Checking your groups…</p>}
      </div>
    </AppShell>
  )
}

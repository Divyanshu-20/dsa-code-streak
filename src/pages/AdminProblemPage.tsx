import { Save, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Feedback } from '../components/Feedback'
import { useAuth } from '../context/AuthContext'
import { localDateKey } from '../lib/date'
import { errorMessage, requireSupabase } from '../lib/supabase'
import type { Difficulty, Problem } from '../types'

export function AdminProblemPage() {
  const { groupId = '' } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const problemId = searchParams.get('problemId')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [platform, setPlatform] = useState('LeetCode')
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium')
  const [date, setDate] = useState(localDateKey())
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!problemId) return
    void requireSupabase().from('problems').select('*').eq('id', problemId).eq('group_id', groupId).single().then(({ data, error }) => {
      if (error) setMessage(errorMessage(error))
      else if (data) {
        const problem = data as Problem
        setTitle(problem.title)
        setUrl(problem.url)
        setPlatform(problem.platform)
        setDifficulty(problem.difficulty)
        setDate(problem.problem_date)
        setNote(problem.note ?? '')
      }
    })
  }, [groupId, problemId])

  async function save(event: React.FormEvent) {
    event.preventDefault()
    if (!user) return
    setBusy(true)
    setMessage('')
    try {
      const values = { group_id: groupId, title: title.trim(), url: url.trim(), platform: platform.trim(), difficulty, problem_date: date, note: note.trim() || null, created_by: user.id }
      const query = problemId
        ? requireSupabase().from('problems').update(values).eq('id', problemId)
        : requireSupabase().from('problems').insert(values)
      const { error } = await query
      if (error) throw error
      navigate(`/group/${groupId}`)
    } catch (caught) {
      setMessage(errorMessage(caught))
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!problemId || !window.confirm('Delete this problem? Its completions and comments will also be removed.')) return
    setBusy(true)
    setMessage('')
    try {
      const { error } = await requireSupabase().from('problems').delete().eq('id', problemId)
      if (error) throw error
      navigate(`/group/${groupId}`)
    } catch (caught) {
      setMessage(errorMessage(caught))
      setBusy(false)
    }
  }

  return (
    <AppShell backTo={`/group/${groupId}`} backLabel="Dashboard">
      <div className="page page--form">
        <div className="page-heading">
          <p className="eyebrow">Owner controls</p>
          <h1>{problemId ? 'Edit the problem.' : 'Add a problem.'}</h1>
          <p>Publish an assignment for this date. You can add another problem from the dashboard whenever the group needs one.</p>
        </div>
        <form className="card problem-form" onSubmit={save}>
          <div className="form-grid">
            <label className="span-2">Problem title<input value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={160} placeholder="Two Sum" /></label>
            <label className="span-2">Problem URL<input type="url" value={url} onChange={(event) => setUrl(event.target.value)} required placeholder="https://leetcode.com/problems/two-sum/" /></label>
            <label>Platform<input value={platform} onChange={(event) => setPlatform(event.target.value)} required maxLength={60} /></label>
            <label>Difficulty<select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)}><option>Easy</option><option>Medium</option><option>Hard</option></select></label>
            <label>Date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
            <label className="span-2">Optional note<textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} maxLength={500} placeholder="Focus on the hash map approach after trying brute force." /></label>
          </div>
          <Feedback message={message} />
          <div className="form-actions">
            {problemId && <button className="button button--danger" type="button" disabled={busy} onClick={remove}><Trash2 size={17} /> Delete</button>}
            <button className="button button--primary" disabled={busy}><Save size={17} /> {busy ? 'Saving...' : problemId ? 'Save changes' : 'Publish problem'}</button>
          </div>
        </form>
      </div>
    </AppShell>
  )
}

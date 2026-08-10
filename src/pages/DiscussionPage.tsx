import { MessageCircle, Send } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Feedback } from '../components/Feedback'
import { useAuth } from '../context/AuthContext'
import { formatTimestamp } from '../lib/date'
import { errorMessage, requireSupabase } from '../lib/supabase'
import type { Comment, Problem, Profile } from '../types'

function normalizeProfile(value: unknown): Profile {
  return (Array.isArray(value) ? value[0] : value) as Profile
}

export function DiscussionPage() {
  const { groupId = '', problemId = '' } = useParams()
  const { user } = useAuth()
  const [problem, setProblem] = useState<Problem | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const [problemResult, commentResult] = await Promise.all([
        requireSupabase().from('problems').select('*').eq('id', problemId).eq('group_id', groupId).single(),
        requireSupabase().from('comments').select('id,problem_id,user_id,message,created_at,profile:profiles(id,display_name,avatar_url)').eq('problem_id', problemId).order('created_at'),
      ])
      if (problemResult.error) throw problemResult.error
      if (commentResult.error) throw commentResult.error
      setProblem(problemResult.data as Problem)
      setComments((commentResult.data ?? []).map((item) => ({ ...item, profile: normalizeProfile(item.profile) })) as Comment[])
    } catch (caught) {
      setError(errorMessage(caught))
    }
  }, [groupId, problemId])

  useEffect(() => { void load() }, [load])

  async function postComment(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = message.trim()
    if (!trimmed || !user) return
    setBusy(true)
    setError('')
    try {
      const { error: insertError } = await requireSupabase().from('comments').insert({ problem_id: problemId, user_id: user.id, message: trimmed })
      if (insertError) throw insertError
      setMessage('')
      await load()
    } catch (caught) {
      setError(errorMessage(caught))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AppShell backTo={`/group/${groupId}`} backLabel="Dashboard">
      <div className="page page--narrow discussion-page">
        <div className="page-heading">
          <p className="eyebrow">Problem discussion</p>
          <h1>{problem?.title ?? 'Loading discussion…'}</h1>
          <p>Keep it short and useful. Share an approach, a blocker, or one thing you learned.</p>
        </div>
        <Feedback message={error} />
        <section className="card comments-card">
          <div className="comment-list">
            {comments.length ? comments.map((comment) => (
              <article className="comment" key={comment.id}>
                <div className="comment-meta"><strong>{comment.profile.display_name}</strong><time>{formatTimestamp(comment.created_at)}</time></div>
                <p>{comment.message}</p>
              </article>
            )) : (
              <div className="empty-comments"><MessageCircle size={27} /><h2>No comments yet.</h2><p>Start the discussion after you’ve attempted the problem.</p></div>
            )}
          </div>
          <form className="comment-form" onSubmit={postComment}>
            <label htmlFor="comment">Add a comment</label>
            <textarea id="comment" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={1000} rows={4} placeholder="What approach did you use?" required />
            <div className="comment-form__footer"><span>{message.trim().length}/1000</span><button className="button button--primary" disabled={busy || !message.trim()}>{busy ? 'Posting…' : 'Post'} {!busy && <Send size={16} />}</button></div>
          </form>
        </section>
      </div>
    </AppShell>
  )
}

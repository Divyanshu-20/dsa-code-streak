import { Code2, Copy, ImagePlus, MessageCircle, Send, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Feedback } from '../components/Feedback'
import { useAuth } from '../context/AuthContext'
import { formatTimestamp } from '../lib/date'
import { loadGroup } from '../lib/data'
import { errorMessage, requireSupabase } from '../lib/supabase'
import type { Comment, Group, Problem, Profile } from '../types'

const IMAGE_BUCKET = 'discussion-images'
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

function normalizeProfile(value: unknown): Profile {
  return (Array.isArray(value) ? value[0] : value) as Profile
}

function imageExtension(file: File) {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  }
  return extensions[file.type]
}

export function DiscussionPage() {
  const { groupId = '', problemId = '' } = useParams()
  const { user } = useAuth()
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [group, setGroup] = useState<Group | null>(null)
  const [problem, setProblem] = useState<Problem | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [message, setMessage] = useState('')
  const [codeBody, setCodeBody] = useState('')
  const [codeLanguage, setCodeLanguage] = useState('Java')
  const [showCodeEditor, setShowCodeEditor] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const isAdmin = group?.owner_id === user?.id

  const load = useCallback(async () => {
    try {
      const [nextGroup, problemResult, commentResult] = await Promise.all([
        loadGroup(groupId),
        requireSupabase().from('problems').select('*').eq('id', problemId).eq('group_id', groupId).single(),
        requireSupabase()
          .from('comments')
          .select('id,problem_id,user_id,message,image_path,code_body,code_language,created_at,profile:profiles(id,display_name,avatar_url)')
          .eq('problem_id', problemId)
          .order('created_at'),
      ])
      if (problemResult.error) throw problemResult.error
      if (commentResult.error) throw commentResult.error

      const rawComments = (commentResult.data ?? []).map((item) => ({
        ...item,
        profile: normalizeProfile(item.profile),
      })) as Comment[]

      const commentsWithImages = await Promise.all(rawComments.map(async (comment) => {
        if (!comment.image_path) return { ...comment, image_url: null }
        const { data, error: signedUrlError } = await requireSupabase()
          .storage
          .from(IMAGE_BUCKET)
          .createSignedUrl(comment.image_path, 60 * 60)
        if (signedUrlError) return { ...comment, image_url: null }
        return { ...comment, image_url: data.signedUrl }
      }))

      setGroup(nextGroup)
      setProblem(problemResult.data as Problem)
      setComments(commentsWithImages)
      setError('')
    } catch (caught) {
      setError(errorMessage(caught))
    }
  }, [groupId, problemId])

  useEffect(() => { void load() }, [load])

  useEffect(() => () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
  }, [imagePreview])

  function selectImage(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]
    if (!selected) return
    if (!ACCEPTED_IMAGE_TYPES.has(selected.type)) {
      setError('Choose a JPG, PNG, WebP, or GIF image.')
      event.target.value = ''
      return
    }
    if (selected.size > MAX_IMAGE_BYTES) {
      setError('Images must be 5 MB or smaller.')
      event.target.value = ''
      return
    }
    setError('')
    setImage(selected)
    setImagePreview(URL.createObjectURL(selected))
  }

  function clearImage() {
    setImage(null)
    setImagePreview('')
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  async function postComment(event: React.FormEvent) {
    event.preventDefault()
    const trimmedMessage = message.trim()
    const trimmedCode = codeBody.trim()
    if ((!trimmedMessage && !trimmedCode && !image) || !user) return

    setBusy(true)
    setError('')
    let uploadedPath = ''

    try {
      if (image) {
        uploadedPath = `${groupId}/${user.id}/${crypto.randomUUID()}.${imageExtension(image)}`
        const { error: uploadError } = await requireSupabase()
          .storage
          .from(IMAGE_BUCKET)
          .upload(uploadedPath, image, { cacheControl: '3600', contentType: image.type, upsert: false })
        if (uploadError) throw uploadError
      }

      const { error: insertError } = await requireSupabase().from('comments').insert({
        problem_id: problemId,
        user_id: user.id,
        message: trimmedMessage || null,
        image_path: uploadedPath || null,
        code_body: trimmedCode || null,
        code_language: trimmedCode ? codeLanguage : null,
      })
      if (insertError) throw insertError

      setMessage('')
      setCodeBody('')
      setCodeLanguage('Java')
      setShowCodeEditor(false)
      clearImage()
      await load()
    } catch (caught) {
      if (uploadedPath) await requireSupabase().storage.from(IMAGE_BUCKET).remove([uploadedPath])
      setError(errorMessage(caught))
    } finally {
      setBusy(false)
    }
  }

  async function deleteComment(comment: Comment) {
    if (!isAdmin || !window.confirm('Delete this discussion post? This cannot be undone.')) return
    setDeletingId(comment.id)
    setError('')
    try {
      const { error: deleteError } = await requireSupabase()
        .from('comments')
        .delete()
        .eq('id', comment.id)
        .eq('problem_id', problemId)
      if (deleteError) throw deleteError
      let cleanupWarning = ''
      if (comment.image_path) {
        const { error: removeImageError } = await requireSupabase().storage.from(IMAGE_BUCKET).remove([comment.image_path])
        if (removeImageError) cleanupWarning = 'The post was deleted, but its image could not be removed from storage.'
      }
      await load()
      if (cleanupWarning) setError(cleanupWarning)
    } catch (caught) {
      setError(errorMessage(caught))
    } finally {
      setDeletingId('')
    }
  }

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      setError('The code could not be copied. Select it and copy it manually.')
    }
  }

  const canPost = Boolean(message.trim() || codeBody.trim() || image)

  return (
    <AppShell backTo={`/group/${groupId}`} backLabel="Dashboard">
      <div className="page page--narrow discussion-page">
        <div className="page-heading discussion-heading">
          <p className="eyebrow"><MessageCircle size={15} /> Open discussion</p>
          <h1>{problem?.title ?? 'Loading discussion...'}</h1>
          <p>Share your approach, a screenshot, or a readable code solution with the group.</p>
        </div>
        <Feedback message={error} />
        <section className="card comments-card">
          <div className="comment-list">
            {comments.length ? comments.map((comment) => (
              <article className="comment" key={comment.id}>
                <div className="comment-meta">
                  <div><strong>{comment.profile.display_name}</strong><time>{formatTimestamp(comment.created_at)}</time></div>
                  {isAdmin && (
                    <button className="comment-delete" type="button" disabled={deletingId === comment.id} onClick={() => void deleteComment(comment)} aria-label={`Delete ${comment.profile.display_name}'s post`}>
                      <Trash2 size={15} /> {deletingId === comment.id ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </div>
                {comment.message && <p>{comment.message}</p>}
                {comment.image_url && (
                  <a className="comment-image" href={comment.image_url} target="_blank" rel="noopener noreferrer">
                    <img src={comment.image_url} alt={`Shared by ${comment.profile.display_name}`} loading="lazy" />
                  </a>
                )}
                {comment.image_path && !comment.image_url && <p className="attachment-error">Image preview is temporarily unavailable.</p>}
                {comment.code_body && (
                  <div className="code-block">
                    <div className="code-block__header">
                      <span>{comment.code_language || 'Code'}</span>
                      <button type="button" onClick={() => void copyCode(comment.code_body!)}><Copy size={14} /> Copy</button>
                    </div>
                    <pre><code>{comment.code_body}</code></pre>
                  </div>
                )}
              </article>
            )) : (
              <div className="empty-comments"><MessageCircle size={27} /><h2>No posts yet.</h2><p>Start the discussion after you've attempted the problem.</p></div>
            )}
          </div>
          <form className="comment-form" onSubmit={postComment}>
            <label htmlFor="comment">Add to the discussion</label>
            <textarea id="comment" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={1000} rows={4} placeholder="Explain your approach or ask the group a question..." />

            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Selected upload preview" />
                <div><strong>{image?.name}</strong><span>{image ? `${(image.size / 1024 / 1024).toFixed(1)} MB` : ''}</span></div>
                <button type="button" onClick={clearImage} aria-label="Remove selected image"><X size={17} /></button>
              </div>
            )}

            {showCodeEditor && (
              <div className="code-composer">
                <div className="code-composer__top">
                  <label>Language
                    <select value={codeLanguage} onChange={(event) => setCodeLanguage(event.target.value)}>
                      <option>Java</option><option>JavaScript</option><option>TypeScript</option><option>Python</option><option>C++</option><option>SQL</option><option>Plain text</option>
                    </select>
                  </label>
                  <button type="button" onClick={() => { setShowCodeEditor(false); setCodeBody('') }} aria-label="Remove code section"><X size={17} /></button>
                </div>
                <label htmlFor="code-body">Code section
                  <textarea id="code-body" className="code-textarea" value={codeBody} onChange={(event) => setCodeBody(event.target.value)} maxLength={8000} rows={9} spellCheck={false} placeholder="Paste your code here..." />
                </label>
                <span className="code-count">{codeBody.length}/8000</span>
              </div>
            )}

            <div className="comment-form__footer">
              <div className="composer-tools">
                <label className="composer-tool" title="Add an image">
                  <ImagePlus size={17} /> Image
                  <input ref={imageInputRef} className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={selectImage} />
                </label>
                <button className={`composer-tool ${showCodeEditor ? 'is-active' : ''}`} type="button" onClick={() => setShowCodeEditor(true)}><Code2 size={17} /> Code</button>
              </div>
              <div className="comment-submit"><span>{message.trim().length}/1000</span><button className="button button--primary" disabled={busy || !canPost}>{busy ? 'Posting...' : 'Post'} {!busy && <Send size={16} />}</button></div>
            </div>
          </form>
        </section>
      </div>
    </AppShell>
  )
}

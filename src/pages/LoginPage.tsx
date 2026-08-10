import { ArrowRight, Check, Flame, Users } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Feedback } from '../components/Feedback'
import { useAuth } from '../context/AuthContext'
import { errorMessage, requireSupabase } from '../lib/supabase'

export function LoginPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState('')

  if (!loading && user) return <Navigate to="/onboarding" replace />

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    setSuccess('')

    try {
      const client = requireSupabase()
      if (mode === 'signup') {
        const { data, error } = await client.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { display_name: name.trim() || email.split('@')[0] } },
        })
        if (error) throw error
        if (!data.session) {
          setSuccess('Account created. Check your email to confirm, then sign in.')
          setMode('signin')
          return
        }
      } else {
        const { error } = await client.auth.signInWithPassword({ email: email.trim(), password })
        if (error) throw error
      }

      const requested = (location.state as { from?: string } | null)?.from
      navigate(requested || '/onboarding', { replace: true })
    } catch (error) {
      setMessage(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-story">
        <div className="brand brand--large">
          <span className="brand-mark"><Flame size={21} fill="currentColor" /></span>
          <span>CodeStreak</span>
        </div>
        <div>
          <p className="eyebrow">Built for small DSA groups</p>
          <h1>Solve together.<br />Stay consistent.</h1>
          <p className="story-copy">
            One daily problem, one honest check-in, and a clear view of who is still showing up.
          </p>
        </div>
        <div className="story-points">
          <span><Check size={17} /> Daily accountability without chat noise</span>
          <span><Users size={17} /> Private progress for your group</span>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <p className="eyebrow">{mode === 'signin' ? 'Welcome back' : 'Start your streak'}</p>
          <h2>{mode === 'signin' ? 'Sign in to your group' : 'Create your account'}</h2>
          <p className="muted">Use the same email each day so your completion history stays together.</p>

          <form className="form-stack" onSubmit={submit}>
            {mode === 'signup' && (
              <label>
                Display name
                <input value={name} onChange={(event) => setName(event.target.value)} maxLength={60} required placeholder="Divyanshu" />
              </label>
            )}
            <label>
              Email
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="you@example.com" />
            </label>
            <label>
              Password
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} placeholder="At least 6 characters" />
            </label>
            <Feedback message={message} />
            <Feedback message={success} tone="success" />
            <button className="button button--primary button--wide" disabled={busy}>
              {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
              {!busy && <ArrowRight size={18} />}
            </button>
          </form>

          <button className="text-button" type="button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage(''); setSuccess('') }}>
            {mode === 'signin' ? 'New here? Create an account' : 'Already have an account? Sign in'}
          </button>
        </div>
      </section>
    </div>
  )
}

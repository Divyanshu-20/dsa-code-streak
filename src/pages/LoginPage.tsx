import { ArrowRight, Check, Code2, Users } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Feedback } from '../components/Feedback'
import { useAuth } from '../context/AuthContext'
import { errorMessage, requireSupabase } from '../lib/supabase'

const POST_AUTH_DESTINATION_KEY = 'codestreak-post-auth-destination'

function safeDestination(value: unknown) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
    ? value
    : '/onboarding'
}

function friendlyAuthError(error: unknown) {
  const detail = errorMessage(error)
  const normalized = detail.toLowerCase()

  if (normalized.includes('email rate limit exceeded') || normalized.includes('over_email_send_rate_limit')) {
    return 'Too many confirmation emails were requested. Continue with Google now, or try email again later.'
  }
  if (normalized.includes('invalid login credentials')) {
    return 'That email and password do not match. Try again, or continue with Google.'
  }
  if (normalized.includes('provider is not enabled') || normalized.includes('unsupported provider')) {
    return 'Google sign-in is not enabled yet. Please use email and password for now.'
  }

  return detail
}

export function LoginPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState<'google' | 'email' | ''>('')
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState('')
  const [destination] = useState(() => {
    const requested = (location.state as { from?: string } | null)?.from
    return safeDestination(requested ?? window.sessionStorage.getItem(POST_AUTH_DESTINATION_KEY))
  })

  if (!loading && user) {
    window.sessionStorage.removeItem(POST_AUTH_DESTINATION_KEY)
    return <Navigate to={destination} replace />
  }

  async function continueWithGoogle() {
    setBusy('google')
    setMessage('')
    setSuccess('')
    window.sessionStorage.setItem(POST_AUTH_DESTINATION_KEY, destination)

    try {
      const { error } = await requireSupabase().auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/login` },
      })
      if (error) throw error
    } catch (error) {
      window.sessionStorage.removeItem(POST_AUTH_DESTINATION_KEY)
      setMessage(friendlyAuthError(error))
      setBusy('')
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy('email')
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

      navigate(destination, { replace: true })
    } catch (error) {
      setMessage(friendlyAuthError(error))
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-story">
        <div className="brand brand--large">
          <span className="brand-mark"><Code2 size={22} strokeWidth={2.6} /></span>
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
          <p className="muted">One tap with Google is the easiest way to keep your progress together.</p>

          <button className="button button--google button--wide" type="button" disabled={Boolean(busy)} onClick={continueWithGoogle}>
            <span className="google-mark" aria-hidden="true">G</span>
            {busy === 'google' ? 'Opening Google...' : 'Continue with Google'}
          </button>

          <div className="auth-divider"><span>or use email</span></div>

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
            <button className="button button--primary button--wide" disabled={Boolean(busy)}>
              {busy === 'email' ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
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

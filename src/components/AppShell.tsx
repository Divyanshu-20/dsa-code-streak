import { ArrowLeft, Flame, LogOut } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { requireSupabase } from '../lib/supabase'

interface AppShellProps {
  children: React.ReactNode
  backTo?: string
  backLabel?: string
}

export function AppShell({ children, backTo, backLabel = 'Back' }: AppShellProps) {
  const navigate = useNavigate()

  async function signOut() {
    await requireSupabase().auth.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          {backTo ? (
            <Link className="back-link" to={backTo}>
              <ArrowLeft size={18} /> {backLabel}
            </Link>
          ) : (
            <Link className="brand" to="/onboarding" aria-label="CodeStreak home">
              <span className="brand-mark"><Flame size={19} fill="currentColor" /></span>
              <span>CodeStreak</span>
            </Link>
          )}
          <button className="icon-button" type="button" onClick={signOut} aria-label="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}

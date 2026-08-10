import { Database, Rocket } from 'lucide-react'

export function ConfigPage() {
  return (
    <div className="auth-page">
      <section className="auth-card config-card">
        <div className="eyebrow"><Database size={15} /> One setup step remains</div>
        <h1>Connect CodeStreak to Supabase</h1>
        <p>
          The interface is ready. Add the project URL and publishable key to enable secure sign-in and saved group progress.
        </p>
        <div className="config-keys">
          <code>VITE_SUPABASE_URL</code>
          <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>
        </div>
        <div className="notice-row"><Rocket size={18} /> These values are configured in Vercel, not typed into this page.</div>
      </section>
    </div>
  )
}

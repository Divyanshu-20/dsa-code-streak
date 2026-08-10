import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { isSupabaseConfigured } from './lib/supabase'
import { AdminProblemPage } from './pages/AdminProblemPage'
import { ConfigPage } from './pages/ConfigPage'
import { DiscussionPage } from './pages/DiscussionPage'
import { GroupDashboardPage } from './pages/GroupDashboardPage'
import { LoginPage } from './pages/LoginPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { ProgressPage } from './pages/ProgressPage'

function Protected({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}

export default function App() {
  if (!isSupabaseConfigured) return <ConfigPage />

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/onboarding" element={<Protected><OnboardingPage /></Protected>} />
      <Route path="/group/:groupId" element={<Protected><GroupDashboardPage /></Protected>} />
      <Route path="/group/:groupId/progress" element={<Protected><ProgressPage /></Protected>} />
      <Route path="/group/:groupId/problem/:problemId" element={<Protected><DiscussionPage /></Protected>} />
      <Route path="/group/:groupId/admin/problem" element={<Protected><AdminProblemPage /></Protected>} />
      <Route path="*" element={<Navigate to="/onboarding" replace />} />
    </Routes>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { loadProgress, saveProgress } from './lib/supabase'
import { signOut } from './lib/auth'
import { useAuth } from './hooks/useAuth'
import { useGymSplits } from './hooks/useGymSplits'
import { useTheme } from './hooks/useTheme'
import { WEEKS } from './data/plan'
import AuthGate    from './components/AuthGate'
import ThemeToggle from './components/ThemeToggle'
import UserMenu    from './components/UserMenu'
import SyncDot     from './components/SyncDot'
import Dashboard   from './pages/Dashboard'
import Plan        from './pages/Plan'
import Gym         from './pages/Gym'
import Recovery    from './pages/Recovery'
import Nutrition   from './pages/Nutrition'
import FoodPlanner     from './pages/FoodPlanner'
import WorkoutPlanner from './pages/WorkoutPlanner'
import type { Progress, SyncStatus, NavId, NavItem } from './types'

// ─── Nav config ───────────────────────────────────────────────────────────────

const AUTH_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Overview',  icon: '📊' },
  { id: 'plan',      label: 'Plan',      icon: '📅' },
  { id: 'gym',       label: 'Gym',       icon: '🏋️' },
  { id: 'recovery',  label: 'Recovery',  icon: '🧘' },
  { id: 'nutrition', label: 'Nutrition', icon: '🥗' },
  { id: 'food',      label: 'Meals',     icon: '🍽' },
  { id: 'workout',   label: 'Workout',   icon: '💪' },
]
const MEALS_NAV_IDS: NavId[] = ['food', 'workout']

// Map NavId → URL path and vice-versa
const NAV_TO_PATH: Record<NavId, string> = {
  dashboard: '/',
  plan:      '/plan',
  gym:       '/gym',
  recovery:  '/recovery',
  nutrition: '/nutrition',
  food:      '/meals',
  workout:   '/workout',
}

const PATH_TO_NAV: Record<string, NavId> = Object.fromEntries(
  Object.entries(NAV_TO_PATH).map(([k, v]) => [v, k as NavId])
)

// ─── Shared Shell ─────────────────────────────────────────────────────────────

interface ShellProps {
  nav:         NavItem[]
  theme:       'dark' | 'light'
  onToggle:    () => void
  pct?:        number
  completed?:  number
  total?:      number
  syncStatus?: SyncStatus
  user?:       { id: string; email?: string; name?: string; avatarUrl?: string; provider: string } | null
  children:    React.ReactNode
}

function Shell({ nav, theme, onToggle, pct, completed, total, syncStatus, user, children }: ShellProps) {
  const navigate  = useNavigate()
  const { pathname } = useLocation()
  const activeId = PATH_TO_NAV[pathname] ?? 'dashboard'

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100dvh', paddingBottom: 80 }}>
      {/* ── Header ── */}
      <header style={{
        background: 'var(--bg-header)',
        borderBottom: '1px solid var(--border)',
        padding: '12px 20px',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: 'var(--shadow)',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>

            {/* ── Left branding: changes between training and meals contexts ── */}
            <div style={{ minWidth: 0, flex: 1 }}>
              {syncStatus ? (
                /* Training app branding */
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    background: activeId === 'food'
                      ? 'linear-gradient(135deg,#f59e0b,#ef4444)'
                      : activeId === 'workout'
                      ? 'linear-gradient(135deg,#a78bfa,#60a5fa)'
                      : 'linear-gradient(135deg,#4ade80,#22d3ee)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 17,
                  }}>
                    {activeId === 'food' ? '🍽' : activeId === 'workout' ? '💪' : '🏃'}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.2, color: 'var(--text-primary)' }}>
                      {activeId === 'food' ? 'Meal Planner' : activeId === 'workout' ? 'Workout Planner' : 'Training Hub'}
                    </div>
                    <SyncDot status={syncStatus} />
                  </div>
                </div>
              ) : (
                /* Public meals branding */
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: 'linear-gradient(135deg,#f59e0b,#ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>
                    🍽
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.2, color: 'var(--text-primary)' }}>
                      Meal Planner
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                      Shared plan
                      <span style={{ color: 'var(--border-input)' }}>·</span>
                      <Link to="/" style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 600 }}>Sign in for training</Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right: controls ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <ThemeToggle theme={theme} onToggle={onToggle} />
              {pct !== undefined && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green)', lineHeight: 1 }}>{pct}%</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{completed}/{total}</div>
                </div>
              )}
              {user
                ? <UserMenu user={user} onSignOut={signOut} />
                : (
                  <Link to="/" style={{ textDecoration: 'none' }}>
                    <button style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: 'var(--green)', color: 'var(--bg)', border: 'none', cursor: 'pointer' }}>
                      Sign in
                    </button>
                  </Link>
                )
              }
            </div>
          </div>

          {/* Progress bar — training sections only */}
          {pct !== undefined && activeId !== 'food' && activeId !== 'workout' && (
            <div style={{ marginTop: 10, height: 3, background: 'var(--bg-track)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,var(--green),var(--blue))', borderRadius: 2, transition: 'width 0.6s' }} />
            </div>
          )}
        </div>
      </header>

      {/* ── Page content ── */}
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '20px 16px 8px' }}>
        {children}
      </main>

      {/* ── Bottom nav ── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--bg-nav)', borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'stretch',
        padding: '4px 6px max(10px,env(safe-area-inset-bottom))',
        zIndex: 100, backdropFilter: 'blur(16px)',
      }}>
        {nav.map((item, idx) => {
          const active  = activeId === item.id
          const isMeals = MEALS_NAV_IDS.includes(item.id)
          const prev    = nav[idx - 1]
          const sectionBreak = isMeals && prev && !MEALS_NAV_IDS.includes(prev.id)

          return (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', flex: sectionBreak ? '0 0 auto' : 1 }}>
              {/* Vertical divider between training and meals sections */}
              {sectionBreak && (
                <div style={{ width: 1, height: 36, background: 'var(--border)', margin: '0 2px', flexShrink: 0 }} />
              )}
              <button
                onClick={() => navigate(NAV_TO_PATH[item.id])}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2, padding: '5px 4px 4px',
                  borderRadius: 10,
                  background: active
                    ? item.id === 'workout' ? 'rgba(167,139,250,0.12)' : isMeals ? 'rgba(245,158,11,0.12)' : 'rgba(74,222,128,0.12)'
                    : 'transparent',
                  color: active
                    ? item.id === 'workout' ? 'var(--purple)' : isMeals ? 'var(--amber)' : 'var(--green)'
                    : 'var(--text-muted)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.18s',
                  minWidth: 44, maxWidth: 72,
                }}
              >
                <span style={{ fontSize: 20, lineHeight: '22px', display: 'block', textAlign: 'center' }}>{item.icon}</span>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.01em', lineHeight: 1.2, textAlign: 'center', whiteSpace: 'nowrap' }}>{item.label}</span>
              </button>
            </div>
          )
        })}
      </nav>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computeOverall(progress: Progress) {
  const completed = WEEKS.reduce((acc, w) =>
    acc + w.runs.filter((_, i) => progress[`w${w.week}_run_${i}`]).length
        + w.gym.filter((_,  i) => progress[`w${w.week}_gym_${i}`]).length, 0)
  const total = WEEKS.reduce((acc, w) => acc + w.runs.length + w.gym.length, 0)
  return { completed, total, pct: Math.round((completed / total) * 100) }
}

// ─── Authenticated App ────────────────────────────────────────────────────────

type AuthUserShape = NonNullable<ReturnType<typeof useAuth>['user']>

function TrainingApp({ userId, user }: { userId: string; user: AuthUserShape }) {
  const { theme, toggleTheme }  = useTheme()
  const [progress, setProgress] = useState<Progress>({})
  const [loaded, setLoaded]     = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')

  const { gymSplits, loading: gymLoading, error: gymError, refetch: refetchGym } = useGymSplits()

  useEffect(() => {
    setProgress({}); setLoaded(false); setSyncStatus('saving')
    loadProgress()
      .then(d => { setProgress(d); setLoaded(true); setSyncStatus('saved'); setTimeout(() => setSyncStatus('idle'), 2500) })
      .catch(() => { setLoaded(true); setSyncStatus('error') })
  }, [userId])

  const persist = useCallback(async (next: Progress) => {
    setSyncStatus('saving')
    try { await saveProgress(next); setSyncStatus('saved'); setTimeout(() => setSyncStatus('idle'), 2000) }
    catch { setSyncStatus('error') }
  }, [])

  const handleSaveSetting = useCallback((key: string, value: string) => {
    setProgress(p => { const n = { ...p, [key]: value }; void persist(n); return n })
  }, [persist])

  const handleToggle = useCallback((key: string, value?: string, isText = false) => {
    setProgress(p => {
      const n: Progress = isText ? { ...p, [key]: value ?? '' } : { ...p, [key]: !p[key] }
      if (!isText) void persist(n)
      return n
    })
  }, [persist])

  const handleSaveNote = useCallback(async (weekNum: number, text: string) => {
    const key  = `w${weekNum}_note`
    const next = { ...progress, [key]: text }
    setProgress(next); await persist(next)
  }, [progress, persist])

  const { completed, total, pct } = computeOverall(progress)

  if (!loaded) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100dvh', gap: 14, background: 'var(--bg)' }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#4ade80,#22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🏃</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Training Hub</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading your plan…</div>
      </div>
      <div style={{ width: 160, height: 3, background: 'var(--bg-track)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: '40%', background: 'var(--green)', borderRadius: 2, animation: 'loadSlide 1.2s ease infinite' }} />
      </div>
    </div>
  )

  return (
    <Shell nav={AUTH_NAV} theme={theme} onToggle={toggleTheme}
      pct={pct} completed={completed} total={total}
      syncStatus={syncStatus} user={user}
    >
      <Routes>
        <Route path="/"          element={<Dashboard progress={progress} />} />
        <Route path="/plan"      element={<Plan progress={progress} gymSplits={gymSplits} onToggle={handleToggle} onSaveNote={handleSaveNote} onSaveSetting={handleSaveSetting} onRefetch={refetchGym} />} />
        <Route path="/gym"       element={<Gym gymSplits={gymSplits} gymLoading={gymLoading} gymError={gymError} onRefetch={refetchGym} />} />
        <Route path="/recovery"  element={<Recovery />} />
        <Route path="/nutrition" element={<Nutrition />} />
        <Route path="/meals"     element={<FoodPlanner />} />
        <Route path="/workout"  element={<WorkoutPlanner />} />
        {/* Catch-all → dashboard */}
        <Route path="*"          element={<Dashboard progress={progress} />} />
      </Routes>
    </Shell>
  )
}

// ─── Public Meals page (no auth) ─────────────────────────────────────────────

function PublicMealsPage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Shell
      nav={[{ id: 'food', label: 'Meals', icon: '🍽' }]}
      theme={theme} onToggle={toggleTheme}
      user={null}
    >
      <FoodPlanner />
    </Shell>
  )
}

// ─── Auth page (sign-in / sign-up) ───────────────────────────────────────────

function AuthPage() {
  const { theme, toggleTheme } = useTheme()

  // Wrap AuthGate so theme toggle is still visible
  return (
    <div style={{ position: 'relative' }}>
      {/* Floating theme toggle top-right */}
      <div style={{ position: 'fixed', top: 16, right: 20, zIndex: 200 }}>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>
      <AuthGate />
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const { user, loading: authLoading } = useAuth()
  const location = useLocation()

  // Show auth loading splash
  if (authLoading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100dvh', gap: 12, background: 'var(--bg)' }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#4ade80,#22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🏃</div>
      <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>Loading…</div>
    </div>
  )

  // /meals is always public regardless of auth
  if (location.pathname === '/meals') {
    if (user) {
      // Authenticated users get the full app shell at /meals
      return <TrainingApp key={user.id} userId={user.id} user={user} />
    }
    return <PublicMealsPage />
  }

  // All other routes: require auth
  if (!user) return <AuthPage />

  return <TrainingApp key={user.id} userId={user.id} user={user} />
}

import { useState, useEffect, useCallback } from 'react'
import { loadProgress, saveProgress } from './lib/supabase'
import { WEEKS } from './data/plan'
import SyncDot from './components/SyncDot'
import Dashboard from './pages/Dashboard'
import Plan from './pages/Plan'
import Gym from './pages/Gym'
import Recovery from './pages/Recovery'
import Nutrition from './pages/Nutrition'
import type { Progress, SyncStatus, NavId, NavItem } from './types'

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'plan', label: 'Plan', icon: '📅' },
  { id: 'gym', label: 'Gym', icon: '🏋️' },
  { id: 'recovery', label: 'Recovery', icon: '🧘' },
  { id: 'nutrition', label: 'Nutrition', icon: '🥗' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeOverall(progress: Progress): { completed: number; total: number; pct: number } {
  const completed = WEEKS.reduce(
    (acc, w) =>
      acc +
      w.runs.filter((_, i) => progress[`w${w.week}_run_${i}`]).length +
      w.gym.filter((_, i) => progress[`w${w.week}_gym_${i}`]).length,
    0
  )
  const total = WEEKS.reduce((acc, w) => acc + w.runs.length + w.gym.length, 0)
  return { completed, total, pct: Math.round((completed / total) * 100) }
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<NavId>('dashboard')
  const [progress, setProgress] = useState<Progress>({})
  const [loaded, setLoaded] = useState<boolean>(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')

  // ── Load from Supabase on mount ─────────────────────────────────────────────
  useEffect(() => {
    setSyncStatus('saving')
    loadProgress()
      .then((data) => {
        setProgress(data)
        setLoaded(true)
        setSyncStatus('saved')
        setTimeout(() => setSyncStatus('idle'), 2500)
      })
      .catch((err: unknown) => {
        console.error('Failed to load progress:', err)
        setLoaded(true)
        setSyncStatus('error')
      })
  }, [])

  // ── Persist helper ──────────────────────────────────────────────────────────
  const persist = useCallback(async (next: Progress): Promise<void> => {
    setSyncStatus('saving')
    try {
      await saveProgress(next)
      setSyncStatus('saved')
      setTimeout(() => setSyncStatus('idle'), 2000)
    } catch (err: unknown) {
      console.error('Save failed:', err)
      setSyncStatus('error')
    }
  }, [])

  // ── Toggle a boolean checkbox key, or set a text value ─────────────────────
  const handleToggle = useCallback(
    (key: string, value?: string, isText = false): void => {
      setProgress((prev) => {
        const next: Progress = isText
          ? { ...prev, [key]: value ?? '' }
          : { ...prev, [key]: !prev[key] }
        if (!isText) void persist(next)
        return next
      })
    },
    [persist]
  )

  // ── Explicitly save a week note ─────────────────────────────────────────────
  const handleSaveNote = useCallback(
    async (weekNum: number, text: string): Promise<void> => {
      const key = `w${weekNum}_note`
      const next = { ...progress, [key]: text }
      setProgress(next)
      await persist(next)
    },
    [progress, persist]
  )

  const { completed, total, pct } = computeOverall(progress)

  // ── Loading screen ──────────────────────────────────────────────────────────
  if (!loaded) {
    return (
      <div
        style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          height: '100dvh', gap: 14,
          background: 'var(--bg)', color: 'var(--text-primary)',
        }}
      >
        <div style={{ fontSize: 40 }}>🏃</div>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Loading training plan…</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Opening the app</div>
        <div style={{ width: 180, height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%', width: '40%',
              background: 'var(--green)', borderRadius: 2,
              animation: 'loadSlide 1.2s ease infinite',
            }}
          />
        </div>
        <style>{`
          @keyframes loadSlide {
            0%   { transform: translateX(-200%); }
            100% { transform: translateX(500%); }
          }
        `}</style>
      </div>
    )
  }

  // ── Main layout ─────────────────────────────────────────────────────────────
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100dvh', paddingBottom: 76 }}>

      {/* ── Sticky header ── */}
      <header
        style={{
          background: 'linear-gradient(180deg, var(--bg-header) 0%, var(--bg) 100%)',
          borderBottom: '1px solid var(--border)',
          padding: '14px 20px 12px',
          position: 'sticky', top: 0, zIndex: 100,
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                14K Training Plan
              </div>
              <SyncDot status={syncStatus} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--green)', lineHeight: 1 }}>
                {pct}%
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                {completed}/{total} sessions
              </div>
            </div>
          </div>

          {/* Overall progress bar */}
          <div
            style={{
              marginTop: 10, height: 4,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 2, overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${pct}%`,
                background: 'linear-gradient(90deg, var(--green), var(--blue))',
                borderRadius: 2,
                transition: 'width 0.6s ease',
              }}
            />
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '20px 16px 4px' }}>
        {view === 'dashboard' && <Dashboard progress={progress} />}
        {view === 'plan' && (
          <Plan
            progress={progress}
            onToggle={handleToggle}
            onSaveNote={handleSaveNote}
          />
        )}
        {view === 'gym' && <Gym />}
        {view === 'recovery' && <Recovery />}
        {view === 'nutrition' && <Nutrition />}
      </main>

      {/* ── Bottom nav ── */}
      <nav
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'rgba(10,10,15,0.97)',
          borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-around',
          padding: 'calc(8px) 0 max(12px, env(safe-area-inset-bottom))',
          zIndex: 100,
          backdropFilter: 'blur(16px)',
        }}
      >
        {NAV.map((item) => {
          const active = view === item.id
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 3, padding: '4px 10px', borderRadius: 10,
                background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
                color: active ? 'var(--green)' : 'var(--text-muted)',
                border: 'none',
                transition: 'all 0.2s',
                cursor: 'pointer',
                minWidth: 52,
              }}
            >
              <span style={{ fontSize: 20, lineHeight: 1 }}>{item.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 600 }}>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

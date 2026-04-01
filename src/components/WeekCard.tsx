import { PHASE_COLORS } from '../data/plan'
import { weekDateRange } from '../lib/dates'
import type { WeekCardProps } from '../types'

export default function WeekCard({ weekData, progress, isActive, onClick }: WeekCardProps) {
  const pc = PHASE_COLORS[weekData.phase]

  const completedRuns = weekData.runs.filter((_, i) => progress[`w${weekData.week}_run_${i}`]).length
  const completedGym  = weekData.gym.filter((_,  i) => progress[`w${weekData.week}_gym_${i}`]).length
  const totalSessions = weekData.runs.length + weekData.gym.length
  const doneSessions  = completedRuns + completedGym
  const allDone       = totalSessions > 0 && doneSessions === totalSessions
  const pct           = totalSessions > 0 ? (doneSessions / totalSessions) * 100 : 0

  return (
    <div
      onClick={() => onClick(weekData.week)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(weekData.week)}
      style={{
        background: isActive ? pc.bg : 'rgba(255,255,255,0.03)',
        border: `1.5px solid ${isActive ? pc.border : 'var(--border)'}`,
        borderRadius: 12,
        padding: '13px 14px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        position: 'relative',
        outline: 'none',
        userSelect: 'none',
      }}
    >
      {/* Top badges */}
      <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4, alignItems: 'center' }}>
        {allDone && <span style={{ fontSize: 13 }}>✅</span>}
        {weekData.deload === true && (
          <span style={{
            background: 'rgba(167,139,250,0.2)',
            border: '1px solid var(--purple)',
            borderRadius: 4,
            padding: '1px 5px',
            fontSize: 8,
            color: 'var(--purple)',
            fontWeight: 700,
            letterSpacing: '0.06em',
          }}>
            DELOAD
          </span>
        )}
      </div>

      {/* Week + phase label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{
          background: pc.bg,
          border: `1px solid ${pc.border}`,
          borderRadius: 6,
          padding: '2px 7px',
          fontSize: 10,
          fontWeight: 700,
          color: pc.text,
          letterSpacing: '0.05em',
        }}>
          WK {weekData.week}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Ph{weekData.phase}</span>
      </div>

      {/* Date range */}
      <div style={{ fontSize: 10, color: pc.text, marginBottom: 4, fontWeight: 600, opacity: 0.85 }}>
        {weekDateRange(weekData.week)}
      </div>

      {/* Focus line */}
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.35 }}>
        {weekData.focus}
      </div>

      {/* Progress bar + counts */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          🏃 {completedRuns}/{weekData.runs.length} · 🏋️ {completedGym}/{weekData.gym.length}
        </span>
        <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
          <div style={{
            height: '100%',
            borderRadius: 2,
            background: pc.border,
            width: `${pct}%`,
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>
    </div>
  )
}

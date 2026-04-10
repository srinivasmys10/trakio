import type { SyncDotProps, SyncStatus } from '../types'

interface StatusConfig {
  color: string
  label: string | null
  glow: boolean
}

const STATUS_CONFIG: Record<SyncStatus, StatusConfig> = {
  idle:   { color: 'var(--text-faint)', label: null,                   glow: false },
  saving: { color: '#f59e0b',               label: 'Syncing to Supabase…', glow: true  },
  saved:  { color: '#4ade80',               label: 'Saved to Supabase ✓',  glow: false },
  error:  { color: '#f87171',               label: '⚠ Sync error',         glow: false },
}

export default function SyncDot({ status }: SyncDotProps) {
  const s = STATUS_CONFIG[status]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
      <div
        className={status === 'saving' ? 'pulse' : ''}
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: s.color,
          boxShadow: s.glow ? `0 0 8px ${s.color}` : 'none',
          transition: 'background 0.4s, box-shadow 0.4s',
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
        {s.label ?? '5:00 /km goal · 17 weeks · Week 1 starts 6 Apr 2026'}
      </span>
    </div>
  )
}

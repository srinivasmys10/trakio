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

  // Hide entirely when idle (no active message to show)
  if (status === 'idle') return null

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
      <div
        className={status === 'saving' ? 'pulse' : ''}
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: s.color,
          boxShadow: s.glow ? `0 0 6px ${s.color}` : 'none',
          transition: 'background 0.4s, box-shadow 0.4s',
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
        {s.label}
      </span>
    </div>
  )
}

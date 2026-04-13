import type { DayPickerProps } from '../types'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

export default function DayPicker({ currentDay, onSelect, onCancel }: DayPickerProps) {
  return (
    <div
      style={{
        marginTop: 10,
        padding: '12px 14px',
        background: 'var(--surface)',
        border: '1px solid var(--border-input)',
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Pick new day
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {DAYS.map((day) => {
          const active = day === currentDay
          return (
            <button
              key={day}
              onClick={() => onSelect(day)}
              style={{
                padding: '5px 10px',
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                border: `1.5px solid ${active ? 'var(--green)' : 'var(--border-input)'}`,
                background: active ? 'rgba(74,222,128,0.15)' : 'var(--surface)',
                color: active ? 'var(--green)' : 'var(--text-secondary)',
                transition: 'all 0.15s',
              }}
            >
              {day}
            </button>
          )
        })}
      </div>

      <button
        onClick={onCancel}
        style={{
          alignSelf: 'flex-start',
          padding: '4px 10px',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 600,
          cursor: 'pointer',
          border: '1px solid var(--border)',
          background: 'transparent',
          color: 'var(--text-muted)',
        }}
      >
        Cancel
      </button>
    </div>
  )
}

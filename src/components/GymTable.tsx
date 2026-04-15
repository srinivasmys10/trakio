import type { GymTableProps } from '../types'

const COLS = ['Exercise', 'Sets', 'Reps', 'Load', 'Muscles', 'Notes'] as const

export default function GymTable({ splitName, gymSplits }: GymTableProps) {
  // Strip modifier suffixes like "(–20% volume)" before lookup
  const baseKey = splitName.replace(/\s*\(.*?\)\s*/g, '').trim()
  const split   = gymSplits[baseKey] ?? gymSplits[splitName]

  if (!split) {
    return (
      <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
        No exercise data for: <em>{splitName}</em>
      </p>
    )
  }

  return (
    <div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>{split.phase}</p>
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ minWidth: 580 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {COLS.map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left',
                    padding: '6px 8px',
                    color: 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {split.exercises.map((ex, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '9px 8px', color: 'var(--text-primary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{ex.name}</td>
                <td style={{ padding: '9px 8px', color: 'var(--blue)', textAlign: 'center', fontWeight: 700 }}>{ex.sets}</td>
                <td style={{ padding: '9px 8px', color: 'var(--green)', whiteSpace: 'nowrap' }}>{ex.reps}</td>
                <td style={{ padding: '9px 8px', color: 'var(--amber)', fontSize: 11 }}>{ex.weight}</td>
                <td style={{ padding: '9px 8px', color: 'var(--text-secondary)', fontSize: 11 }}>{ex.muscles}</td>
                <td style={{ padding: '9px 8px', color: 'var(--text-muted)', fontSize: 11, fontStyle: 'italic' }}>{ex.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

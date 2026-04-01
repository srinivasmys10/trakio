import { useState } from 'react'
import GymTable from '../components/GymTable'
import Card from '../components/Card'
import SectionTitle from '../components/SectionTitle'
import { GYM_SPLITS } from '../data/plan'

interface PhaseGroup {
  label: string
  keys: string[]
}

const PHASE_GROUPS: PhaseGroup[] = [
  { label: 'Phase 1 — Foundation',  keys: ['Lower Body A', 'Upper Body A', 'Full Body / Core'] },
  { label: 'Phase 2 — Development', keys: ['Lower Body B', 'Upper Body B'] },
  { label: 'Phase 3 — Build',       keys: ['Lower Body C (Heavy)', 'Upper Body C (Heavy)'] },
  {
    label: 'Deload / Taper',
    keys: [
      'Mobility & Core only',
      'Mobility & Core',
      'Core & Mobility only',
      'Gentle mobility only',
      'Upper Body only (light, –50%)',
    ],
  },
]

interface MuscleInfo {
  muscle: string
  why: string
  icon: string
}

const KEY_MUSCLES: MuscleInfo[] = [
  { muscle: 'Glutes',     why: 'Power & injury prevention',    icon: '🍑' },
  { muscle: 'Hamstrings', why: 'Speed & knee protection',      icon: '🦵' },
  { muscle: 'Quads',      why: 'Uphill power & landing force', icon: '💪' },
  { muscle: 'Calves',     why: 'Propulsion & Achilles health', icon: '🦶' },
  { muscle: 'Core',       why: 'Running economy & posture',    icon: '🎯' },
  { muscle: 'Rear Delts', why: 'Posture & arm drive',          icon: '🔙' },
]

export default function Gym() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="fade-in">
      <SectionTitle>All Gym Splits</SectionTitle>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
        3 days / week. Progress A → B → C as you move through phases. Tap any split to reveal the full
        exercise table.
      </p>

      {PHASE_GROUPS.map((group) => (
        <div key={group.label} style={{ marginBottom: 22 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.09em',
            marginBottom: 10,
            paddingLeft: 2,
          }}>
            {group.label}
          </div>

          {group.keys.map((name) => {
            const split      = GYM_SPLITS[name]
            const isExpanded = expanded === name

            return (
              <div
                key={name}
                style={{
                  background: 'var(--surface)',
                  border: `1px solid ${isExpanded ? 'rgba(96,165,250,0.4)' : 'var(--border)'}`,
                  borderRadius: 12,
                  marginBottom: 8,
                  overflow: 'hidden',
                  transition: 'border-color 0.2s',
                }}
              >
                <div
                  onClick={() => setExpanded(isExpanded ? null : name)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setExpanded(isExpanded ? null : name)}
                  style={{
                    padding: '13px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                    outline: 'none',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {split?.exercises.length ?? 0} exercises
                    </div>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </div>

                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '14px 16px 18px', background: 'rgba(0,0,0,0.2)' }}>
                    <GymTable splitName={name} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}

      {/* Key muscle groups */}
      <SectionTitle style={{ marginTop: 4 }}>Key Muscle Groups for Runners</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {KEY_MUSCLES.map((item) => (
          <Card key={item.muscle} style={{ padding: 12, marginBottom: 0 }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{item.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{item.muscle}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.35 }}>{item.why}</div>
          </Card>
        ))}
      </div>
    </div>
  )
}

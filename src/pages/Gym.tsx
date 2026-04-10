import { useState } from 'react'
import GymSplitEditor from '../components/GymSplitEditor'
import Card from '../components/Card'
import SectionTitle from '../components/SectionTitle'
import type { GymPageProps } from '../types'

interface PhaseGroup { label: string; keys: string[] }
const PHASE_GROUPS: PhaseGroup[] = [
  { label: 'Phase 1 — Foundation',  keys: ['Lower Body A', 'Upper Body A', 'Full Body / Core'] },
  { label: 'Phase 2 — Development', keys: ['Lower Body B', 'Upper Body B'] },
  { label: 'Phase 3 — Build',       keys: ['Lower Body C (Heavy)', 'Upper Body C (Heavy)'] },
  { label: 'Deload / Taper', keys: ['Mobility & Core only','Mobility & Core','Core & Mobility only','Gentle mobility only','Upper Body only (light, –50%)'] },
]

interface MuscleInfo { muscle: string; why: string; icon: string }
const KEY_MUSCLES: MuscleInfo[] = [
  { muscle: 'Glutes',     why: 'Power & injury prevention',    icon: '🍑' },
  { muscle: 'Hamstrings', why: 'Speed & knee protection',      icon: '🦵' },
  { muscle: 'Quads',      why: 'Uphill power & landing force', icon: '💪' },
  { muscle: 'Calves',     why: 'Propulsion & Achilles health', icon: '🦶' },
  { muscle: 'Core',       why: 'Running economy & posture',    icon: '🎯' },
  { muscle: 'Rear Delts', why: 'Posture & arm drive',          icon: '🔙' },
]

export default function Gym({ gymSplits, gymLoading, gymError, onRefetch }: GymPageProps) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="fade-in">
      <SectionTitle>All Gym Splits</SectionTitle>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
        3 days / week. Progress A → B → C across phases. Tap to expand, then use 'Edit exercises' to add or remove exercises.
      </p>

      {gymLoading && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 160, height: 3, background: 'var(--surface-hover)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '40%', background: 'var(--blue)', borderRadius: 2, animation: 'loadSlide 1.2s ease infinite' }} />
          </div>
          <style>{"@keyframes loadSlide{0%{transform:translateX(-200%)}100%{transform:translateX(500%)}}"}</style>
          Loading exercises from Supabase…
        </div>
      )}

      {gymError && (
        <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: 14, fontSize: 13, color: 'var(--red)', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <span>⚠</span>
          <div><strong>Failed to load exercises from Supabase.</strong><br /><span style={{ fontSize: 11, opacity: 0.7 }}>{gymError}</span></div>
        </div>
      )}

      {!gymLoading && !gymError && PHASE_GROUPS.map((group) => (
        <div key={group.label} style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 10, paddingLeft: 2 }}>
            {group.label}
          </div>
          {group.keys.map((name) => {
            const split      = gymSplits[name]
            const isExpanded = expanded === name
            return (
              <div key={name} style={{ background: 'var(--surface)', border: `1px solid ${isExpanded ? 'rgba(96,165,250,0.4)' : 'var(--border)'}`, borderRadius: 12, marginBottom: 8, overflow: 'hidden', transition: 'border-color 0.2s' }}>
                <div onClick={() => setExpanded(isExpanded ? null : name)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setExpanded(isExpanded ? null : name)} style={{ padding: '13px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', outline: 'none' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {split ? <>{split.exercises.length} exercises</> : <span style={{ color: 'rgba(248,113,113,0.7)' }}>not loaded</span>}
                    </div>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>{isExpanded ? '▲' : '▼'}</span>
                </div>
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '14px 16px 18px', background: 'var(--overlay-dark)' }}>
                    <GymSplitEditor splitName={name} gymSplits={gymSplits} onRefetch={onRefetch} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}

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

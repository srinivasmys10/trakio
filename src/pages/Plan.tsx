import { useState } from 'react'
import WeekCard from '../components/WeekCard'
import GymTable from '../components/GymTable'
import CheckBox from '../components/CheckBox'
import Tag from '../components/Tag'
import Card from '../components/Card'
import SectionTitle from '../components/SectionTitle'
import { WEEKS, PHASES, PHASE_COLORS, RUN_TYPE_COLORS } from '../data/plan'
import { weekDateRange, sessionDate } from '../lib/dates'
import type { PlanProps } from '../types'

function PaceTag({ pace }: { pace: string }) {
  return (
    <span
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 4,
        padding: '2px 7px',
        fontSize: 11,
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-primary)',
        letterSpacing: '0.03em',
      }}
    >
      {pace} /km
    </span>
  )
}

function DateLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        color: 'var(--text-muted)',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 4,
        padding: '1px 6px',
        whiteSpace: 'nowrap',
        fontFamily: 'var(--font-mono)',
      }}
    >
      {children}
    </span>
  )
}

export default function Plan({ progress, onToggle, onSaveNote }: PlanProps) {
  const [selectedWeek, setSelectedWeek] = useState<number>(1)
  const [expandedGym, setExpandedGym]   = useState<string | null>(null)
  const [savedNote, setSavedNote]       = useState<boolean>(false)

  const weekData = WEEKS.find((w) => w.week === selectedWeek)
  const pc       = PHASE_COLORS[weekData?.phase ?? 1]
  const phase    = PHASES.find((p) => p.id === weekData?.phase)

  const handleSaveNote = async () => {
    if (!weekData) return
    await onSaveNote(selectedWeek, (progress[`w${selectedWeek}_note`] as string) || '')
    setSavedNote(true)
    setTimeout(() => setSavedNote(false), 2200)
  }

  return (
    <div className="fade-in">
      {/* ── Week selector grid ── */}
      <SectionTitle>Select Week</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
        {WEEKS.map((w) => (
          <WeekCard
            key={w.week}
            weekData={w}
            progress={progress}
            isActive={selectedWeek === w.week}
            onClick={setSelectedWeek}
          />
        ))}
      </div>

      {/* ── Selected week detail ── */}
      {weekData && (
        <div className="fade-in">
          {/* Header */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Tag color={pc.text}>Week {weekData.week}</Tag>
            <Tag color={pc.text}>Phase {weekData.phase}: {phase?.name}</Tag>
            {weekData.deload === true && <Tag color="var(--purple)">Deload</Tag>}
          </div>

          {/* Date banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 10,
            padding: '8px 12px',
            background: `${pc.border}11`,
            border: `1px solid ${pc.border}33`,
            borderRadius: 8,
          }}>
            <span style={{ fontSize: 14 }}>📅</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: pc.text }}>
              {weekDateRange(weekData.week)}
            </span>
          </div>

          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 18, lineHeight: 1.55, fontStyle: 'italic' }}>
            {weekData.focus}
          </p>

          {/* ── Running sessions ── */}
          <SectionTitle>{weekData.weeklyKm} km total — Running Sessions</SectionTitle>

          {weekData.runs.map((run, i) => {
            const key    = `w${weekData.week}_run_${i}`
            const done   = !!progress[key]
            const tc     = RUN_TYPE_COLORS[run.type] ?? '#94a3b8'
            const isRace = run.type.includes('RACE')
            // resolve the real calendar date for this session day
            const calDate = sessionDate(weekData.week, run.day)

            return (
              <div
                key={i}
                style={{
                  background: done
                    ? 'rgba(74,222,128,0.05)'
                    : isRace
                    ? 'rgba(251,191,36,0.06)'
                    : 'var(--surface)',
                  border: `1.5px solid ${
                    done
                      ? 'rgba(74,222,128,0.3)'
                      : isRace
                      ? 'rgba(251,191,36,0.35)'
                      : 'var(--border)'
                  }`,
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 10,
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                  transition: 'all 0.2s',
                }}
              >
                <CheckBox checked={done} onChange={() => onToggle(key)} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Day + date + type + km */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                    <DateLabel>{calDate}</DateLabel>
                    <Tag color={tc}>{run.type}</Tag>
                    <span style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 700 }}>
                      {run.distance} km
                    </span>
                  </div>
                  <PaceTag pace={run.pace} />
                  {run.notes && (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.45 }}>
                      {run.notes}
                    </p>
                  )}
                </div>
              </div>
            )
          })}

          {/* ── Gym sessions ── */}
          {weekData.gym.length > 0 && (
            <>
              <SectionTitle style={{ marginTop: 20 }}>Gym Sessions — 3× per week</SectionTitle>

              {weekData.gym.map((g, i) => {
                const key        = `w${weekData.week}_gym_${i}`
                const done       = !!progress[key]
                const expandKey  = `${weekData.week}_${i}`
                const isExpanded = expandedGym === expandKey
                const calDate    = sessionDate(weekData.week, g.day)

                return (
                  <div
                    key={i}
                    style={{
                      background: done ? 'rgba(74,222,128,0.05)' : 'var(--surface)',
                      border: `1.5px solid ${done ? 'rgba(74,222,128,0.3)' : 'var(--border)'}`,
                      borderRadius: 12,
                      marginBottom: 10,
                      overflow: 'hidden',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <div style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <CheckBox checked={done} onChange={() => onToggle(key)} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
                          <DateLabel>{calDate}</DateLabel>
                          <Tag color="var(--blue)">{g.split}</Tag>
                        </div>
                      </div>
                      <button
                        onClick={() => setExpandedGym(isExpanded ? null : expandKey)}
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid var(--border)',
                          borderRadius: 6,
                          color: 'var(--text-muted)',
                          padding: '4px 10px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {isExpanded ? '▲ Hide' : '▼ Exercises'}
                      </button>
                    </div>

                    {isExpanded && (
                      <div
                        style={{
                          borderTop: '1px solid var(--border)',
                          padding: '14px 14px 16px',
                          background: 'rgba(0,0,0,0.2)',
                        }}
                      >
                        <GymTable splitName={g.split} />
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          )}

          {/* ── Coach tip ── */}
          <Card
            style={{
              background: 'rgba(250,204,21,0.06)',
              borderColor: 'rgba(250,204,21,0.25)',
              marginTop: 8,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--yellow)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              💡 Coach Tip
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {weekData.tip}
            </p>
          </Card>

          {/* ── Week notes ── */}
          <SectionTitle style={{ marginTop: 20 }}>Week {weekData.week} Notes</SectionTitle>
          <textarea
            value={(progress[`w${weekData.week}_note`] as string) || ''}
            onChange={(e) =>
              onToggle(`w${weekData.week}_note`, e.target.value, true)
            }
            placeholder="Log how this week felt, any niggles, or personal bests…"
          />
          <button
            onClick={handleSaveNote}
            style={{
              marginTop: 8,
              background: savedNote ? 'rgba(74,222,128,0.18)' : 'rgba(255,255,255,0.07)',
              border: `1px solid ${savedNote ? 'var(--green)' : 'var(--border)'}`,
              borderRadius: 8,
              color: savedNote ? 'var(--green)' : 'var(--text-primary)',
              padding: '9px 20px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {savedNote ? '✓ Saved to Supabase!' : 'Save Note'}
          </button>
        </div>
      )}
    </div>
  )
}

import { useState, useMemo } from 'react'
import {
  MARATHON_PLAN, SESSION_META, RACE_DATE, PLAN_START_DATE,
  type MarathonWeek, type MarathonDay,
} from '../data/marathonPlan'

// ─── Local date helpers ───────────────────────────────────────────────────────

function localISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DOW_LABELS   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

function fmtDate(iso: string): string {
  const d = parseISO(iso)
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`
}
function fmtDateFull(iso: string): string {
  const d = parseISO(iso)
  return `${DOW_LABELS[d.getDay() === 0 ? 6 : d.getDay()-1]} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`
}
function daysUntil(iso: string): number {
  const now   = new Date(); now.setHours(0,0,0,0)
  const target = parseISO(iso)
  return Math.ceil((target.getTime() - now.getTime()) / 86400000)
}

// ─── Progress via localStorage ────────────────────────────────────────────────

const LS_KEY = 'marathon_completed_v1'

function loadCompleted(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set()
  } catch { return new Set() }
}
function saveCompleted(s: Set<string>): void {
  try { localStorage.setItem(LS_KEY, JSON.stringify([...s])) } catch { /* ignore */ }
}
function dayKey(day: MarathonDay): string { return `w${day.weekNum}d${day.dayIndex}` }

// ─── Which week is "current" ──────────────────────────────────────────────────

function currentWeekNum(): number {
  const todayISO = localISO(new Date())
  if (todayISO < PLAN_START_DATE) return 1
  if (todayISO > RACE_DATE)       return MARATHON_PLAN.length
  for (const week of MARATHON_PLAN) {
    const end = week.days[6].date
    if (todayISO <= end) return week.weekNum
  }
  return MARATHON_PLAN.length
}

// ─── Phase colour helper ──────────────────────────────────────────────────────

const PHASE_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  'Base':         { color: 'var(--blue)',   bg: 'rgba(96,165,250,0.1)',   border: 'rgba(96,165,250,0.3)'  },
  'Development':  { color: 'var(--purple)', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.3)' },
  'Peak Training':{ color: 'var(--red)',    bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)' },
  'Sharpening':   { color: 'var(--amber)',  bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)'  },
  'Taper':        { color: 'var(--green)',  bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.3)'  },
  'Race Week':    { color: '#f43f5e',        bg: 'rgba(244,63,94,0.1)',   border: 'rgba(244,63,94,0.35)' },
}

// ─── Day Card ─────────────────────────────────────────────────────────────────

function DayCard({ day, done, onToggle }: {
  day:      MarathonDay
  done:     boolean
  onToggle: () => void
}) {
  const [open, setOpen] = useState(false)
  const m   = SESSION_META[day.session.type]
  const todayISO = localISO(new Date())
  const isToday  = day.date === todayISO
  const isPast   = day.date < todayISO

  return (
    <div style={{
      background: done ? 'rgba(74,222,128,0.07)' : m.bg,
      border: `1px solid ${done ? 'rgba(74,222,128,0.4)' : isToday ? 'var(--blue)' : m.border}`,
      borderRadius: 11, marginBottom: 8, overflow: 'hidden',
      opacity: isPast && !done && day.session.type !== 'race' ? 0.72 : 1,
      transition: 'all 0.2s',
    }}>
      {/* Card header — always visible */}
      <div
        onClick={() => setOpen(v => !v)}
        style={{ padding: '11px 12px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 10 }}
      >
        {/* Checkbox */}
        {day.session.type !== 'race' && (
          <button
            onClick={e => { e.stopPropagation(); onToggle() }}
            aria-label={done ? 'Mark incomplete' : 'Mark complete'}
            style={{
              flexShrink: 0, marginTop: 2,
              width: 20, height: 20, borderRadius: 5,
              border: `2px solid ${done ? 'var(--green)' : m.border}`,
              background: done ? 'rgba(74,222,128,0.25)' : 'transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', transition: 'all 0.18s',
            }}
          >
            {done && <span style={{ color: 'var(--green)', fontSize: 11, fontWeight: 800, lineHeight: 1 }}>✓</span>}
          </button>
        )}
        {day.session.type === 'race' && (
          <span style={{ fontSize: 20, flexShrink: 0, marginTop: 0 }}>🏁</span>
        )}

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none' }}>
              {day.session.title}
            </span>
            {isToday && (
              <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--blue)', background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.35)', borderRadius: 4, padding: '1px 5px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                TODAY
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: m.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {m.icon} {m.label}
            </span>
            {day.session.km && (
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {day.session.km} km
              </span>
            )}
            {day.session.pace && (
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                @ {day.session.pace}
              </span>
            )}
            {day.session.duration && (
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {day.session.duration}
              </span>
            )}
          </div>
        </div>

        {/* Expand chevron */}
        <span style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1, flexShrink: 0, marginTop: 3 }}>
          {open ? '▲' : '▼'}
        </span>
      </div>

      {/* Expanded detail */}
      {open && (
        <div style={{ borderTop: `1px solid ${m.border}`, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {day.session.description}
          </p>

          {day.session.structure && day.session.structure.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Workout Structure</div>
              {day.session.structure.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4, alignItems: 'flex-start' }}>
                  <div style={{ flexShrink: 0, width: 18, height: 18, borderRadius: 9, background: m.bg, border: `1px solid ${m.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: m.color }}>{i+1}</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.45 }}>{step}</span>
                </div>
              ))}
            </div>
          )}

          {day.session.exercises && day.session.exercises.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Strength / Mobility</div>
              {day.session.exercises.map((ex, i) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 3, paddingLeft: 10, borderLeft: `2px solid ${m.border}` }}>
                  {ex}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Week selector bar ────────────────────────────────────────────────────────

function WeekNav({ week, onPrev, onNext }: { week: MarathonWeek; onPrev: () => void; onNext: () => void }) {
  const pc = PHASE_COLORS[week.phase] ?? PHASE_COLORS['Base']
  const start = fmtDate(week.days[0].date)
  const end   = fmtDate(week.days[6].date)
  const year  = parseISO(week.days[6].date).getFullYear()

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <button onClick={onPrev} disabled={week.weekNum === 1}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)', padding: '6px 14px', cursor: week.weekNum === 1 ? 'not-allowed' : 'pointer', fontSize: 16, fontWeight: 700, opacity: week.weekNum === 1 ? 0.35 : 1 }}>
          ‹
        </button>

        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
            Week {week.weekNum} of {MARATHON_PLAN.length}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
            {start} – {end} {year}
          </div>
        </div>

        <button onClick={onNext} disabled={week.weekNum === MARATHON_PLAN.length}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)', padding: '6px 14px', cursor: week.weekNum === MARATHON_PLAN.length ? 'not-allowed' : 'pointer', fontSize: 16, fontWeight: 700, opacity: week.weekNum === MARATHON_PLAN.length ? 0.35 : 1 }}>
          ›
        </button>
      </div>

      {/* Phase + focus banner */}
      <div style={{ marginTop: 10, background: pc.bg, border: `1px solid ${pc.border}`, borderRadius: 9, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: pc.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Phase {week.phaseNum}: {week.phase}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{week.focus}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: pc.color, lineHeight: 1 }}>{week.weeklyKm}</div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>km / wk</div>
        </div>
      </div>
    </div>
  )
}

// ─── Overview: mini phase grid ────────────────────────────────────────────────

function Overview({ completed, onSelectWeek }: { completed: Set<string>; onSelectWeek: (n: number) => void }) {
  const todayISO = localISO(new Date())

  const phases = useMemo(() => {
    const map = new Map<string, MarathonWeek[]>()
    for (const week of MARATHON_PLAN) {
      const list = map.get(week.phase) ?? []
      list.push(week)
      map.set(week.phase, list)
    }
    return [...map.entries()]
  }, [])

  return (
    <div>
      {phases.map(([phase, weeks]) => {
        const pc = PHASE_COLORS[phase] ?? PHASE_COLORS['Base']
        return (
          <div key={phase} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: pc.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Phase {weeks[0].phaseNum}: {phase}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {weeks.map(week => {
                const totalDays     = week.days.filter(d => d.session.type !== 'rest').length
                const doneDays      = week.days.filter(d => completed.has(dayKey(d))).length
                const allDone       = doneDays === totalDays && totalDays > 0
                const isCurrent     = week.days[0].date <= todayISO && todayISO <= week.days[6].date
                const isUpcoming    = week.days[0].date > todayISO

                return (
                  <button key={week.weekNum} onClick={() => onSelectWeek(week.weekNum)} style={{
                    padding: '8px 10px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
                    border: `1.5px solid ${isCurrent ? 'var(--blue)' : allDone ? 'rgba(74,222,128,0.5)' : pc.border}`,
                    background: isCurrent ? 'rgba(96,165,250,0.12)' : allDone ? 'rgba(74,222,128,0.08)' : isUpcoming ? 'transparent' : pc.bg,
                    opacity: isUpcoming ? 0.55 : 1,
                    minWidth: 54, textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: isCurrent ? 'var(--blue)' : allDone ? 'var(--green)' : 'var(--text-primary)' }}>
                      {allDone ? '✓' : `W${week.weekNum}`}
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                      {week.weeklyKm} km
                    </div>
                    {totalDays > 0 && (
                      <div style={{ marginTop: 4, height: 3, background: 'var(--bg-track)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(doneDays / totalDays) * 100}%`, background: 'var(--green)', borderRadius: 2 }} />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MarathonPlan() {
  const [weekNum,   setWeekNum]   = useState(currentWeekNum)
  const [tab,       setTab]       = useState<'week' | 'overview'>('week')
  const [completed, setCompleted] = useState<Set<string>>(loadCompleted)

  const week = MARATHON_PLAN[weekNum - 1]

  const toggleDay = (day: MarathonDay) => {
    const key  = dayKey(day)
    const next = new Set(completed)
    if (next.has(key)) next.delete(key)
    else               next.add(key)
    setCompleted(next)
    saveCompleted(next)
  }

  // Progress stats
  const totalSessions  = MARATHON_PLAN.flatMap(w => w.days).filter(d => d.session.type !== 'rest').length
  const doneSessions   = [...completed].length
  const pct            = Math.round((doneSessions / totalSessions) * 100)
  const daysToRace     = daysUntil(RACE_DATE)
  const raceLabel      = daysToRace > 0
    ? `${daysToRace} day${daysToRace !== 1 ? 's' : ''} to go`
    : daysToRace === 0 ? '🏁 Race day!' : 'Race complete!'

  // Week completion
  const weekSessions = week.days.filter(d => d.session.type !== 'rest')
  const weekDone     = weekSessions.filter(d => completed.has(dayKey(d))).length
  const weekPct      = weekSessions.length > 0 ? Math.round((weekDone / weekSessions.length) * 100) : 0

  const todayISO = localISO(new Date())

  return (
    <div className="fade-in">
      {/* ── Race header ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(244,63,94,0.12) 0%, rgba(167,139,250,0.12) 100%)',
        border: '1px solid rgba(244,63,94,0.25)',
        borderRadius: 14, padding: '14px 16px', marginBottom: 18,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            🏁 Marathon — April 4, 2027
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
            Sub-3:30 target · 5:00/km race pace
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            Plan start: {fmtDate(PLAN_START_DATE)} 2026 · 26 weeks
          </div>
        </div>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#f43f5e', lineHeight: 1 }}>
            {daysToRace > 0 ? daysToRace : '🏅'}
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>
            {daysToRace > 0 ? 'days to go' : raceLabel}
          </div>
        </div>
      </div>

      {/* ── Overall progress bar ── */}
      <div style={{ marginBottom: 18, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>Overall progress</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>{doneSessions}/{totalSessions} sessions · {pct}%</span>
        </div>
        <div style={{ height: 6, background: 'var(--bg-track)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, borderRadius: 3, background: 'linear-gradient(90deg, var(--green), #22d3ee)', transition: 'width 0.5s ease' }} />
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: 10, padding: 3, marginBottom: 18 }}>
        {([['week', '📅 Week View'], ['overview', '🗺 All Weeks']] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'inherit', transition: 'all 0.2s', background: tab === t ? 'var(--bg-header)' : 'transparent', color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.12)' : 'none' }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Week view ── */}
      {tab === 'week' && (
        <>
          <WeekNav
            week={week}
            onPrev={() => setWeekNum(n => Math.max(1, n - 1))}
            onNext={() => setWeekNum(n => Math.min(MARATHON_PLAN.length, n + 1))}
          />

          {/* Week progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 4, background: 'var(--bg-track)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${weekPct}%`, background: 'var(--green)', borderRadius: 2, transition: 'width 0.3s' }} />
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
              {weekDone}/{weekSessions.length} sessions {weekPct === 100 ? '✓' : ''}
            </span>
          </div>

          {/* Days */}
          {week.days.map((day, i) => {
            const isToday = day.date === todayISO
            return (
              <div key={i}>
                {/* Day label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, marginTop: i > 0 ? 2 : 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: isToday ? 'var(--blue)' : 'var(--text-muted)' }}>
                    {DOW_LABELS[i]}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {fmtDate(day.date)}
                  </span>
                  {isToday && (
                    <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>← today</span>
                  )}
                </div>
                <DayCard
                  day={day}
                  done={completed.has(dayKey(day))}
                  onToggle={() => toggleDay(day)}
                />
              </div>
            )
          })}

          {/* Go to today button */}
          {week.weekNum !== currentWeekNum() && (
            <button onClick={() => setWeekNum(currentWeekNum())} style={{ width: '100%', marginTop: 10, padding: '9px 0', borderRadius: 9, fontSize: 12, fontWeight: 700, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-muted)', cursor: 'pointer' }}>
              Jump to current week
            </button>
          )}
        </>
      )}

      {/* ── Overview ── */}
      {tab === 'overview' && (
        <Overview
          completed={completed}
          onSelectWeek={n => { setWeekNum(n); setTab('week') }}
        />
      )}

      {/* ── Pace reference ── */}
      <div style={{ marginTop: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
          Pace Reference
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6 }}>
          {[
            { label: 'Recovery',   pace: '6:30–7:00/km', color: 'var(--green)' },
            { label: 'Easy',       pace: '5:45–6:15/km', color: 'var(--blue)'  },
            { label: 'Aerobic',    pace: '5:30–5:50/km', color: 'var(--purple)'},
            { label: 'Marathon',   pace: '4:58–5:05/km', color: '#f43f5e'      },
            { label: 'Threshold',  pace: '4:20–4:40/km', color: 'var(--amber)' },
            { label: 'Intervals',  pace: '4:00–4:15/km', color: 'var(--red)'   },
          ].map(({ label, pace, color }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 8px', background: 'var(--bg-input)', borderRadius: 7 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color }}>{label}</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{pace}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Race info ── */}
      <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
        Plan start: {fmtDateFull(PLAN_START_DATE)} · Race: {fmtDateFull(RACE_DATE)}<br />
        Progress stored locally on this device
      </div>
    </div>
  )
}

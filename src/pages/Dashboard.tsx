import Card from '../components/Card'
import SectionTitle from '../components/SectionTitle'
import { PHASES, WEEKS, PHASE_COLORS } from '../data/plan'
import type { DashboardProps } from '../types'

const INJURY_TIPS: string[] = [
  "🦵 Increase weekly km by no more than 10% per week",
  "😴 Sleep 8+ hours — it's the #1 recovery tool",
  "👟 Replace running shoes every 600–800 km",
  "❄️ Ice sore spots within 20 min, heat after 48 hrs",
  "📉 If pain rates >3/10, take an extra rest day",
  "🧘 Don't skip mobility — it's training, not optional",
  "🩺 Sharp knee or IT band pain = see a physio immediately",
]

interface ProgressionItem {
  heading: string
  detail: string
}

const PROGRESSION: ProgressionItem[] = [
  { heading: 'Running volume',    detail: 'Add ~10% per week. Deload every 3–4 weeks (cut 20–30%).' },
  { heading: 'Gym load',          detail: 'Increase weights 2.5–5 kg when you complete all reps with RPE <8. Never sacrifice form.' },
  { heading: 'Intensity',         detail: 'Tempo pace progresses from short efforts (3 km) to sustained (5 km). Interval reps increase 5→6→7.' },
  { heading: 'Signs to back off', detail: 'Resting HR elevated >5 bpm, sleep quality drops, motivation crashes, or pace effort rises at same speed.' },
  { heading: 'Signs to progress', detail: 'Easy runs feel genuinely easy, tempo pace feels comfortable, long runs require little recovery.' },
]

interface StatItem {
  label: string
  val: number
  icon: string
}

export default function Dashboard({ progress }: DashboardProps) {
  const totalCompleted = WEEKS.reduce((acc, w) => {
    return (
      acc +
      w.runs.filter((_, i) => progress[`w${w.week}_run_${i}`]).length +
      w.gym.filter((_, i)  => progress[`w${w.week}_gym_${i}`]).length
    )
  }, 0)

  const totalSessions = WEEKS.reduce((acc, w) => acc + w.runs.length + w.gym.length, 0)

  const weeksCompleted = WEEKS.filter(
    (w) => w.runs.length > 0 && w.runs.every((_, i) => progress[`w${w.week}_run_${i}`])
  ).length

  const stats: StatItem[] = [
    { label: 'Sessions Done', val: totalCompleted,      icon: '✅' },
    { label: 'Total Sessions', val: totalSessions,      icon: '📋' },
    { label: 'Weeks Left',    val: 17 - weeksCompleted, icon: '⏱' },
  ]

  return (
    <div className="fade-in">
      {/* Phase overview */}
      <SectionTitle>Training Phases</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {PHASES.map((ph) => {
          const pc      = PHASE_COLORS[ph.id]
          const phWeeks = WEEKS.filter((w) => w.phase === ph.id)
          const done    = phWeeks.reduce(
            (a, w) =>
              a +
              w.runs.filter((_, i) => progress[`w${w.week}_run_${i}`]).length +
              w.gym.filter((_,  i) => progress[`w${w.week}_gym_${i}`]).length,
            0
          )
          const total = phWeeks.reduce((a, w) => a + w.runs.length + w.gym.length, 0)
          const pct   = Math.round((done / total) * 100)

          return (
            <Card key={ph.id} accent={pc.border} style={{ padding: 14, marginBottom: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: pc.text, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Phase {ph.id}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{ph.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                Wk {ph.weeks[0]}–{ph.weeks[ph.weeks.length - 1]}
              </div>
              <div style={{ height: 4, background: 'rgba(var(--fg-rgb),0.07)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${pct}%`, background: pc.border, borderRadius: 2, transition: 'width 0.5s' }} />
              </div>
              <div style={{ fontSize: 11, color: pc.text, marginTop: 4, textAlign: 'right', fontWeight: 700 }}>
                {pct}%
              </div>
            </Card>
          )
        })}
      </div>

      {/* Stats */}
      <SectionTitle>Your Stats</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
        {stats.map((s) => (
          <Card key={s.label} style={{ textAlign: 'center', padding: 12, marginBottom: 0 }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)' }}>{s.val}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.3 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Injury prevention */}
      <SectionTitle>Injury Prevention</SectionTitle>
      <Card>
        {INJURY_TIPS.map((tip, i) => (
          <div
            key={i}
            style={{
              padding: '8px 0',
              borderBottom: i < INJURY_TIPS.length - 1 ? '1px solid rgba(var(--fg-rgb),0.05)' : 'none',
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}
          >
            {tip}
          </div>
        ))}
      </Card>

      {/* Progression strategy */}
      <SectionTitle style={{ marginTop: 4 }}>Progression Strategy</SectionTitle>
      <Card>
        {PROGRESSION.map((item, i) => (
          <div
            key={i}
            style={{
              padding: '9px 0',
              borderBottom: i < PROGRESSION.length - 1 ? '1px solid rgba(var(--fg-rgb),0.05)' : 'none',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue)', marginBottom: 3 }}>
              {item.heading}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {item.detail}
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}

import Card from '../components/Card'
import SectionTitle from '../components/SectionTitle'
import { MOBILITY_ROUTINE, WARMUP_STEPS, COOLDOWN_STEPS } from '../data/plan'

interface RestTip {
  icon: string
  text: string
}

const REST_TIPS: RestTip[] = [
  { icon: '😴', text: 'Prioritise 8+ hours of sleep — this is when adaptation happens' },
  { icon: '🚶', text: 'Light walking (20–30 min) is fine and promotes circulation' },
  { icon: '🛁', text: 'Contrast showers after hard sessions to reduce inflammation' },
  { icon: '🥗', text: 'Still hit protein targets on rest days — muscle is built at rest' },
  { icon: '📵', text: 'Mental rest matters too — step away from training data occasionally' },
]

export default function Recovery() {
  return (
    <div className="fade-in">
      {/* Daily mobility */}
      <SectionTitle>Daily Mobility Routine</SectionTitle>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
        Mobility is training. Do this daily — it prevents injury and improves running economy.
      </p>

      {MOBILITY_ROUTINE.map((item, i) => (
        <Card key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{item.name}</div>
            <div style={{ fontSize: 12, color: 'var(--blue)', marginBottom: 3, fontFamily: 'var(--font-mono)' }}>
              {item.duration}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>{item.timing}</div>
          </div>
        </Card>
      ))}

      {/* Pre-run warmup */}
      <SectionTitle style={{ marginTop: 20 }}>Pre-Run Warmup (5 min)</SectionTitle>
      <Card>
        {WARMUP_STEPS.map((step, i) => (
          <div
            key={i}
            style={{
              padding: '8px 0',
              borderBottom: i < WARMUP_STEPS.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
            }}
          >
            <span style={{
              fontSize: 11, fontWeight: 700, color: 'var(--green)',
              background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)',
              borderRadius: 4, padding: '1px 6px', flexShrink: 0, marginTop: 1,
            }}>
              {i + 1}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.45 }}>{step}</span>
          </div>
        ))}
      </Card>

      {/* Post-run cool-down */}
      <SectionTitle style={{ marginTop: 8 }}>Post-Run Cool Down (5–10 min)</SectionTitle>
      <Card>
        {COOLDOWN_STEPS.map((step, i) => (
          <div
            key={i}
            style={{
              padding: '8px 0',
              borderBottom: i < COOLDOWN_STEPS.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
            }}
          >
            <span style={{
              fontSize: 11, fontWeight: 700, color: 'var(--blue)',
              background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.3)',
              borderRadius: 4, padding: '1px 6px', flexShrink: 0, marginTop: 1,
            }}>
              {i + 1}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.45 }}>{step}</span>
          </div>
        ))}
      </Card>

      {/* Rest day guidance */}
      <SectionTitle style={{ marginTop: 8 }}>Rest Day Guidance</SectionTitle>
      <Card style={{ background: 'rgba(96,165,250,0.05)', borderColor: 'rgba(96,165,250,0.2)' }}>
        {REST_TIPS.map((item, i) => (
          <div
            key={i}
            style={{
              padding: '8px 0',
              borderBottom: i < REST_TIPS.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.text}</span>
          </div>
        ))}
      </Card>
    </div>
  )
}

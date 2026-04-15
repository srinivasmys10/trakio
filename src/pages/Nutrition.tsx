import Card from '../components/Card'
import SectionTitle from '../components/SectionTitle'
import { NUTRITION_TIPS } from '../data/plan'

interface FoodItem {
  icon: string
  text: string
}

const RACE_DINNER: FoodItem[] = [
  { icon: '🍚', text: '1.5 cups cooked white rice or pasta' },
  { icon: '🥚', text: '2 eggs + 100g paneer OR 150g firm tofu (pan-fried)' },
  { icon: '🥦', text: 'Steamed broccoli + squeeze of lemon' },
  { icon: '🫒', text: '1 tbsp olive oil drizzled over' },
  { icon: '🧂', text: 'Light salt for electrolytes' },
]

const RACE_MORNING: FoodItem[] = [
  { icon: '⏰', text: 'Wake 2.5–3 hrs before start' },
  { icon: '🥣', text: 'Oats with banana + honey + a spoonful of almond butter' },
  { icon: '💧', text: '500 ml water spread over 2 hours before' },
  { icon: '☕', text: 'Coffee if you normally have it — stick to your routine' },
  { icon: '🕐', text: '30 min before: sip 200 ml water or coconut water' },
  { icon: '🍌', text: 'Optional: ½ banana or 2 medjool dates 15 min before start' },
]

interface SupplementInfo {
  name: string
  detail: string
  tier: string
  vegNote?: string
}

const SUPPLEMENTS: SupplementInfo[] = [
  {
    name: 'Creatine Monohydrate',
    detail: '3–5g/day. Supports strength training and muscle recovery.',
    tier: 'Strong evidence',
    vegNote: 'Vegetarians naturally have lower muscle creatine stores — even more beneficial for you.',
  },
  {
    name: 'Vitamin B12',
    detail: '500–1000 mcg/day (methylcobalamin form preferred). Critical — almost no dietary B12 in plant foods.',
    tier: 'Essential for veg',
  },
  {
    name: 'Iron (with Vitamin C)',
    detail: 'Only supplement if blood test confirms deficiency. Take with 200 mg Vitamin C. Do not supplement blindly.',
    tier: 'Test first',
  },
  {
    name: 'Vitamin D3 + K2',
    detail: '1000–2000 IU D3 daily, especially if indoors a lot. K2 helps direct calcium to bones.',
    tier: 'Recommended',
  },
  {
    name: 'Algae-Based Omega-3',
    detail: '500–1000 mg EPA+DHA/day. Vegan alternative to fish oil — same anti-inflammatory benefits.',
    tier: 'Recommended',
    vegNote: 'Algae is where fish get their omega-3s — cut out the middleman.',
  },
  {
    name: 'Zinc',
    detail: '15–25 mg/day. Plant-based zinc is less bioavailable — athletes and vegetarians often run low.',
    tier: 'Consider',
  },
]

const TIER_COLORS: Record<string, string> = {
  'Strong evidence':    'var(--green)',
  'Essential for veg':  '#f43f5e',
  'Test first':         'var(--amber)',
  'Recommended':        'var(--blue)',
  'Consider':           'var(--purple)',
}

interface VegProteinSource {
  food: string
  protein: string
  notes: string
}

const VEG_PROTEINS: VegProteinSource[] = [
  { food: 'Greek Yogurt (full fat)', protein: '~10g / 100g', notes: 'Great post-run with fruit' },
  { food: 'Paneer',                 protein: '~18g / 100g', notes: 'Versatile, high-quality protein' },
  { food: 'Eggs',                   protein: '~6g / egg',   notes: 'Complete protein, easy to cook' },
  { food: 'Tofu (firm)',            protein: '~8g / 100g',  notes: 'Press and pan-fry for best texture' },
  { food: 'Tempeh',                 protein: '~19g / 100g', notes: 'Fermented, high bioavailability' },
  { food: 'Edamame',                protein: '~11g / 100g', notes: 'Complete protein, great snack' },
  { food: 'Lentils (cooked)',       protein: '~9g / 100g',  notes: 'Also high in iron' },
  { food: 'Chickpeas (cooked)',     protein: '~9g / 100g',  notes: 'Roast for a high-protein snack' },
  { food: 'Black Beans',            protein: '~8g / 100g',  notes: 'Pair with rice for complete protein' },
  { food: 'Quinoa (cooked)',        protein: '~4g / 100g',  notes: 'Only complete plant protein grain' },
  { food: 'Whey / Plant Protein',   protein: '~25g / scoop', notes: 'Easiest way to hit daily targets' },
]

export default function Nutrition() {
  return (
    <div className="fade-in">
      <SectionTitle>Vegetarian Nutrition Guide</SectionTitle>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
        You're building muscle AND training for endurance on a vegetarian diet. With the right strategy,
        this is completely achievable — and research shows plant-based athletes recover just as well.
      </p>

      {/* Main nutrition tips */}
      {NUTRITION_TIPS.map((tip, i) => (
        <Card key={i}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--yellow)', marginBottom: 6 }}>
            {tip.title}
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{tip.detail}</p>
        </Card>
      ))}

      {/* Vegetarian protein sources table */}
      <SectionTitle style={{ marginTop: 4 }}>Vegetarian Protein Sources</SectionTitle>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ minWidth: 420 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--overlay-dark)' }}>
                {['Food', 'Protein', 'Notes'].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: 'left', padding: '10px 14px',
                      fontSize: 10, fontWeight: 700,
                      color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VEG_PROTEINS.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '9px 14px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    {row.food}
                  </td>
                  <td style={{ padding: '9px 14px', fontSize: 13, color: 'var(--green)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                    {row.protein}
                  </td>
                  <td style={{ padding: '9px 14px', fontSize: 12, color: 'var(--text-muted)' }}>
                    {row.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Race-week dinner */}
      <SectionTitle style={{ marginTop: 4 }}>Race-Week Dinner (Vegetarian)</SectionTitle>
      <Card style={{ background: 'rgba(250,204,21,0.05)', borderColor: 'rgba(250,204,21,0.2)' }}>
        {RACE_DINNER.map((item, i) => (
          <div
            key={i}
            style={{
              padding: '7px 0',
              borderBottom: i < RACE_DINNER.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              display: 'flex', gap: 10, alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.text}</span>
          </div>
        ))}
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10, fontStyle: 'italic', lineHeight: 1.5 }}>
          High-carb, moderate protein, low fibre and fat. Easy on the gut the night before the race.
        </p>
      </Card>

      {/* Race morning protocol */}
      <SectionTitle style={{ marginTop: 4 }}>Race Morning Protocol</SectionTitle>
      <Card style={{ background: 'rgba(248,113,113,0.05)', borderColor: 'rgba(248,113,113,0.2)' }}>
        {RACE_MORNING.map((item, i) => (
          <div
            key={i}
            style={{
              padding: '8px 0',
              borderBottom: i < RACE_MORNING.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.45 }}>{item.text}</span>
          </div>
        ))}
      </Card>

      {/* Supplements */}
      <SectionTitle style={{ marginTop: 4 }}>Supplements for Vegetarian Athletes</SectionTitle>
      <Card>
        {SUPPLEMENTS.map((s, i) => (
          <div
            key={i}
            style={{
              padding: '10px 0',
              borderBottom: i < SUPPLEMENTS.length - 1 ? '1px solid var(--border-subtle)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{s.name}</span>
              <span style={{
                fontSize: 9, fontWeight: 700,
                color: TIER_COLORS[s.tier] ?? 'var(--text-muted)',
                background: `${TIER_COLORS[s.tier] ?? '#94a3b8'}22`,
                border: `1px solid ${TIER_COLORS[s.tier] ?? '#94a3b8'}55`,
                borderRadius: 4, padding: '1px 6px', letterSpacing: '0.06em',
              }}>
                {s.tier.toUpperCase()}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: s.vegNote ? 4 : 0 }}>
              {s.detail}
            </p>
            {s.vegNote && (
              <p style={{ fontSize: 11, color: 'var(--green)', lineHeight: 1.4, fontStyle: 'italic' }}>
                🌱 {s.vegNote}
              </p>
            )}
          </div>
        ))}
      </Card>
    </div>
  )
}

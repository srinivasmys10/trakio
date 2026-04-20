import { useState, useEffect, useCallback, useRef } from 'react'
import { loadYearActivity } from '../lib/workoutPlan'
import type { DailyActivity } from '../lib/workoutPlan'

// ─── Date helpers (local time, no UTC) ───────────────────────────────────────

function localISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAY_LABELS  = ['Mon','','Wed','','Fri','','Sun']

// ─── Colour scale ─────────────────────────────────────────────────────────────

function cellColor(day: DailyActivity | undefined, inRange: boolean): string {
  if (!inRange) return 'transparent'
  if (!day || day.exerciseCount === 0) return 'var(--bg-track)'
  if (day.completedCount === 0) return 'rgba(74,222,128,0.15)'
  const r = day.completedCount / day.exerciseCount
  if (r < 0.34) return 'rgba(74,222,128,0.30)'
  if (r < 0.67) return 'rgba(74,222,128,0.55)'
  if (r < 1.00) return 'rgba(74,222,128,0.80)'
  return '#4ade80'
}

function cellLabel(day: DailyActivity | undefined): string {
  if (!day || day.exerciseCount === 0) return 'No workout'
  if (day.completedCount === 0)
    return `${day.exerciseCount} exercise${day.exerciseCount !== 1 ? 's' : ''} planned`
  if (day.dayFullyDone || day.completedCount === day.exerciseCount)
    return `✓ ${day.exerciseCount} exercise${day.exerciseCount !== 1 ? 's' : ''} completed`
  return `${day.completedCount}/${day.exerciseCount} done`
}

// ─── Grid builder ─────────────────────────────────────────────────────────────

interface GridCell { date: string; inRange: boolean }
interface MonthLabel { label: string; col: number }

function buildSixMonthGrid(periodEnd: Date): {
  weeks:       GridCell[][]
  monthLabels: MonthLabel[]
  periodStart: Date
} {
  const end   = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), periodEnd.getDate())
  const start = new Date(end.getFullYear(), end.getMonth() - 5, 1)

  // Expand to Mon–Sun week boundaries
  const startBound = new Date(start)
  const sdow = startBound.getDay()
  startBound.setDate(startBound.getDate() - (sdow === 0 ? 6 : sdow - 1))

  const endBound = new Date(end)
  const edow = endBound.getDay()
  if (edow !== 0) endBound.setDate(endBound.getDate() + (7 - edow))

  const weeks: GridCell[][] = []
  const rawLabels: { monthKey: string; col: number; year: number; month: number }[] = []
  const seenMonths = new Set<string>()

  let cursor = new Date(startBound)
  let col = 0

  while (cursor <= endBound) {
    const week: GridCell[] = []
    // Count how many days in this week fall in each month (to pick dominant month)
    const monthCount: Record<string, number> = {}
    const colStart = new Date(cursor)

    for (let r = 0; r < 7; r++) {
      const iso     = localISO(cursor)
      const inRange = cursor >= start && cursor <= end
      week.push({ date: iso, inRange })
      const mk = `${cursor.getFullYear()}-${cursor.getMonth()}`
      monthCount[mk] = (monthCount[mk] ?? 0) + 1
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)

    // Dominant month for this column = the month with the most days
    const dominant = Object.entries(monthCount).sort((a, b) => b[1] - a[1])[0]?.[0]
    if (dominant && !seenMonths.has(dominant)) {
      seenMonths.add(dominant)
      const [yr, mo] = dominant.split('-').map(Number)
      // Only add label if within visible range
      if (colStart >= startBound) {
        rawLabels.push({ monthKey: dominant, col, year: yr, month: mo })
      }
    }

    col++
  }

  // Enforce minimum column gap between labels to prevent overlap.
  // Each label is ~32px wide (3 chars); each column is CELL+GAP = 15px.
  // Min gap = ceil(32/15) = 3 columns. We use 4 to be safe.
  const MIN_GAP_COLS = 4
  const monthLabels: MonthLabel[] = []
  let lastCol = -Infinity

  for (const raw of rawLabels) {
    if (raw.col - lastCol >= MIN_GAP_COLS) {
      // Show year only for January (or the very first label)
      const isJan   = raw.month === 0
      const isFirst = monthLabels.length === 0
      const label   = isJan || isFirst
        ? `${MONTH_SHORT[raw.month]} '${String(raw.year).slice(2)}`
        : MONTH_SHORT[raw.month]
      monthLabels.push({ label, col: raw.col })
      lastCol = raw.col
    }
  }

  return { weeks, monthLabels, periodStart: start }
}

// ─── Tooltip state (relative to grid container) ───────────────────────────────

interface TooltipState {
  text:  string
  date:  string
  // position relative to the grid container div
  top:   number
  left:  number
  alignRight: boolean  // flip tooltip left if near right edge
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WorkoutCalendar() {
  const today = new Date(); today.setHours(0,0,0,0)

  const [periodEnd, setPeriodEnd] = useState<Date>(() => new Date(today))
  const [activity,  setActivity]  = useState<DailyActivity[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [tooltip,   setTooltip]   = useState<TooltipState | null>(null)
  const [stats, setStats] = useState({ totalDays:0, totalExercises:0, streak:0, longestStreak:0 })

  // Ref for the grid wrapper — tooltip is positioned relative to this
  const gridRef = useRef<HTMLDivElement>(null)

  const fetch = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const data = await loadYearActivity()
      setActivity(data)
      const actMap = new Map(data.map(d => [d.date, d]))

      // Current streak
      let streak = 0
      const cur = new Date(today)
      for (;;) {
        const iso = localISO(cur)
        if (iso > localISO(today)) { cur.setDate(cur.getDate()-1); continue }
        const d = actMap.get(iso)
        if (!d || d.completedCount === 0) break
        streak++; cur.setDate(cur.getDate()-1)
      }

      // Longest streak
      let longest = 0, run = 0, prev: Date | null = null
      for (const d of [...data].sort((a,b) => a.date.localeCompare(b.date))) {
        if (d.completedCount > 0) {
          const dt   = parseISO(d.date)
          const diff = prev ? (dt.getTime()-prev.getTime())/86400000 : 1
          run        = diff === 1 ? run+1 : 1
          longest    = Math.max(longest, run)
          prev       = dt
        } else { run=0; prev=null }
      }

      setStats({
        totalDays:      data.filter(d => d.completedCount > 0).length,
        totalExercises: data.reduce((s,d) => s+d.completedCount, 0),
        streak, longestStreak: longest,
      })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load activity')
    } finally { setLoading(false) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { void fetch() }, [fetch])

  // Navigation
  const isCurrentPeriod = periodEnd >= today
  const goBack    = () => setPeriodEnd(p => { const d=new Date(p); d.setMonth(d.getMonth()-6); return d })
  const goForward = () => {
    if (isCurrentPeriod) return
    setPeriodEnd(p => { const d=new Date(p); d.setMonth(d.getMonth()+6); return d>today?new Date(today):d })
  }

  const { weeks, monthLabels, periodStart } = buildSixMonthGrid(periodEnd)
  const actMap    = new Map(activity.map(d => [d.date, d]))
  const todayISO  = localISO(today)

  const CELL = 13, GAP = 2   // cell size and gap in px

  const periodLabel = `${MONTH_SHORT[periodStart.getMonth()]} ${periodStart.getFullYear()} – ${MONTH_SHORT[periodEnd.getMonth()]} ${periodEnd.getFullYear()}`

  const visibleDates  = weeks.flatMap(w => w.filter(c => c.inRange).map(c => c.date))
  const periodAct     = visibleDates.map(d => actMap.get(d)).filter(Boolean) as DailyActivity[]
  const periodDays    = periodAct.filter(d => d.completedCount > 0).length
  const periodEx      = periodAct.reduce((s,d) => s+d.completedCount, 0)

  // Tooltip handler — positions tooltip relative to gridRef
  const handleCellEnter = (e: React.MouseEvent<HTMLDivElement>, cell: GridCell, day: DailyActivity | undefined) => {
    if (!cell.inRange || !gridRef.current) return
    const cellRect      = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const containerRect = gridRef.current.getBoundingClientRect()
    const dt    = parseISO(cell.date)
    const label = `${dt.getDate()} ${MONTH_SHORT[dt.getMonth()]} ${dt.getFullYear()}`
    // Position tooltip 6px below the cell, horizontally centred on it
    const top       = cellRect.bottom - containerRect.top + 6
    const centrePx  = cellRect.left - containerRect.left + cellRect.width / 2
    // Flip if near right edge (assume tooltip ~160px wide)
    const alignRight = centrePx > containerRect.width - 170
    setTooltip({ date: label, text: cellLabel(day), top, left: centrePx, alignRight })
  }

  if (loading) return (
    <div style={{ textAlign:'center', padding:'40px 0', color:'var(--text-muted)', fontSize:13 }}>
      <div style={{ width:140, height:3, background:'var(--bg-track)', borderRadius:2, overflow:'hidden', margin:'0 auto 10px' }}>
        <div style={{ height:'100%', width:'40%', background:'var(--green)', borderRadius:2, animation:'loadSlide 1.2s ease infinite' }} />
      </div>
      Loading activity…
    </div>
  )

  if (error) return (
    <div style={{ background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.3)', borderRadius:10, padding:14, color:'var(--red)', fontSize:13 }}>⚠ {error}</div>
  )

  return (
    <div className="fade-in">

      {/* ── Stats ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:18 }}>
        {[
          { label:'Active Days',  value:stats.totalDays,          icon:'📅', color:'var(--blue)'   },
          { label:'Exercises',    value:stats.totalExercises,     icon:'💪', color:'var(--purple)' },
          { label:'Streak',       value:`${stats.streak}d`,       icon:'🔥', color:'var(--amber)'  },
          { label:'Best Streak',  value:`${stats.longestStreak}d`,icon:'🏆', color:'var(--yellow)' },
        ].map(s => (
          <div key={s.label} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'10px 8px', textAlign:'center' }}>
            <div style={{ fontSize:16, marginBottom:2 }}>{s.icon}</div>
            <div style={{ fontSize:18, fontWeight:800, color:s.color, lineHeight:1 }}>{s.value}</div>
            <div style={{ fontSize:9, color:'var(--text-muted)', marginTop:3, textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Heatmap card ── */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'14px 12px 12px', overflowX:'auto' }}>

        {/* Period nav */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <button onClick={goBack} style={{ background:'var(--bg-input)', border:'1px solid var(--border)', borderRadius:7, color:'var(--text-secondary)', padding:'4px 12px', cursor:'pointer', fontSize:16, fontWeight:700 }}>‹</button>

          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text-primary)' }}>{periodLabel}</div>
            <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>
              {periodDays} active day{periodDays!==1?'s':''} · {periodEx} exercise{periodEx!==1?'s':''}
            </div>
          </div>

          <button onClick={goForward} disabled={isCurrentPeriod} style={{ background:isCurrentPeriod?'transparent':'var(--bg-input)', border:`1px solid ${isCurrentPeriod?'transparent':'var(--border)'}`, borderRadius:7, color:isCurrentPeriod?'var(--text-faint)':'var(--text-secondary)', padding:'4px 12px', cursor:isCurrentPeriod?'default':'pointer', fontSize:16, fontWeight:700 }}>›</button>
        </div>

        {/* Grid — position:relative so tooltip is anchored here */}
        <div style={{ display:'flex', gap:GAP }}>

          {/* Day-of-week labels */}
          <div style={{ display:'flex', flexDirection:'column', gap:GAP, paddingTop:22, flexShrink:0 }}>
            {DAY_LABELS.map((label, i) => (
              <div key={i} style={{ height:CELL, fontSize:9, color:'var(--text-muted)', display:'flex', alignItems:'center', width:24, justifyContent:'flex-end', paddingRight:4 }}>
                {label}
              </div>
            ))}
          </div>

          {/* Week columns + month labels — all inside position:relative div */}
          <div ref={gridRef} style={{ position:'relative', flexShrink:0 }}>

            {/* Month label row */}
            <div style={{ position:'relative', height:20, marginBottom:2 }}>
              {monthLabels.map((m, i) => (
                <div key={i} style={{
                  position:'absolute',
                  left: m.col * (CELL + GAP),
                  top: 0,
                  fontSize:10, color:'var(--text-muted)', fontWeight:600,
                  whiteSpace:'nowrap',
                  // Prevent the label from extending past the container right edge
                  maxWidth: 50,
                  overflow:'hidden',
                }}>
                  {m.label}
                </div>
              ))}
            </div>

            {/* Cell grid */}
            <div style={{ display:'flex', gap:GAP }}>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display:'flex', flexDirection:'column', gap:GAP }}>
                  {week.map((cell, ri) => {
                    const day    = actMap.get(cell.date)
                    const color  = cellColor(day, cell.inRange)
                    const isToday = cell.date === todayISO && cell.inRange
                    return (
                      <div
                        key={ri}
                        onMouseEnter={e => handleCellEnter(e, cell, day)}
                        onMouseLeave={() => setTooltip(null)}
                        style={{
                          width:CELL, height:CELL, borderRadius:3,
                          background:color,
                          border: isToday
                            ? '2px solid var(--green)'
                            : cell.inRange ? '1px solid rgba(128,128,128,0.08)' : 'none',
                          cursor: cell.inRange ? 'pointer' : 'default',
                          flexShrink:0, boxSizing:'border-box',
                          transition:'transform 0.1s',
                        }}
                        onMouseDown={e => { if (cell.inRange) (e.currentTarget as HTMLElement).style.transform='scale(1.4)' }}
                        onMouseUp={e   => { (e.currentTarget as HTMLElement).style.transform='scale(1)' }}
                      />
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Tooltip — positioned inside gridRef, appears just below the cell */}
            {tooltip && (
              <div style={{
                position:'absolute',
                top:  tooltip.top,
                left: tooltip.alignRight ? 'auto' : tooltip.left,
                right: tooltip.alignRight ? (gridRef.current ? gridRef.current.offsetWidth - tooltip.left : 0) : 'auto',
                transform: tooltip.alignRight ? 'none' : 'translateX(-50%)',
                background:'var(--bg-dropdown)',
                border:'1px solid var(--border-input)',
                borderRadius:7,
                padding:'5px 10px',
                fontSize:11,
                color:'var(--text-primary)',
                pointerEvents:'none',
                zIndex:100,
                whiteSpace:'nowrap',
                boxShadow:'var(--shadow)',
              }}>
                <strong>{tooltip.date}</strong> — {tooltip.text}
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:12, justifyContent:'flex-end' }}>
          <span style={{ fontSize:9, color:'var(--text-muted)' }}>Less</span>
          {['var(--bg-track)','rgba(74,222,128,0.15)','rgba(74,222,128,0.30)','rgba(74,222,128,0.55)','rgba(74,222,128,0.80)','#4ade80'].map((c,i) => (
            <div key={i} style={{ width:CELL, height:CELL, borderRadius:3, background:c, border:'1px solid rgba(128,128,128,0.1)' }} />
          ))}
          <span style={{ fontSize:9, color:'var(--text-muted)' }}>More</span>
        </div>
        <div style={{ display:'flex', gap:10, marginTop:6, flexWrap:'wrap' }}>
          {[
            { color:'var(--bg-track)',         label:'No workout' },
            { color:'rgba(74,222,128,0.15)',    label:'Planned' },
            { color:'rgba(74,222,128,0.55)',    label:'Partial' },
            { color:'#4ade80',                  label:'Full ✓' },
          ].map(item => (
            <div key={item.label} style={{ display:'flex', alignItems:'center', gap:4 }}>
              <div style={{ width:10, height:10, borderRadius:2, background:item.color, border:'1px solid rgba(128,128,128,0.1)' }} />
              <span style={{ fontSize:9, color:'var(--text-muted)' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent sessions ── */}
      <div style={{ marginTop:18 }}>
        <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>
          Recent Sessions
        </div>

        {activity.filter(d => d.completedCount > 0).sort((a,b) => b.date.localeCompare(a.date)).slice(0,8).map(d => {
          const dt  = parseISO(d.date)
          const pct = Math.round((d.completedCount / d.exerciseCount) * 100)
          return (
            <div key={d.date} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', marginBottom:5, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:9 }}>
              <div style={{ flexShrink:0, textAlign:'center', width:34 }}>
                <div style={{ fontSize:15, fontWeight:800, color:'var(--text-primary)', lineHeight:1 }}>{dt.getDate()}</div>
                <div style={{ fontSize:9, color:'var(--text-muted)', textTransform:'uppercase' }}>{MONTH_SHORT[dt.getMonth()]}</div>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:11, color:'var(--text-secondary)', fontWeight:600 }}>{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dt.getDay()]}</span>
                  <span style={{ fontSize:10, color:d.dayFullyDone?'var(--green)':'var(--text-muted)', fontWeight:700 }}>{d.completedCount}/{d.exerciseCount}{d.dayFullyDone?' ✓':''}</span>
                </div>
                <div style={{ height:4, background:'var(--bg-track)', borderRadius:2, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:d.dayFullyDone?'var(--green)':'rgba(74,222,128,0.55)', borderRadius:2, transition:'width 0.4s' }} />
                </div>
              </div>
              <div style={{ flexShrink:0, fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:5, background:d.dayFullyDone?'rgba(74,222,128,0.12)':'rgba(245,158,11,0.1)', color:d.dayFullyDone?'var(--green)':'var(--amber)', border:`1px solid ${d.dayFullyDone?'rgba(74,222,128,0.3)':'rgba(245,158,11,0.25)'}` }}>
                {pct}%
              </div>
            </div>
          )
        })}

        {activity.filter(d => d.completedCount > 0).length === 0 && (
          <div style={{ textAlign:'center', padding:'28px 0', color:'var(--text-muted)', fontSize:13 }}>
            <div style={{ fontSize:32, marginBottom:8 }}>💪</div>
            No completed workouts yet.
          </div>
        )}
      </div>
    </div>
  )
}

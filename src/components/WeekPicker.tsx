import { useState, useRef, useEffect } from 'react'

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTHS     = ['January','February','March','April','May','June','July','August','September','October','November','December']
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DOW        = ['Mo','Tu','We','Th','Fr','Sa','Su']

// ─── Date helpers — ALL use LOCAL time, never UTC ─────────────────────────────

/**
 * Returns "YYYY-MM-DD" using LOCAL year/month/day — never UTC.
 * This is the ONLY date→string conversion used in this component.
 */
function localISO(d: Date): string {
  const y  = d.getFullYear()
  const m  = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

/**
 * Returns a new Date set to the Monday of the week containing `d`.
 * Uses LOCAL getDay() so results are always correct regardless of timezone.
 */
function mondayOf(d: Date): Date {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate()) // local midnight
  const dow  = copy.getDay()                      // 0=Sun, 1=Mon … 6=Sat
  const diff = dow === 0 ? -6 : 1 - dow           // Mon=0 offset
  copy.setDate(copy.getDate() + diff)
  return copy
}

/**
 * Parse an ISO date string "YYYY-MM-DD" into a LOCAL midnight Date.
 * Using `new Date("YYYY-MM-DD")` parses as UTC midnight — wrong for timezones.
 */
function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)  // local midnight
}

/** "14 Sep – 20 Sep 2026" using LOCAL date parts */
export function formatWeekRange(iso: string): string {
  const start = parseISO(iso)
  const end   = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6)
  const sy = start.getFullYear(), ey = end.getFullYear()
  const sm = SHORT_MONTHS[start.getMonth()], em = SHORT_MONTHS[end.getMonth()]
  if (sy === ey && sm === em)
    return `${start.getDate()} – ${end.getDate()} ${sm} ${sy}`
  if (sy === ey)
    return `${start.getDate()} ${sm} – ${end.getDate()} ${em} ${sy}`
  return `${start.getDate()} ${sm} ${sy} – ${end.getDate()} ${em} ${ey}`
}

/**
 * Build a 6×7 grid of LOCAL Date objects for a given (year, month).
 * Column 0 = Monday, column 6 = Sunday.
 * Cells outside the month are padded with null.
 */
function buildGrid(year: number, month: number): (Date | null)[][] {
  const first    = new Date(year, month, 1)
  const last     = new Date(year, month + 1, 0)

  // Monday-anchored offset: Mon=0, Tue=1 … Sun=6
  const startDow = (first.getDay() + 6) % 7

  const cells: (Date | null)[] = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)

  const rows: (Date | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
  return rows
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface WeekPickerProps {
  value:    string            // ISO "YYYY-MM-DD" of the Monday
  onChange: (iso: string) => void
  onClose:  () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WeekPicker({ value, onChange, onClose }: WeekPickerProps) {
  const selectedMonday = mondayOf(parseISO(value))

  const [viewYear,  setViewYear]  = useState(selectedMonday.getFullYear())
  const [viewMonth, setViewMonth] = useState(selectedMonday.getMonth())
  const [hovered,   setHovered]   = useState<string | null>(null)

  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click or Escape
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown',   onKey)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown',   onKey)
    }
  }, [onClose])

  const grid = buildGrid(viewYear, viewMonth)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const goToday = () => {
    const t = new Date()
    setViewYear(t.getFullYear())
    setViewMonth(t.getMonth())
    onChange(localISO(mondayOf(t)))
    onClose()
  }

  /**
   * Given a grid row, return the LOCAL ISO Monday for that week.
   * Col 0 is always Monday (or null if the month doesn't start on Monday).
   * We scan left-to-right for the first non-null date, then compute its Monday.
   */
  const rowMondayISO = (row: (Date | null)[]): string | null => {
    const first = row.find(d => d !== null)
    return first ? localISO(mondayOf(first)) : null
  }

  const selectedISO  = localISO(selectedMonday)   // e.g. "2026-04-06"
  const todayISO     = localISO(new Date())        // e.g. "2026-04-10" — LOCAL, no UTC shift

  return (
    <div
      ref={ref}
      className="fade-in"
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 300,
        background: 'var(--bg-header)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        boxShadow: 'var(--shadow)',
        padding: '16px',
        width: 308,
        userSelect: 'none',
      }}
    >
      {/* ── Month / year navigation ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
        <button
          onClick={prevMonth}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)', width: 32, height: 32, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          ‹
        </button>

        <div style={{ display: 'flex', gap: 5, flex: 1, justifyContent: 'center' }}>
          <select
            value={viewMonth}
            onChange={e => setViewMonth(Number(e.target.value))}
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)', borderRadius: 7, color: 'var(--text-primary)', fontSize: 13, fontWeight: 700, padding: '4px 6px', cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}
          >
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select
            value={viewYear}
            onChange={e => setViewYear(Number(e.target.value))}
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)', borderRadius: 7, color: 'var(--text-primary)', fontSize: 13, fontWeight: 700, padding: '4px 6px', cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}
          >
            {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 1 + i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <button
          onClick={nextMonth}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)', width: 32, height: 32, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          ›
        </button>
      </div>

      {/* ── Day-of-week header: Mon … Sun ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 6 }}>
        {DOW.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', padding: '3px 0', letterSpacing: '0.06em' }}>
            {d}
          </div>
        ))}
      </div>

      {/* ── Week rows ── */}
      {grid.map((row, ri) => {
        const mon      = rowMondayISO(row)          // ISO "YYYY-MM-DD" or null
        const selected = mon === selectedISO
        const hovering = mon !== null && mon === hovered

        return (
          <div
            key={ri}
            onClick={() => { if (mon) { onChange(mon); onClose() } }}
            onMouseEnter={() => setHovered(mon)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7,1fr)',
              borderRadius: 8,
              cursor: mon ? 'pointer' : 'default',
              background: selected
                ? 'rgba(74,222,128,0.15)'
                : hovering
                ? 'var(--surface-hover)'
                : 'transparent',
              border: `1.5px solid ${selected ? 'rgba(74,222,128,0.4)' : 'transparent'}`,
              transition: 'background 0.12s',
              marginBottom: 2,
            }}
          >
            {row.map((date, di) => {
              const iso            = date ? localISO(date) : null
              const isToday        = iso === todayISO
              const isCurrentMonth = date !== null && date.getMonth() === viewMonth

              return (
                <div
                  key={di}
                  style={{
                    textAlign: 'center',
                    padding: '6px 2px',
                    fontSize: 12,
                    fontWeight: isToday ? 800 : isCurrentMonth ? 500 : 400,
                    color: !date
                      ? 'transparent'
                      : isToday
                      ? 'var(--green)'
                      : selected
                      ? 'var(--text-primary)'
                      : isCurrentMonth
                      ? 'var(--text-primary)'
                      : 'var(--text-muted)',
                    position: 'relative',
                  }}
                >
                  {date?.getDate() ?? ''}
                  {/* Today dot — only if today is in this cell */}
                  {isToday && (
                    <div style={{
                      position: 'absolute',
                      bottom: 2,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: 'var(--green)',
                    }} />
                  )}
                </div>
              )
            })}
          </div>
        )
      })}

      {/* ── Footer ── */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ flex: 1, fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          Week of <strong style={{ color: 'var(--text-secondary)', marginLeft: 4 }}>{formatWeekRange(value)}</strong>
        </div>
        <button
          onClick={goToday}
          style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: 'var(--green)', cursor: 'pointer', flexShrink: 0 }}
        >
          Today
        </button>
        <button
          onClick={onClose}
          style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0 }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}

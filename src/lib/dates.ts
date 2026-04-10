/**
 * Week 1 starts Monday 6 April 2026.
 * Returns the ISO date string (YYYY-MM-DD) for the Monday of a given week number.
 */
const PLAN_START = new Date('2026-04-06T00:00:00') // Monday

export function weekStartDate(weekNumber: number): Date {
  const d = new Date(PLAN_START)
  d.setDate(d.getDate() + (weekNumber - 1) * 7)
  return d
}

export function weekStartISO(weekNumber: number): string {
  return weekStartDate(weekNumber).toISOString().slice(0, 10)
}

/** e.g. "6 Apr – 12 Apr 2026" */
export function weekDateRange(weekNumber: number): string {
  const start = weekStartDate(weekNumber)
  const end   = new Date(start)
  end.setDate(end.getDate() + 6)
  return `${fmt(start)} – ${fmt(end)}`
}

/** Return the actual calendar date for a session day abbreviation within a given week. */
const DAY_OFFSET: Record<string, number> = {
  Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6,
}

export function sessionDate(weekNumber: number, dayAbbrev: string): string {
  const start  = weekStartDate(weekNumber)
  const offset = DAY_OFFSET[dayAbbrev.slice(0, 3)] ?? 0
  const d      = new Date(start)
  d.setDate(d.getDate() + offset)
  return fmtFull(d)
}

// ─── Formatters ───────────────────────────────────────────────────────────────

const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmt(d: Date): string {
  return `${d.getDate()} ${SHORT_MONTHS[d.getMonth()]}`
}

function fmtFull(d: Date): string {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  return `${days[d.getDay()]} ${d.getDate()} ${SHORT_MONTHS[d.getMonth()]}`
}

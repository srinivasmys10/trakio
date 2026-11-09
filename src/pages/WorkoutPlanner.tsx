import { useState, useRef, useCallback, useEffect, type FormEvent } from 'react'
import WeekPicker,     { formatWeekRange } from '../components/WeekPicker'
import WorkoutCalendar from '../components/WorkoutCalendar'
import AudioRecorder from '../components/AudioRecorder'
import { useExerciseLibrary } from '../hooks/useExerciseLibrary'
import { useWorkoutPlan }     from '../hooks/useWorkoutPlan'
import { uploadAudio }        from '../lib/exerciseLibrary'
import Card from '../components/Card'
import {
  WEEKDAYS, EXERCISE_TYPES, EXERCISE_TYPE_LABELS,
  type ExerciseLibraryItem, type NewExerciseLibraryItem,
  type ExerciseType, type Weekday,
} from '../types'

// ─── Local date helpers ───────────────────────────────────────────────────────

function localISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
function addWeeks(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  return localISO(new Date(y, m - 1, d + n * 7))
}
function currentMondayISO(): string {
  const d   = new Date()
  const dow = d.getDay()
  return localISO(new Date(d.getFullYear(), d.getMonth(), d.getDate() + (dow === 0 ? -6 : 1 - dow)))
}

const _DOW: Record<string, number> = { Monday:0,Tuesday:1,Wednesday:2,Thursday:3,Friday:4,Saturday:5,Sunday:6 }
const _MO  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function dayDate(weekStart: string, weekday: string): string {
  const [y,m,d] = weekStart.split('-').map(Number)
  const dt = new Date(y, m-1, d + (_DOW[weekday] ?? 0))
  return `${dt.getDate()} ${_MO[dt.getMonth()]}`
}

// ─── Group by impacted muscle area ────────────────────────────────────────────
// An exercise is filed under its FIRST impact area (its primary muscle), so it
// appears once. Common muscles sort in a sensible body order; others follow A–Z;
// exercises with no tags go last.

const AREA_ORDER = [
  'chest', 'shoulders', 'delts', 'back', 'lats', 'traps', 'biceps', 'triceps', 'forearms',
  'core', 'abs', 'obliques', 'lower back', 'glutes', 'quads', 'hamstrings', 'calves', 'hip flexors',
]

const areaKey   = (ex: ExerciseLibraryItem) => (ex.impact_areas[0] ?? '').trim().toLowerCase()
const areaLabel = (k: string) => k ? k.replace(/\b\w/g, c => c.toUpperCase()) : 'Untagged'

function groupByArea<T>(items: T[], get: (t: T) => ExerciseLibraryItem): { key: string; label: string; items: T[] }[] {
  const map = new Map<string, T[]>()
  for (const it of items) {
    const k = areaKey(get(it))
    map.set(k, [...(map.get(k) ?? []), it])
  }
  const rank = (k: string) => { const i = AREA_ORDER.indexOf(k); return i === -1 ? AREA_ORDER.length : i }
  return [...map.entries()]
    .sort(([a], [b]) => {
      if (!a) return 1
      if (!b) return -1
      return rank(a) - rank(b) || a.localeCompare(b)
    })
    .map(([key, items]) => ({ key, label: areaLabel(key), items }))
}

function AreaHeader({ label, count, size = 10 }: { label: string; count: number; size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '8px 2px 5px' }}>
      <span style={{ fontSize: size, fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{count}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

const fs = (): React.CSSProperties => ({
  background: 'var(--bg-input)', border: '1px solid var(--border-input)',
  borderRadius: 8, color: 'var(--text-primary)', fontSize: 13,
  padding: '9px 12px', outline: 'none', fontFamily: 'inherit',
  width: '100%', boxSizing: 'border-box',
})

function Lbl({ children }: { children: React.ReactNode }) {
  return <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, display: 'block' }}>{children}</label>
}

// ─── Exercise Library Form ────────────────────────────────────────────────────

interface ExerciseFormProps {
  initial?:  ExerciseLibraryItem
  saving:    boolean
  onSave:    (item: NewExerciseLibraryItem, blob: Blob | null) => Promise<void>
  onCancel:  () => void
}

function ExerciseForm({ initial, saving, onSave, onCancel }: ExerciseFormProps) {
  const [name,         setName]         = useState(initial?.name          ?? '')
  const [description,  setDescription]  = useState(initial?.description   ?? '')
  const [exType,       setExType]       = useState<ExerciseType>(initial?.exercise_type ?? 'upper_body')
  const [impactText,   setImpactText]   = useState((initial?.impact_areas ?? []).join(', '))
  const [sets,         setSets]         = useState(String(initial?.default_sets ?? 3))
  const [reps,         setReps]         = useState(initial?.default_reps   ?? '10')
  const [audioBlob,    setAudioBlob]    = useState<Blob | null>(null)
  const [clearAudio,   setClearAudio]   = useState(false)   // user wants to remove existing
  const [err,          setErr]          = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setErr('Name is required'); return }
    setErr('')

    const impactAreas = impactText.split(',').map(s => s.trim()).filter(Boolean)
    const audioUrl    = clearAudio ? null : (initial?.audio_url ?? null)

    await onSave({
      name:          name.trim(),
      description:   description.trim(),
      exercise_type: exType,
      impact_areas:  impactAreas,
      default_sets:  parseInt(sets) || 3,
      default_reps:  reps.trim() || '10',
      audio_url:     audioUrl,
      sort_order:    initial?.sort_order ?? 99,
    }, audioBlob)
  }

  const selBtn = (active: boolean, color: string): React.CSSProperties => ({
    padding: '4px 10px', borderRadius: 7, fontSize: 11, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
    border: `1.5px solid ${active ? color : 'var(--border)'}`,
    background: active ? `${color}22` : 'var(--bg-input)',
    color: active ? color : 'var(--text-muted)',
  })

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
      {/* Exercise type */}
      <div>
        <Lbl>Exercise Type</Lbl>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {EXERCISE_TYPES.map(et => {
            const info = EXERCISE_TYPE_LABELS[et]
            return (
              <button key={et} type="button" onClick={() => setExType(et)} style={selBtn(exType === et, info.color)}>
                {info.icon} {info.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Name */}
      <div><Lbl>Exercise Name *</Lbl><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Barbell Back Squat" style={fs()} /></div>

      {/* Description */}
      <div><Lbl>Description / Coaching Cue</Lbl><textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Form tips, common mistakes, range of motion notes..." style={{ ...fs(), minHeight: 70, resize: 'vertical' }} /></div>

      {/* Sets + Reps */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div><Lbl>Default Sets</Lbl><input type="number" value={sets} onChange={e => setSets(e.target.value)} min={1} max={20} style={fs()} /></div>
        <div><Lbl>Default Reps / Duration</Lbl><input type="text" value={reps} onChange={e => setReps(e.target.value)} placeholder='e.g. "8-12" or "30 sec"' style={fs()} /></div>
      </div>

      {/* Impact areas */}
      <div>
        <Lbl>Impact Areas <span style={{ textTransform: 'none', fontWeight: 400 }}>(comma-separated)</span></Lbl>
        <input type="text" value={impactText} onChange={e => setImpactText(e.target.value)} placeholder="e.g. quads, glutes, hamstrings" style={fs()} />
      </div>

      {/* Audio recorder */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
        <AudioRecorder
          existingUrl={clearAudio ? null : initial?.audio_url}
          onRecorded={blob => { setAudioBlob(blob); setClearAudio(false) }}
          onClear={() => { setAudioBlob(null); setClearAudio(true) }}
        />
      </div>

      {err && <div style={{ fontSize: 12, color: 'var(--red)' }}>⚠ {err}</div>}

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" disabled={saving} style={{ flex: 1, padding: '10px 0', borderRadius: 9, fontSize: 13, fontWeight: 700, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', background: saving ? 'rgba(74,222,128,0.15)' : 'var(--green)', color: 'var(--bg)' }}>
          {saving ? 'Saving…' : initial ? 'Update Exercise' : 'Add to Library'}
        </button>
        <button type="button" onClick={onCancel} style={{ padding: '10px 14px', borderRadius: 9, fontSize: 13, fontWeight: 600, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </form>
  )
}

// ─── Exercise Library Panel ───────────────────────────────────────────────────

function LibraryPanel({ exercises, saving, onAdd, onUpdate, onRemove }: {
  exercises: ExerciseLibraryItem[]
  saving:    boolean
  onAdd:     (item: NewExerciseLibraryItem, blob: Blob | null) => Promise<void>
  onUpdate:  (id: number, item: Partial<NewExerciseLibraryItem>, blob: Blob | null) => Promise<void>
  onRemove:  (id: number, audioUrl?: string | null) => Promise<void>
}) {
  const [showForm,  setShowForm]  = useState(false)
  const [editItem,  setEditItem]  = useState<ExerciseLibraryItem | null>(null)
  const [expanded,  setExpanded]  = useState<number | null>(null)
  const [filterType, setFilterType] = useState<ExerciseType | 'all'>('all')
  const [searchQ,   setSearchQ]   = useState('')

  const visible = exercises.filter(ex => {
    const typeOk   = filterType === 'all' || ex.exercise_type === filterType
    const searchOk = !searchQ || ex.name.toLowerCase().includes(searchQ.toLowerCase()) || ex.impact_areas.some(a => a.toLowerCase().includes(searchQ.toLowerCase()))
    return typeOk && searchOk
  })

  const renderEx = (ex: ExerciseLibraryItem) => {
    const info = EXERCISE_TYPE_LABELS[ex.exercise_type]
    const open = expanded === ex.id
    return (
      <div key={ex.id} style={{ background: info.bg, border: `1px solid ${info.border}`, borderRadius: 10, marginBottom: 7, overflow: 'hidden' }}>
        <div onClick={() => setExpanded(open ? null : ex.id)} style={{ padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>{info.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.name}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: info.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{info.label}</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{ex.default_sets} sets · {ex.default_reps}</span>
              {ex.audio_url && <span style={{ fontSize: 10, color: 'var(--amber)' }}>🎙 audio</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
            <button onClick={e => { e.stopPropagation(); setEditItem(ex); setShowForm(false) }} style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: 6, color: 'var(--blue)', fontSize: 11, padding: '3px 8px', cursor: 'pointer' }}>✏</button>
            <button onClick={async e => { e.stopPropagation(); if (window.confirm(`Delete "${ex.name}"? This removes it from all workout plans.`)) await onRemove(ex.id, ex.audio_url) }} style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 6, color: 'var(--red)', fontSize: 11, padding: '3px 8px', cursor: 'pointer' }}>🗑</button>
            <span style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: '24px' }}>{open ? '▲' : '▼'}</span>
          </div>
        </div>
        {open && (
          <div style={{ borderTop: `1px solid ${info.border}`, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ex.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{ex.description}</p>}
            {ex.impact_areas.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {ex.impact_areas.map(a => (
                  <span key={a} style={{ fontSize: 10, fontWeight: 600, color: info.color, background: `${info.color}18`, border: `1px solid ${info.border}`, borderRadius: 5, padding: '2px 7px' }}>{a}</span>
                ))}
              </div>
            )}
            {ex.audio_url && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Audio Cue</div>
                <audio src={ex.audio_url} controls style={{ width: '100%', height: 32 }} />
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Search */}
      <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
        placeholder="Search exercises or muscle groups…"
        style={{ ...fs(), marginBottom: 10 }} />

      {/* Type filter + Add */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' }}>
        <button onClick={() => setFilterType('all')} style={{ padding: '4px 10px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', border: `1.5px solid ${filterType === 'all' ? 'var(--text-secondary)' : 'var(--border)'}`, background: filterType === 'all' ? 'rgba(100,100,100,0.12)' : 'var(--surface)', color: filterType === 'all' ? 'var(--text-secondary)' : 'var(--text-muted)' }}>All</button>
        {EXERCISE_TYPES.map(et => {
          const info   = EXERCISE_TYPE_LABELS[et]
          const active = filterType === et
          return <button key={et} onClick={() => setFilterType(et)} style={{ padding: '4px 10px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', border: `1.5px solid ${active ? info.color : 'var(--border)'}`, background: active ? `${info.color}18` : 'var(--surface)', color: active ? info.color : 'var(--text-muted)' }}>{info.icon}</button>
        })}
        <button onClick={() => { setShowForm(true); setEditItem(null) }} style={{ marginLeft: 'auto', padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 700, border: '1px solid rgba(74,222,128,0.4)', background: 'rgba(74,222,128,0.08)', color: 'var(--green)', cursor: 'pointer', fontFamily: 'inherit' }}>+ New Exercise</button>
      </div>

      {/* Add/Edit form */}
      {(showForm || editItem) && (
        <Card style={{ marginBottom: 14, borderColor: editItem ? 'rgba(96,165,250,0.3)' : 'rgba(74,222,128,0.3)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: editItem ? 'var(--blue)' : 'var(--green)', marginBottom: 12 }}>
            {editItem ? `✏ Edit: ${editItem.name}` : '➕ New Exercise'}
          </div>
          <ExerciseForm
            initial={editItem ?? undefined}
            saving={saving}
            onSave={async (item, blob) => {
              if (editItem) await onUpdate(editItem.id, item, blob)
              else await onAdd(item, blob)
              setShowForm(false); setEditItem(null)
            }}
            onCancel={() => { setShowForm(false); setEditItem(null) }}
          />
        </Card>
      )}

      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{visible.length} exercise{visible.length !== 1 ? 's' : ''}</div>


      {groupByArea(visible, ex => ex).map(g => (
        <div key={g.key || 'untagged'} style={{ marginBottom: 8 }}>
          <AreaHeader label={g.label} count={g.items.length} size={11} />
          {g.items.map(renderEx)}
        </div>
      ))}
    </div>
  )
}

// ─── Day workout card ─────────────────────────────────────────────────────────

const smallBtn = (color: string, bg: string, border: string): React.CSSProperties => ({
  padding: '4px 10px', borderRadius: 7, fontSize: 11, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'inherit', color, background: bg, border: `1px solid ${border}`,
})

function DayWorkout({
  day, slots, exercises, saving, weekStart, dayDone, isToday, expanded, today,
  onToggleExpand, onAdd, onRemove, onToggle, onDayToggle, onCopy, onClearDay,
}: {
  day:            Weekday
  slots:          import('../types').WorkoutSlot[]
  exercises:      ExerciseLibraryItem[]
  saving:         boolean
  weekStart:      string
  dayDone:        boolean
  isToday:        boolean
  expanded:       boolean
  today:          { weekStart: string; weekday: Weekday }
  onToggleExpand: () => void
  onAdd:          (exerciseId: number) => Promise<void>
  onRemove:       (id: number) => Promise<void>
  onToggle:       (id: number, completed: boolean) => Promise<void>
  onDayToggle:    (completed: boolean) => Promise<void>
  onCopy:         (slotIds: number[], targetWeekStart: string, targetWeekday: Weekday) => Promise<number>
  onClearDay:     () => Promise<void>
}) {
  const [showPicker, setShowPicker] = useState(false)
  const [searchQ,    setSearchQ]    = useState('')
  const [selectedRaw, setSelected]  = useState<Set<number>>(new Set())
  const [notice,     setNotice]     = useState<{ text: string; error?: boolean } | null>(null)

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 2800)
    return () => clearTimeout(t)
  }, [notice])

  const filtered = exercises.filter(ex =>
    !searchQ || ex.name.toLowerCase().includes(searchQ.toLowerCase()) || ex.exercise_type.includes(searchQ.toLowerCase()) || ex.impact_areas.some(a => a.toLowerCase().includes(searchQ.toLowerCase()))
  )

  const pickerGroups = groupByArea(filtered, ex => ex)

  // Day's exercises organised by impacted muscle area
  const slotGroups = groupByArea(slots, sl => sl.exercise)

  // Only count selections for slots that still exist (removed / cleared ones drop out)
  const selected = new Set([...selectedRaw].filter(id => slots.some(s => s.id === id)))
  const completedCount = slots.filter(s => s.completed).length
  const selCount       = selected.size
  const isTodayTarget  = today.weekStart === weekStart && today.weekday === day

  const toggleSelect = (id: number) =>
    setSelected(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })

  const doCopy = async (targetWeekStart: string, targetWeekday: Weekday, label: string) => {
    const ids = [...selected]
    try {
      const n = await onCopy(ids, targetWeekStart, targetWeekday)
      setNotice({ text: `Copied ${n} exercise${n !== 1 ? 's' : ''} to ${label}` })
      setSelected(new Set())
    } catch (e) {
      setNotice({ text: e instanceof Error ? e.message : 'Copy failed', error: true })
    }
  }

  const doClear = async () => {
    if (!window.confirm(`Delete all ${slots.length} exercise${slots.length !== 1 ? 's' : ''} on ${day}?`)) return
    try { await onClearDay(); setSelected(new Set()) }
    catch (e) { setNotice({ text: e instanceof Error ? e.message : 'Delete failed', error: true }) }
  }

  const accent = dayDone ? 'var(--green)' : isToday ? 'var(--blue)' : 'var(--text-secondary)'

  return (
    <div style={{ marginBottom: expanded ? 20 : 8 }}>
      {/* Day header — tap anywhere to collapse / expand */}
      <div
        onClick={onToggleExpand}
        role="button"
        aria-expanded={expanded}
        style={{
          display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: expanded ? 8 : 0,
          cursor: 'pointer', padding: '8px 10px', borderRadius: 10,
          background: 'var(--surface)',
          border: `1px solid ${dayDone ? 'rgba(74,222,128,0.35)' : isToday ? 'rgba(96,165,250,0.45)' : 'var(--border)'}`,
        }}
      >
        <span style={{ fontSize: 10, color: 'var(--text-muted)', width: 10, flexShrink: 0 }}>{expanded ? '▼' : '▶'}</span>
        <div style={{ fontSize: 13, fontWeight: 700, color: accent }}>{day}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{dayDate(weekStart, day)}</div>
        {isToday && (
          <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--blue)', background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.35)', borderRadius: 5, padding: '1px 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Today</span>
        )}
        {slots.length > 0 && (
          <button
            onClick={e => { e.stopPropagation(); void onDayToggle(!dayDone) }}
            disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '2px 8px', borderRadius: 20, border: 'none', cursor: 'pointer',
              fontSize: 10, fontWeight: 700, transition: 'all 0.2s',
              background: dayDone ? 'rgba(74,222,128,0.15)' : 'var(--bg-input)',
              color: dayDone ? 'var(--green)' : 'var(--text-muted)',
              outline: dayDone ? '1px solid rgba(74,222,128,0.4)' : '1px solid var(--border)',
            }}
          >
            {dayDone ? '✓ Done' : `${completedCount}/${slots.length}`}
          </button>
        )}
        <div style={{ flex: 1 }} />
        {/* When collapsed, show which areas the day hits */}
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{slots.length} exercise{slots.length !== 1 ? 's' : ''}</span>
        {/* Collapsed: show the muscle areas the day works */}
        {!expanded && slotGroups.length > 0 && (
          <div style={{ flexBasis: '100%', fontSize: 11, color: 'var(--text-muted)', paddingLeft: 18, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {slotGroups.map(g => g.label).join(' · ')}
          </div>
        )}
      </div>

      {expanded && (
        <>
          {/* Day toolbar: select all / delete all */}
          {slots.length > 0 && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Tap an exercise to select it</span>
              <div style={{ flex: 1 }} />
              <button
                onClick={() => setSelected(selCount === slots.length ? new Set() : new Set(slots.map(s => s.id)))}
                style={smallBtn('var(--text-secondary)', 'var(--bg-input)', 'var(--border)')}
              >
                {selCount === slots.length ? 'Deselect all' : 'Select all'}
              </button>
              <button
                onClick={() => void doClear()}
                disabled={saving}
                style={smallBtn('var(--red)', 'rgba(248,113,113,0.08)', 'rgba(248,113,113,0.3)')}
              >
                🗑 Delete all
              </button>
            </div>
          )}

          {/* Selection action bar */}
          {selCount > 0 && (
            <div style={{ background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.35)', borderRadius: 10, padding: 10, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)' }}>{selCount} selected</span>
                <div style={{ flex: 1 }} />
                {!isTodayTarget && (
                  <button
                    onClick={() => void doCopy(today.weekStart, today.weekday, 'today')}
                    disabled={saving}
                    style={{ ...smallBtn('var(--bg)', 'var(--blue)', 'var(--blue)'), padding: '5px 12px' }}
                  >
                    📋 Copy to today
                  </button>
                )}
                <button onClick={() => setSelected(new Set())} style={smallBtn('var(--text-muted)', 'transparent', 'var(--border)')}>Clear</button>
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Copy to…</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {WEEKDAYS.filter(d => d !== day).map(d => (
                  <button
                    key={d}
                    onClick={() => void doCopy(weekStart, d, d)}
                    disabled={saving}
                    style={smallBtn('var(--text-primary)', 'var(--bg-input)', 'var(--border)')}
                  >
                    {d.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {notice && (
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: notice.error ? 'var(--red)' : 'var(--green)' }}>
              {notice.error ? '⚠ ' : '✓ '}{notice.text}
            </div>
          )}

          {/* Exercise slots, grouped by impacted area */}
          {slotGroups.map(({ key, label, items }) => {
            return (
              <div key={key || 'untagged'} style={{ marginBottom: 6 }}>
                <AreaHeader label={label} count={items.length} />
                {items.map(slot => {
                  const info = EXERCISE_TYPE_LABELS[slot.exercise.exercise_type]
                  const done = slot.completed
                  const sel  = selected.has(slot.id)
                  return (
                    <div
                      key={slot.id}
                      onClick={() => toggleSelect(slot.id)}
                      style={{
                        background: done ? 'rgba(74,222,128,0.06)' : info.bg,
                        border: `1px solid ${done ? 'rgba(74,222,128,0.35)' : info.border}`,
                        boxShadow: sel ? '0 0 0 2px var(--blue)' : 'none',
                        borderRadius: 9, padding: '10px 12px', marginBottom: 6,
                        display: 'flex', alignItems: 'flex-start', gap: 8,
                        opacity: done ? 0.85 : 1, transition: 'all 0.2s', cursor: 'pointer',
                      }}
                    >
                      {/* Done checkbox (unchanged behaviour) */}
                      <button
                        onClick={e => { e.stopPropagation(); void onToggle(slot.id, !done) }}
                        disabled={saving}
                        aria-label={done ? 'Mark incomplete' : 'Mark complete'}
                        style={{
                          flexShrink: 0, marginTop: 1,
                          width: 22, height: 22, borderRadius: 6,
                          border: `2px solid ${done ? 'var(--green)' : info.border}`,
                          background: done ? 'rgba(74,222,128,0.2)' : 'transparent',
                          cursor: 'pointer', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', transition: 'all 0.18s',
                        }}
                      >
                        {done && <span style={{ color: 'var(--green)', fontSize: 12, fontWeight: 700, lineHeight: 1 }}>✓</span>}
                      </button>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 13, fontWeight: 700,
                          color: done ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: done ? 'line-through' : 'none',
                          transition: 'all 0.2s',
                        }}>
                          {slot.exercise.name}
                        </div>
                        <div style={{ fontSize: 11, color: done ? 'var(--text-muted)' : info.color, fontWeight: 600, marginTop: 2 }}>
                          {slot.custom_sets ?? slot.exercise.default_sets} sets · {slot.custom_reps ?? slot.exercise.default_reps}
                        </div>
                        {slot.exercise.impact_areas.length > 1 && (
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                            also {slot.exercise.impact_areas.slice(1, 4).join(' · ')}
                          </div>
                        )}
                      </div>

                      {sel && <span style={{ color: 'var(--blue)', fontSize: 13, fontWeight: 800, flexShrink: 0, lineHeight: '26px' }}>●</span>}

                      <button onClick={e => { e.stopPropagation(); void onRemove(slot.id) }} disabled={saving} style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 6, color: 'var(--red)', fontSize: 12, width: 26, height: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
                    </div>
                  )
                })}
              </div>
            )
          })}

          {/* Add exercise picker */}
          {!showPicker ? (
            <button onClick={() => setShowPicker(true)} style={{ width: '100%', padding: '7px 12px', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'left', border: '1.5px dashed rgba(74,222,128,0.4)', background: 'rgba(74,222,128,0.05)', color: 'var(--green)', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
              💪 Add exercise
            </button>
          ) : (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
              <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search exercises…" style={{ ...fs(), marginBottom: 10 }} autoFocus />
              <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                {pickerGroups.map(g => (
                  <div key={g.key || 'untagged'} style={{ marginBottom: 10 }}>
                    <AreaHeader label={g.label} count={g.items.length} />
                    {g.items.map(ex => (
                      <button key={ex.id} onClick={async () => { await onAdd(ex.id); setShowPicker(false); setSearchQ('') }} disabled={saving} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, marginBottom: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'left', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'inherit' }}>
                        <div>{ex.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{ex.default_sets} sets · {ex.default_reps}{ex.impact_areas.length > 1 ? ` · also ${ex.impact_areas.slice(1, 3).join(', ')}` : ''}</div>
                      </button>
                    ))}
                  </div>
                ))}
                {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: 13 }}>No exercises found</div>}
              </div>
              <button onClick={() => { setShowPicker(false); setSearchQ('') }} style={{ marginTop: 8, background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }}>Cancel</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function WorkoutPlanner() {
  const [weekStart,   setWeekStart]   = useState(currentMondayISO)
  const [tab,         setTab]         = useState<'overview' | 'plan' | 'library'>('plan')
  const [showPicker,  setShowPicker]  = useState(false)
  const pickerRef                     = useRef<HTMLDivElement>(null)

  const { exercises, loading: libLoading, error: libError, saving: libSaving, add, update, remove } = useExerciseLibrary()
  const { slots, dayCompletions, loading: planLoading, error: planError, saving: planSaving, addSlot, toggleCompleted, markDayDone, removeSlot, copySlots, clearDay } = useWorkoutPlan(weekStart)

  // Today (real calendar day) — target for "Copy to today"
  const today = { weekStart: currentMondayISO(), weekday: WEEKDAYS[(new Date().getDay() + 6) % 7] as Weekday }

  // Which days are expanded. Default: today (if viewing the current week), else all collapsed.
  const defaultExpanded = (ws: string): Set<Weekday> =>
    ws === today.weekStart ? new Set<Weekday>([today.weekday]) : new Set<Weekday>()
  // Overrides are tied to the week they were made in; changing week falls back to the default
  const [expandState, setExpandState] = useState<{ week: string; days: Set<Weekday> } | null>(null)
  const expandedDays = expandState && expandState.week === weekStart ? expandState.days : defaultExpanded(weekStart)
  const setExpandedDays = (days: Set<Weekday>) => setExpandState({ week: weekStart, days })
  const toggleDay = (d: Weekday) => {
    const n = new Set(expandedDays); if (n.has(d)) n.delete(d); else n.add(d); setExpandedDays(n)
  }
  const allExpanded = expandedDays.size === WEEKDAYS.length

  const slotsFor = (day: Weekday) => slots.filter(s => s.weekday === day).sort((a, b) => a.sort_order - b.sort_order)

  // Save exercise — handles audio upload then save
  const handleAdd = useCallback(async (item: NewExerciseLibraryItem, blob: Blob | null) => {
    let audioUrl = item.audio_url
    if (blob) {
      try { audioUrl = await uploadAudio(blob, item.name) }
      catch (e) { console.error('Audio upload failed:', e) }
    }
    await add({ ...item, audio_url: audioUrl ?? null })
  }, [add])

  const handleUpdate = useCallback(async (id: number, item: Partial<NewExerciseLibraryItem>, blob: Blob | null) => {
    let audioUrl = item.audio_url
    if (blob) {
      try { audioUrl = await uploadAudio(blob, item.name ?? 'exercise') }
      catch (e) { console.error('Audio upload failed:', e) }
    }
    await update(id, { ...item, audio_url: audioUrl ?? null })
  }, [update])

  return (
    <div className="fade-in">
      {/* ── Tabs ── */}
      <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: 10, padding: 3, marginBottom: 18 }}>
        {([
          ['overview', '📊 Overview'],
          ['plan',     '💪 Week Plan'],
          ['library',  '📋 Library'],
        ] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'inherit', transition: 'all 0.2s', background: tab === t ? 'var(--bg-header)' : 'transparent', color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.12)' : 'none' }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Overview tab ── */}
      {tab === 'overview' && <WorkoutCalendar />}

      {/* ── Week Plan ── */}
      {tab === 'plan' && (
        <>
          {/* Week navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <button onClick={() => setWeekStart(w => addWeeks(w, -1))} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)', padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}>←</button>

            <div ref={pickerRef} style={{ position: 'relative', textAlign: 'center' }}>
              <button onClick={() => setShowPicker(v => !v)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 5, borderBottom: showPicker ? '1.5px solid var(--blue)' : '1.5px solid transparent', paddingBottom: 2 }}>
                  📅 {formatWeekRange(weekStart)}
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{showPicker ? '▲' : '▼'}</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{slots.filter(s => s.completed).length}/{slots.length} completed</div>
              </button>
              {showPicker && (
                <WeekPicker value={weekStart} onChange={iso => { setWeekStart(iso); setShowPicker(false) }} onClose={() => setShowPicker(false)} />
              )}
            </div>

            <button onClick={() => setWeekStart(w => addWeeks(w, 1))} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)', padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}>→</button>
          </div>

          {(planLoading || libLoading) && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>Loading…</div>
          )}
          {(planError || libError) && (
            <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: 14, fontSize: 13, color: 'var(--red)', marginBottom: 14 }}>{planError ?? libError}</div>
          )}

          {!planLoading && !libLoading && !planError && !libError && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              <button
                onClick={() => setExpandedDays(allExpanded ? new Set() : new Set<Weekday>(WEEKDAYS))}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {allExpanded ? 'Collapse all ▲' : 'Expand all ▼'}
              </button>
            </div>
          )}

          {!planLoading && !libLoading && !planError && !libError && WEEKDAYS.map(day => (
            <DayWorkout
              key={day}
              day={day}
              slots={slotsFor(day)}
              exercises={exercises}
              saving={planSaving}
              weekStart={weekStart}
              dayDone={dayCompletions.some(d => d.weekday === day && d.completed)}
              isToday={today.weekStart === weekStart && today.weekday === day}
              expanded={expandedDays.has(day)}
              today={today}
              onToggleExpand={() => toggleDay(day)}
              onCopy={copySlots}
              onClearDay={() => clearDay(weekStart, day)}
              onAdd={exId => addSlot({ weekStart, weekday: day, exerciseId: exId })}
              onRemove={removeSlot}
              onToggle={(id, completed) => toggleCompleted(id, completed, day, weekStart, slots)}
              onDayToggle={completed => markDayDone(weekStart, day, completed)}
            />
          ))}
        </>
      )}

      {/* ── Exercise Library ── */}
      {tab === 'library' && (
        <>
          {libLoading && <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>Loading library…</div>}
          {libError && <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: 14, fontSize: 13, color: 'var(--red)', marginBottom: 14 }}>{libError}</div>}
          {!libLoading && (
            <LibraryPanel
              exercises={exercises}
              saving={libSaving}
              onAdd={handleAdd}
              onUpdate={handleUpdate}
              onRemove={remove}
            />
          )}
        </>
      )}
    </div>
  )
}

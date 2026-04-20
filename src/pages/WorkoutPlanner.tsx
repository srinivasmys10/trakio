import { useState, useRef, useCallback, type FormEvent } from 'react'
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

      {visible.map(ex => {
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
      })}
    </div>
  )
}

// ─── Day workout card ─────────────────────────────────────────────────────────

function DayWorkout({ day, slots, exercises, saving, weekStart, dayDone, onAdd, onRemove, onToggle, onDayToggle }: {
  day:          Weekday
  slots:        import('../types').WorkoutSlot[]
  exercises:    ExerciseLibraryItem[]
  saving:       boolean
  weekStart:    string
  dayDone:      boolean
  onAdd:        (exerciseId: number) => Promise<void>
  onRemove:     (id: number) => Promise<void>
  onToggle:     (id: number, completed: boolean) => Promise<void>
  onDayToggle:  (completed: boolean) => Promise<void>
}) {
  const [showPicker, setShowPicker] = useState(false)
  const [searchQ,    setSearchQ]    = useState('')

  const filtered = exercises.filter(ex =>
    !searchQ || ex.name.toLowerCase().includes(searchQ.toLowerCase()) || ex.exercise_type.includes(searchQ.toLowerCase())
  )

  const typeGroups = EXERCISE_TYPES.reduce<Record<string, ExerciseLibraryItem[]>>((acc, et) => {
    const group = filtered.filter(ex => ex.exercise_type === et)
    if (group.length > 0) acc[et] = group
    return acc
  }, {})

  const completedCount = slots.filter(s => s.completed).length

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Day header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: dayDone ? 'var(--green)' : 'var(--text-secondary)' }}>{day}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{dayDate(weekStart, day)}</div>
        {/* Day completion badge */}
        {slots.length > 0 && (
          <button
            onClick={() => onDayToggle(!dayDone)}
            disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '2px 8px', borderRadius: 20, border: 'none', cursor: 'pointer',
              fontSize: 10, fontWeight: 700, transition: 'all 0.2s',
              background: dayDone ? 'rgba(74,222,128,0.15)' : 'var(--surface)',
              color: dayDone ? 'var(--green)' : 'var(--text-muted)',
              outline: dayDone ? '1px solid rgba(74,222,128,0.4)' : '1px solid var(--border)',
            }}
          >
            {dayDone ? '✓ Done' : `${completedCount}/${slots.length}`}
          </button>
        )}
        <div style={{ flex: 1, height: 1, background: dayDone ? 'rgba(74,222,128,0.3)' : 'var(--border)', transition: 'background 0.3s' }} />
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{slots.length} exercise{slots.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Exercise slots */}
      {slots.map(slot => {
        const info = EXERCISE_TYPE_LABELS[slot.exercise.exercise_type]
        const done = slot.completed
        return (
          <div key={slot.id} style={{
            background: done ? 'rgba(74,222,128,0.06)' : info.bg,
            border: `1px solid ${done ? 'rgba(74,222,128,0.35)' : info.border}`,
            borderRadius: 9, padding: '10px 12px', marginBottom: 6,
            display: 'flex', alignItems: 'flex-start', gap: 8,
            opacity: done ? 0.85 : 1, transition: 'all 0.2s',
          }}>
            {/* Checkbox */}
            <button
              onClick={() => onToggle(slot.id, !done)}
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
              {slot.exercise.impact_areas.length > 0 && (
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                  {slot.exercise.impact_areas.slice(0, 3).join(' · ')}
                </div>
              )}
            </div>

            {/* Remove button */}
            <button onClick={() => onRemove(slot.id)} disabled={saving} style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 6, color: 'var(--red)', fontSize: 12, width: 26, height: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
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
            {Object.entries(typeGroups).map(([et, exList]) => {
              const info = EXERCISE_TYPE_LABELS[et as ExerciseType]
              return (
                <div key={et} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: info.color, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>{info.icon} {info.label}</div>
                  {exList.map(ex => (
                    <button key={ex.id} onClick={async () => { await onAdd(ex.id); setShowPicker(false); setSearchQ('') }} disabled={saving} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, marginBottom: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'left', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'inherit' }}>
                      <div>{ex.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{ex.default_sets} sets · {ex.default_reps} {ex.impact_areas.length > 0 ? `· ${ex.impact_areas.slice(0,2).join(', ')}` : ''}</div>
                    </button>
                  ))}
                </div>
              )
            })}
            {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: 13 }}>No exercises found</div>}
          </div>
          <button onClick={() => { setShowPicker(false); setSearchQ('') }} style={{ marginTop: 8, background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }}>Cancel</button>
        </div>
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
  const { slots, dayCompletions, loading: planLoading, error: planError, saving: planSaving, addSlot, toggleCompleted, markDayDone, removeSlot } = useWorkoutPlan(weekStart)

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

          {!planLoading && !libLoading && !planError && !libError && WEEKDAYS.map(day => (
            <DayWorkout
              key={day}
              day={day}
              slots={slotsFor(day)}
              exercises={exercises}
              saving={planSaving}
              weekStart={weekStart}
              dayDone={dayCompletions.some(d => d.weekday === day && d.completed)}
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

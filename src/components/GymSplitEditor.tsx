import { useState } from 'react'
import { addExercise, deleteExercise } from '../lib/gymSplits'
import type { GymSplitEditorProps, NewExercise } from '../types'

const COLS = ['Exercise', 'Sets', 'Reps', 'Load', 'Muscles', 'Notes'] as const

const EMPTY_FORM: NewExercise = {
  name: '', sets: 3, reps: '', weight: '', muscles: '', notes: '',
}

// ─── Inline form for adding a new exercise ────────────────────────────────────

interface AddFormProps {
  onSave:   (ex: NewExercise) => Promise<void>
  onCancel: () => void
  saving:   boolean
}

function AddExerciseForm({ onSave, onCancel, saving }: AddFormProps) {
  const [form, setForm] = useState<NewExercise>(EMPTY_FORM)
  const [errors, setErrors] = useState<string[]>([])

  const field = (
    key: keyof NewExercise,
    label: string,
    type: 'text' | 'number' = 'text',
    placeholder = ''
  ) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {label}
      </label>
      <input
        type={type}
        value={form[key]}
        placeholder={placeholder}
        onChange={(e) =>
          setForm((prev) => ({
            ...prev,
            [key]: type === 'number' ? Number(e.target.value) : e.target.value,
          }))
        }
        style={{
          background: 'var(--surface-hover)',
          border: '1px solid var(--border-input)',
          borderRadius: 7,
          color: 'var(--text-primary)',
          fontSize: 13,
          padding: '7px 10px',
          outline: 'none',
          fontFamily: 'inherit',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />
    </div>
  )

  const handleSave = async () => {
    const errs: string[] = []
    if (!form.name.trim())   errs.push('Exercise name is required')
    if (form.sets < 1)       errs.push('Sets must be at least 1')
    if (!form.reps.trim())   errs.push('Reps is required')
    if (errs.length > 0) { setErrors(errs); return }
    setErrors([])
    await onSave(form)
    setForm(EMPTY_FORM)
  }

  return (
    <div style={{
      marginTop: 12,
      padding: '14px 16px',
      background: 'rgba(96,165,250,0.06)',
      border: '1px solid rgba(96,165,250,0.25)',
      borderRadius: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', marginBottom: 2 }}>
        ➕ Add Exercise
      </div>

      {errors.length > 0 && (
        <div style={{ fontSize: 12, color: 'var(--red)', lineHeight: 1.5 }}>
          {errors.map((e, i) => <div key={i}>⚠ {e}</div>)}
        </div>
      )}

      {/* 2-column grid for compact layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ gridColumn: '1 / -1' }}>{field('name',    'Exercise Name', 'text', 'e.g. Barbell Back Squat')}</div>
        {field('sets',    'Sets',    'number', '3')}
        {field('reps',    'Reps',    'text',   '8–10')}
        {field('weight',  'Load',    'text',   'RPE 7 or kg')}
        {field('muscles', 'Muscles', 'text',   'Quads, Glutes')}
        <div style={{ gridColumn: '1 / -1' }}>{field('notes', 'Coaching Notes', 'text', 'Optional tip…')}</div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '8px 18px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
            border: 'none',
            background: saving ? 'rgba(74,222,128,0.2)' : 'var(--green)',
            color: saving ? 'var(--green)' : 'var(--bg)',
            opacity: saving ? 0.7 : 1,
            transition: 'all 0.2s',
          }}
        >
          {saving ? 'Saving…' : 'Save Exercise'}
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text-muted)',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Main editor component ────────────────────────────────────────────────────

export default function GymSplitEditor({ splitName, gymSplits, onRefetch }: GymSplitEditorProps) {
  const [editMode,     setEditMode]     = useState(false)
  const [showAddForm,  setShowAddForm]  = useState(false)
  const [deletingId,   setDeletingId]   = useState<number | null>(null)
  const [savingNew,    setSavingNew]    = useState(false)

  // Strip modifier suffixes like "(–20% volume)" before lookup
  const baseKey = splitName.replace(/\s*\(.*?\)\s*/g, '').trim()
  const split   = gymSplits[baseKey] ?? gymSplits[splitName]

  if (!split) {
    return (
      <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
        No exercise data for: <em>{splitName}</em>
      </p>
    )
  }

  const handleDelete = async (exerciseId: number) => {
    if (!window.confirm('Remove this exercise?')) return
    setDeletingId(exerciseId)
    try {
      await deleteExercise(exerciseId)
      await onRefetch()
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Failed to delete exercise. Check console.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleAdd = async (newEx: NewExercise) => {
    setSavingNew(true)
    try {
      const nextOrder = split.exercises.length + 1
      await addExercise(split.id, nextOrder, newEx)
      await onRefetch()
      setShowAddForm(false)
    } catch (err) {
      console.error('Add failed:', err)
      alert('Failed to add exercise. Check console.')
    } finally {
      setSavingNew(false)
    }
  }

  return (
    <div>
      {/* Phase label + edit toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{split.phase}</span>
        <button
          onClick={() => { setEditMode((v) => !v); setShowAddForm(false) }}
          style={{
            padding: '4px 12px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            border: `1px solid ${editMode ? 'rgba(248,113,113,0.4)' : 'var(--border-input)'}`,
            background: editMode ? 'rgba(248,113,113,0.1)' : 'var(--surface)',
            color: editMode ? 'var(--red)' : 'var(--text-muted)',
            transition: 'all 0.15s',
          }}
        >
          {editMode ? '✕ Done editing' : '✏ Edit exercises'}
        </button>
      </div>

      {/* Exercise table */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ minWidth: editMode ? 600 : 580 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {COLS.map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left',
                    padding: '6px 8px',
                    color: 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
              {editMode && <th style={{ width: 36 }} />}
            </tr>
          </thead>
          <tbody>
            {split.exercises.map((ex) => {
              const isDeleting = deletingId === ex.id
              return (
                <tr
                  key={ex.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    opacity: isDeleting ? 0.4 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  <td style={{ padding: '9px 8px', color: 'var(--text-primary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{ex.name}</td>
                  <td style={{ padding: '9px 8px', color: 'var(--blue)', textAlign: 'center', fontWeight: 700 }}>{ex.sets}</td>
                  <td style={{ padding: '9px 8px', color: 'var(--green)', whiteSpace: 'nowrap' }}>{ex.reps}</td>
                  <td style={{ padding: '9px 8px', color: 'var(--amber)', fontSize: 11 }}>{ex.weight}</td>
                  <td style={{ padding: '9px 8px', color: 'var(--text-secondary)', fontSize: 11 }}>{ex.muscles}</td>
                  <td style={{ padding: '9px 8px', color: 'var(--text-muted)', fontSize: 11, fontStyle: 'italic' }}>{ex.notes}</td>
                  {editMode && (
                    <td style={{ padding: '6px 4px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDelete(ex.id)}
                        disabled={isDeleting}
                        title="Remove exercise"
                        style={{
                          background: 'rgba(248,113,113,0.12)',
                          border: '1px solid rgba(248,113,113,0.3)',
                          borderRadius: 6,
                          color: 'var(--red)',
                          fontSize: 14,
                          width: 28,
                          height: 28,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: isDeleting ? 'not-allowed' : 'pointer',
                          flexShrink: 0,
                        }}
                      >
                        {isDeleting ? '…' : '🗑'}
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}

            {split.exercises.length === 0 && (
              <tr>
                <td
                  colSpan={editMode ? 7 : 6}
                  style={{ padding: '20px 8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}
                >
                  No exercises yet. Add one below.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add exercise section (edit mode only) */}
      {editMode && (
        <div style={{ marginTop: 12 }}>
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                border: '1px dashed rgba(74,222,128,0.4)',
                background: 'rgba(74,222,128,0.05)',
                color: 'var(--green)',
                width: '100%',
                justifyContent: 'center',
              }}
            >
              ➕ Add Exercise
            </button>
          ) : (
            <AddExerciseForm
              onSave={handleAdd}
              onCancel={() => setShowAddForm(false)}
              saving={savingNew}
            />
          )}
        </div>
      )}
    </div>
  )
}

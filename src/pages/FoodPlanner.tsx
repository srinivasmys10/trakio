import { useState, useRef, type FormEvent } from 'react'
import WeekPicker, { formatWeekRange } from '../components/WeekPicker'
import { useMealPlans }   from '../hooks/useMealPlans'
import { useMealLibrary } from '../hooks/useMealLibrary'
import Card         from '../components/Card'
import {
  WEEKDAYS, MEAL_TYPES, MEAL_LABELS,
  type MealPlanSlot, type MealLibraryItem,
  type NewMealLibraryItem, type NewLibraryIngredient,
  type MealType, type Weekday,
} from '../types'

// ─── Style helpers ────────────────────────────────────────────────────────────

const fieldSt = (): React.CSSProperties => ({
  background: 'var(--bg-input)', border: '1px solid var(--border-input)',
  borderRadius: 8, color: 'var(--text-primary)', fontSize: 13,
  padding: '9px 12px', outline: 'none', fontFamily: 'inherit',
  width: '100%', boxSizing: 'border-box',
})

function Lbl({ children }: { children: React.ReactNode }) {
  return <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, display: 'block' }}>{children}</label>
}

// ─── Week utils ───────────────────────────────────────────────────────────────

/** Format Date as local "YYYY-MM-DD" — never UTC */
function localISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function addWeeks(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d + n * 7)   // local date arithmetic
  return localISO(date)
}

function currentMondayISO(): string {
  const d   = new Date()
  const dow = d.getDay()
  const diff = dow === 0 ? -6 : 1 - dow
  return localISO(new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff))
}

const _DOW: Record<string, number> = { Monday:0,Tuesday:1,Wednesday:2,Thursday:3,Friday:4,Saturday:5,Sunday:6 }
const _MO  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function dayDate(weekStart: string, weekday: string): string {
  const [y,m,d] = weekStart.split('-').map(Number)
  const dt = new Date(y, m-1, d + (_DOW[weekday] ?? 0))
  return `${dt.getDate()} ${_MO[dt.getMonth()]}`
}
// formatWeekRange imported from WeekPicker

// ─── Ingredient editor ────────────────────────────────────────────────────────

interface IngRow { name: string; quantity: string }

function IngEditor({ rows, onChange, onAdd, onRemove }: { rows: IngRow[]; onChange: (i: number, f: keyof IngRow, v: string) => void; onAdd: () => void; onRemove: (i: number) => void }) {
  return (
    <div>
      <Lbl>Ingredients</Lbl>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
          <input type="text" value={r.name} placeholder="Ingredient" onChange={e => onChange(i, 'name', e.target.value)} style={{ ...fieldSt(), flex: 2 }} />
          <input type="text" value={r.quantity} placeholder="Qty" onChange={e => onChange(i, 'quantity', e.target.value)} style={{ ...fieldSt(), flex: 1 }} />
          <button type="button" onClick={() => onRemove(i)} style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 6, color: 'var(--red)', width: 30, height: 30, flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>x</button>
        </div>
      ))}
      <button type="button" onClick={onAdd} style={{ background: 'transparent', border: '1px dashed rgba(96,165,250,0.4)', borderRadius: 7, color: 'var(--blue)', fontSize: 12, fontWeight: 600, padding: '5px 12px', cursor: 'pointer', marginTop: 2 }}>+ Add ingredient</button>
    </div>
  )
}

// ─── Library Meal Form ────────────────────────────────────────────────────────

function LibraryMealForm({ initial, saving, onSave, onCancel }: { initial?: MealLibraryItem; saving: boolean; onSave: (item: NewMealLibraryItem, ings: NewLibraryIngredient[]) => Promise<void>; onCancel: () => void }) {
  const [name, setName]               = useState(initial?.name        ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [notes, setNotes]             = useState(initial?.notes       ?? '')
  const [mealType, setMealType]       = useState<MealType>(initial?.meal_type ?? 'lunch')
  const [ings, setIngs]               = useState<IngRow[]>(
    initial?.ingredients.length ? initial.ingredients.map(i => ({ name: i.name, quantity: i.quantity })) : [{ name: '', quantity: '' }]
  )
  const [err, setErr] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setErr('Name required'); return }
    setErr('')
    await onSave(
      { name: name.trim(), description: description.trim(), notes: notes.trim(), meal_type: mealType, sort_order: initial?.sort_order ?? 99 },
      ings.filter(r => r.name.trim()).map((r, i) => ({ name: r.name.trim(), quantity: r.quantity.trim(), sort_order: i + 1 }))
    )
  }

  const selBtn = (active: boolean, color: string): React.CSSProperties => ({
    padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
    border: `1.5px solid ${active ? color : 'var(--border)'}`,
    background: active ? `${color}22` : 'var(--bg-input)',
    color: active ? color : 'var(--text-muted)',
  })

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <Lbl>Meal Type</Lbl>
        <div style={{ display: 'flex', gap: 6 }}>
          {MEAL_TYPES.map(mt => {
            const m = MEAL_LABELS[mt]
            return <button key={mt} type="button" onClick={() => setMealType(mt)} style={selBtn(mealType === mt, m.color)}>{m.icon} {m.label}</button>
          })}
        </div>
      </div>
      <div><Lbl>Meal Name *</Lbl><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Paneer Tikka Wrap" style={fieldSt()} /></div>
      <div><Lbl>Description</Lbl><textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="How it's made, flavour profile..." style={{ ...fieldSt(), minHeight: 60, resize: 'vertical' }} /></div>
      <IngEditor rows={ings} onChange={(i, f, v) => setIngs(p => p.map((r, idx) => idx === i ? { ...r, [f]: v } : r))} onAdd={() => setIngs(p => [...p, { name: '', quantity: '' }])} onRemove={i => setIngs(p => p.filter((_, idx) => idx !== i))} />
      <div><Lbl>Notes / Tips</Lbl><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Prep tips, substitutions, macros..." style={{ ...fieldSt(), minHeight: 50, resize: 'vertical' }} /></div>
      {err && <div style={{ fontSize: 12, color: 'var(--red)' }}>Warning: {err}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" disabled={saving} style={{ flex: 1, padding: '10px 0', borderRadius: 9, fontSize: 13, fontWeight: 700, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', background: saving ? 'rgba(74,222,128,0.15)' : 'var(--green)', color: 'var(--bg)' }}>
          {saving ? 'Saving...' : initial ? 'Update Meal' : 'Add to Library'}
        </button>
        <button type="button" onClick={onCancel} style={{ padding: '10px 14px', borderRadius: 9, fontSize: 13, fontWeight: 600, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
      </div>
    </form>
  )
}

// ─── Library Panel ────────────────────────────────────────────────────────────

function LibraryPanel({ library, saving, onAdd, onUpdate, onDelete }: { library: MealLibraryItem[]; saving: boolean; onAdd: (i: NewMealLibraryItem, ings: NewLibraryIngredient[]) => Promise<void>; onUpdate: (id: number, i: Partial<NewMealLibraryItem>, ings: NewLibraryIngredient[]) => Promise<void>; onDelete: (id: number) => Promise<void> }) {
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<MealLibraryItem | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [filterMt, setFilterMt] = useState<MealType | 'all'>('all')

  const visible = filterMt === 'all' ? library : library.filter(m => m.meal_type === filterMt)

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        {(['all', ...MEAL_TYPES] as const).map(mt => {
          const active = filterMt === mt
          const color  = mt === 'all' ? 'var(--text-secondary)' : MEAL_LABELS[mt].color
          return (
            <button key={mt} onClick={() => setFilterMt(mt)} style={{ padding: '4px 10px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', border: `1.5px solid ${active ? color : 'var(--border)'}`, background: active ? `${color}18` : 'var(--surface)', color: active ? color : 'var(--text-muted)' }}>
              {mt === 'all' ? 'All' : `${MEAL_LABELS[mt].icon} ${MEAL_LABELS[mt].label}`}
            </button>
          )
        })}
        <button onClick={() => { setShowForm(true); setEditItem(null) }} style={{ marginLeft: 'auto', padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 700, border: '1px solid rgba(74,222,128,0.4)', background: 'rgba(74,222,128,0.08)', color: 'var(--green)', cursor: 'pointer', fontFamily: 'inherit' }}>+ New Meal</button>
      </div>

      {(showForm || editItem) && (
        <Card style={{ marginBottom: 14, borderColor: editItem ? 'rgba(96,165,250,0.3)' : 'rgba(74,222,128,0.3)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: editItem ? 'var(--blue)' : 'var(--green)', marginBottom: 12 }}>
            {editItem ? `Edit: ${editItem.name}` : 'New Meal'}
          </div>
          <LibraryMealForm
            initial={editItem ?? undefined} saving={saving}
            onSave={async (item, ings) => {
              if (editItem) await onUpdate(editItem.id, item, ings)
              else await onAdd(item, ings)
              setShowForm(false); setEditItem(null)
            }}
            onCancel={() => { setShowForm(false); setEditItem(null) }}
          />
        </Card>
      )}

      {visible.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-muted)', fontSize: 13 }}>No meals yet. Add one above.</div>
      )}

      {visible.map(meal => {
        const m    = MEAL_LABELS[meal.meal_type]
        const open = expanded === meal.id
        return (
          <div key={meal.id} style={{ background: m.bg, border: `1px solid ${m.border}`, borderRadius: 10, marginBottom: 8, overflow: 'hidden' }}>
            <div onClick={() => setExpanded(open ? null : meal.id)} style={{ padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>{m.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meal.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{meal.ingredients.length} ingredients</div>
              </div>
              <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                <button onClick={e => { e.stopPropagation(); setEditItem(meal); setShowForm(false) }} style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: 6, color: 'var(--blue)', fontSize: 11, padding: '3px 8px', cursor: 'pointer' }}>Edit</button>
                <button onClick={async e => { e.stopPropagation(); if (window.confirm(`Remove "${meal.name}"? This clears it from the week plan too.`)) await onDelete(meal.id) }} style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 6, color: 'var(--red)', fontSize: 11, padding: '3px 8px', cursor: 'pointer' }}>Del</button>
                <span style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: '24px' }}>{open ? 'v' : '>'}</span>
              </div>
            </div>
            {open && (
              <div style={{ borderTop: `1px solid ${m.border}`, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {meal.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{meal.description}</p>}
                {meal.ingredients.length > 0 && (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Ingredients</div>
                    {meal.ingredients.map(ing => (
                      <div key={ing.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3 }}>
                        <span style={{ color: 'var(--text-primary)' }}>{ing.name}</span>
                        {ing.quantity && <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{ing.quantity}</span>}
                      </div>
                    ))}
                  </div>
                )}
                {meal.notes && <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.5 }}>{meal.notes}</p>}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Slot Card ────────────────────────────────────────────────────────────────

function SlotCard({ slot, weekday, mealType, library, saving, onAssign, onRemove }: { slot: MealPlanSlot | undefined; weekday: Weekday; mealType: MealType; library: MealLibraryItem[]; saving: boolean; onAssign: (mealId: number) => Promise<void>; onRemove: () => Promise<void> }) {
  const m          = MEAL_LABELS[mealType]
  const compatible = library.filter(l => l.meal_type === mealType)
  const [open, setOpen] = useState(false)

  if (slot) {
    return (
      <div style={{ background: m.bg, border: `1px solid ${m.border}`, borderRadius: 9, padding: '10px 12px', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{m.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{slot.meal.name}</div>
            {slot.meal.description && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>{slot.meal.description.slice(0, 80)}{slot.meal.description.length > 80 ? '...' : ''}</div>}
            {slot.meal.ingredients.length > 0 && (
              <div style={{ fontSize: 10, color: m.color, marginTop: 4, fontWeight: 600 }}>
                {slot.meal.ingredients.slice(0, 3).map(i => i.name).join(' · ')}{slot.meal.ingredients.length > 3 ? ` +${slot.meal.ingredients.length - 3} more` : ''}
              </div>
            )}
          </div>
          <button onClick={() => onRemove()} disabled={saving} style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 6, color: 'var(--red)', fontSize: 13, width: 26, height: 26, flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>x</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ marginBottom: 6 }}>
      {!open ? (
        <button onClick={() => setOpen(true)} disabled={compatible.length === 0} style={{ width: '100%', padding: '8px 12px', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: compatible.length > 0 ? 'pointer' : 'not-allowed', textAlign: 'left', border: `1.5px dashed ${compatible.length > 0 ? m.border : 'var(--border)'}`, background: compatible.length > 0 ? m.bg : 'transparent', color: compatible.length > 0 ? m.color : 'var(--text-muted)', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>{m.icon}</span>
          {compatible.length > 0 ? `+ Add ${m.label}` : `No ${m.label} meals in library yet`}
        </button>
      ) : (
        <div style={{ background: m.bg, border: `1px solid ${m.border}`, borderRadius: 9, padding: '10px 12px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: m.color, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Choose {m.label}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {compatible.map(lib => (
              <button key={lib.id} onClick={async () => { await onAssign(lib.id); setOpen(false) }} disabled={saving} style={{ padding: '8px 10px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'left', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'inherit' }}>
                <div style={{ fontWeight: 700 }}>{lib.name}</div>
                {lib.ingredients.length > 0 && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{lib.ingredients.slice(0, 3).map(i => i.name).join(' · ')}</div>}
              </button>
            ))}
          </div>
          <button onClick={() => setOpen(false)} style={{ marginTop: 8, background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }}>Cancel</button>
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function FoodPlanner() {
  const [weekStart, setWeekStart]   = useState(currentMondayISO)
  const [tab, setTab]               = useState<'plan' | 'library'>('plan')
  const [showPicker, setShowPicker] = useState(false)
  const pickerAnchorRef             = useRef<HTMLDivElement>(null)

  const { slots, loading: planLoading, error: planError, saving: planSaving, assign, remove } = useMealPlans(weekStart)
  const { library, loading: libLoading, error: libError, saving: libSaving, addMeal, updateMeal, deleteMeal } = useMealLibrary()

  const slotFor = (day: Weekday, mt: MealType) => slots.find(s => s.weekday === day && s.meal_type === mt)
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/meals` : '/meals'

  return (
    <div className="fade-in">
      {/* Share banner */}
      <div style={{ background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <span style={{ fontSize: 16 }}>Link</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', marginBottom: 1 }}>Shared meal plan</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shareUrl}</div>
        </div>
        <button onClick={() => navigator.clipboard?.writeText(shareUrl)} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.3)', color: 'var(--blue)', cursor: 'pointer' }}>Copy</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: 10, padding: 3, marginBottom: 18 }}>
        {(['plan', 'library'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'inherit', background: tab === t ? 'var(--bg-header)' : 'transparent', color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.12)' : 'none' }}>
            {t === 'plan' ? 'Week Plan' : 'Meal Library'}
          </button>
        ))}
      </div>

      {/* Week Plan tab */}
      {tab === 'plan' && (
        <>
          {/* ── Week navigator with calendar picker ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <button
              onClick={() => setWeekStart(w => addWeeks(w, -1))}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)', padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}
            >&#8592;</button>

            {/* Clickable date range → opens calendar picker */}
            <div ref={pickerAnchorRef} style={{ position: 'relative', textAlign: 'center' }}>
              <button
                onClick={() => setShowPicker(v => !v)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }}
              >
                <div style={{
                  fontSize: 14, fontWeight: 700, color: 'var(--text-primary)',
                  display: 'flex', alignItems: 'center', gap: 6,
                  borderBottom: showPicker ? '1.5px solid var(--blue)' : '1.5px solid transparent',
                  paddingBottom: 2, transition: 'border-color 0.2s',
                }}>
                  <span style={{ fontSize: 13 }}>&#128197;</span>
                  {formatWeekRange(weekStart)}
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{showPicker ? '▲' : '▼'}</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                  {slots.length} meal{slots.length !== 1 ? 's' : ''} planned · click to jump
                </div>
              </button>

              {showPicker && (
                <WeekPicker
                  value={weekStart}
                  onChange={iso => { setWeekStart(iso); setShowPicker(false) }}
                  onClose={() => setShowPicker(false)}
                />
              )}
            </div>

            <button
              onClick={() => setWeekStart(w => addWeeks(w, 1))}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)', padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}
            >&#8594;</button>
          </div>

          {(planLoading || libLoading) && <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>Loading...</div>}
          {(planError || libError) && <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: 14, fontSize: 13, color: 'var(--red)', marginBottom: 14 }}>{planError ?? libError}</div>}

          {!planLoading && !libLoading && !planError && !libError && WEEKDAYS.map(day => (
            <div key={day} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>{day}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{dayDate(weekStart, day)}</div>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>
              {MEAL_TYPES.map(mt => (
                <SlotCard
                  key={mt}
                  slot={slotFor(day, mt)}
                  weekday={day} mealType={mt}
                  library={library} saving={planSaving}
                  onAssign={async mealId => { await assign({ week_start: weekStart, weekday: day, meal_type: mt, meal_id: mealId, notes: '' }) }}
                  onRemove={async () => { const s = slotFor(day, mt); if (s) await remove(s.id) }}
                />
              ))}
            </div>
          ))}
        </>
      )}

      {/* Library tab */}
      {tab === 'library' && (
        <>
          {libLoading && <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>Loading library...</div>}
          {libError && <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: 14, fontSize: 13, color: 'var(--red)', marginBottom: 14 }}>{libError}</div>}
          {!libLoading && <LibraryPanel library={library} saving={libSaving} onAdd={addMeal} onUpdate={updateMeal} onDelete={deleteMeal} />}
        </>
      )}
    </div>
  )
}

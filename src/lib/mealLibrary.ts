/**
 * Meal Library — global, shared by all users, no auth required.
 * Backed by the `meal_library` and `meal_library_ingredients` Supabase tables.
 */
import { supabase } from './supabase'
import type {
  MealLibraryItem, NewMealLibraryItem,
  LibraryIngredient, NewLibraryIngredient,
} from '../types'

// ─── DB row shapes ────────────────────────────────────────────────────────────

interface LibraryRow {
  id:          number
  name:        string
  description: string
  notes:       string
  meal_type:   string
  sort_order:  number
  created_at:  string
  meal_library_ingredients: {
    id:         number
    meal_id:    number
    name:       string
    quantity:   string
    sort_order: number
  }[]
}

function rowToItem(row: LibraryRow): MealLibraryItem {
  return {
    id:          row.id,
    name:        row.name,
    description: row.description,
    notes:       row.notes,
    meal_type:   row.meal_type as MealLibraryItem['meal_type'],
    sort_order:  row.sort_order,
    created_at:  row.created_at,
    ingredients: [...(row.meal_library_ingredients ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((i): LibraryIngredient => ({
        id:         i.id,
        meal_id:    i.meal_id,
        name:       i.name,
        quantity:   i.quantity,
        sort_order: i.sort_order,
      })),
  }
}

// ─── In-memory cache (cleared after mutations) ────────────────────────────────

let _cache: MealLibraryItem[] | null = null
let _inflight: Promise<MealLibraryItem[]> | null = null

export function clearLibraryCache() {
  _cache = null
  _inflight = null
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function loadMealLibrary(): Promise<MealLibraryItem[]> {
  if (_cache) return _cache
  if (_inflight) return _inflight

  _inflight = (async () => {
    const { data, error } = await supabase
      .from('meal_library')
      .select(`
        id, name, description, notes, meal_type, sort_order, created_at,
        meal_library_ingredients ( id, meal_id, name, quantity, sort_order )
      `)
      .order('meal_type')
      .order('sort_order')

    if (error) throw error
    _cache = ((data ?? []) as unknown as LibraryRow[]).map(rowToItem)
    _inflight = null
    return _cache
  })()

  return _inflight
}

// ─── Create library meal ──────────────────────────────────────────────────────

export async function addLibraryMeal(
  item:        NewMealLibraryItem,
  ingredients: NewLibraryIngredient[]
): Promise<MealLibraryItem> {
  const { data: row, error: rowErr } = await supabase
    .from('meal_library')
    .insert({
      name:        item.name,
      description: item.description,
      notes:       item.notes,
      meal_type:   item.meal_type,
      sort_order:  item.sort_order,
    })
    .select('id')
    .single()

  if (rowErr) throw rowErr
  const mealId = (row as { id: number }).id

  if (ingredients.length > 0) {
    const { error: ingErr } = await supabase
      .from('meal_library_ingredients')
      .insert(
        ingredients.map((ing, i) => ({
          meal_id:    mealId,
          name:       ing.name,
          quantity:   ing.quantity,
          sort_order: i + 1,
        }))
      )
    if (ingErr) throw ingErr
  }

  clearLibraryCache()
  const all = await loadMealLibrary()
  const created = all.find(m => m.id === mealId)
  if (!created) throw new Error('Meal not found after insert')
  return created
}

// ─── Update library meal ──────────────────────────────────────────────────────

export async function updateLibraryMeal(
  id:          number,
  item:        Partial<NewMealLibraryItem>,
  ingredients: NewLibraryIngredient[]
): Promise<void> {
  const { error: updErr } = await supabase
    .from('meal_library')
    .update({ ...item })
    .eq('id', id)

  if (updErr) throw updErr

  // Full replace of ingredients
  await supabase.from('meal_library_ingredients').delete().eq('meal_id', id)

  if (ingredients.length > 0) {
    const { error: ingErr } = await supabase
      .from('meal_library_ingredients')
      .insert(ingredients.map((ing, i) => ({ meal_id: id, name: ing.name, quantity: ing.quantity, sort_order: i + 1 })))
    if (ingErr) throw ingErr
  }

  clearLibraryCache()
}

// ─── Delete library meal ──────────────────────────────────────────────────────

export async function deleteLibraryMeal(id: number): Promise<void> {
  // Deleting the library meal will cascade-delete any meal_plans that reference it
  const { error } = await supabase.from('meal_library').delete().eq('id', id)
  if (error) throw error
  clearLibraryCache()
}

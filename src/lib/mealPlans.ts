/**
 * Weekly Meal Plan — global, shared by everyone, no auth/session required.
 * Each slot is a (week_start, weekday, meal_type) cell pointing to a library meal.
 */
import { supabase } from './supabase'
import type { MealPlanSlot, NewMealPlanSlot, MealLibraryItem, LibraryIngredient } from '../types'

// ─── DB row shapes ────────────────────────────────────────────────────────────

interface PlanRow {
  id:         number
  week_start: string
  weekday:    string
  meal_type:  string
  meal_id:    number
  notes:      string
  created_at: string
  meal_library: {
    id:          number
    name:        string
    description: string
    notes:       string
    meal_type:   string
    sort_order:  number
    created_at:  string
    meal_library_ingredients: {
      id: number; meal_id: number; name: string; quantity: string; sort_order: number
    }[]
  }
}

function rowToSlot(row: PlanRow): MealPlanSlot {
  const lib = row.meal_library
  const meal: MealLibraryItem = {
    id:          lib.id,
    name:        lib.name,
    description: lib.description,
    notes:       lib.notes,
    meal_type:   lib.meal_type   as MealLibraryItem['meal_type'],
    sort_order:  lib.sort_order,
    created_at:  lib.created_at,
    ingredients: [...(lib.meal_library_ingredients ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((i): LibraryIngredient => ({
        id: i.id, meal_id: i.meal_id, name: i.name, quantity: i.quantity, sort_order: i.sort_order,
      })),
  }
  return {
    id:         row.id,
    week_start: row.week_start,
    weekday:    row.weekday   as MealPlanSlot['weekday'],
    meal_type:  row.meal_type as MealPlanSlot['meal_type'],
    meal_id:    row.meal_id,
    notes:      row.notes,
    created_at: row.created_at,
    meal,
  }
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function loadWeekPlan(weekStart: string): Promise<MealPlanSlot[]> {
  const { data, error } = await supabase
    .from('meal_plans')
    .select(`
      id, week_start, weekday, meal_type, meal_id, notes, created_at,
      meal_library (
        id, name, description, notes, meal_type, sort_order, created_at,
        meal_library_ingredients ( id, meal_id, name, quantity, sort_order )
      )
    `)
    .eq('week_start', weekStart)
    .order('weekday')
    .order('meal_type')

  if (error) throw error
  return ((data ?? []) as unknown as PlanRow[]).map(rowToSlot)
}

// ─── Assign a meal to a slot ──────────────────────────────────────────────────

export async function assignMealToSlot(slot: NewMealPlanSlot): Promise<MealPlanSlot> {
  // Upsert: if this (week_start, weekday, meal_type) already has a meal, replace it
  const { data, error } = await supabase
    .from('meal_plans')
    .upsert(
      {
        week_start: slot.week_start,
        weekday:    slot.weekday,
        meal_type:  slot.meal_type,
        meal_id:    slot.meal_id,
        notes:      slot.notes,
      },
      { onConflict: 'week_start,weekday,meal_type' }
    )
    .select('id')
    .single()

  if (error) throw error
  const slots = await loadWeekPlan(slot.week_start)
  const created = slots.find(s => s.id === (data as { id: number }).id)
  if (!created) throw new Error('Slot not found after upsert')
  return created
}

// ─── Update slot note ─────────────────────────────────────────────────────────

export async function updateSlotNote(id: number, notes: string): Promise<void> {
  const { error } = await supabase.from('meal_plans').update({ notes }).eq('id', id)
  if (error) throw error
}

// ─── Remove a slot ────────────────────────────────────────────────────────────

export async function removeSlot(id: number): Promise<void> {
  const { error } = await supabase.from('meal_plans').delete().eq('id', id)
  if (error) throw error
}

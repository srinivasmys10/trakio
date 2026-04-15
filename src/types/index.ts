// ─── Plan data types ──────────────────────────────────────────────────────────

export interface Phase {
  id: number
  name: string
  weeks: number[]
  color: string
  desc: string
}

export interface RunSession {
  day: string
  type: string
  distance: number
  pace: string
  notes: string
}

export interface GymSession {
  day: string
  split: string
}

export interface Week {
  week: number
  phase: number
  focus: string
  runs: RunSession[]
  weeklyKm: number
  gym: GymSession[]
  tip: string
  deload?: boolean
  startDate: string
}

export interface Exercise {
  id: number
  name: string
  sets: number
  reps: string
  weight: string
  muscles: string
  notes: string
}

export type NewExercise = Omit<Exercise, 'id'>

export interface GymSplit {
  id: number
  phase: string
  exercises: Exercise[]
}

export interface MobilityItem {
  name: string
  duration: string
  timing: string
}

export interface NutritionTip {
  title: string
  detail: string
}

export interface PhaseColor {
  bg: string
  border: string
  text: string
}

// ─── Auth types ───────────────────────────────────────────────────────────────

export interface AuthUser {
  id:         string
  email?:     string | undefined
  name:       string | undefined  // from user_metadata.full_name (Google)
  avatarUrl:  string | undefined  // from user_metadata.avatar_url  (Google)
  provider:   string              // 'email' | 'google'
}

export interface AuthState {
  user:    AuthUser | null
  loading: boolean
}

// ─── App state types ──────────────────────────────────────────────────────────

export type Progress = Record<string, boolean | string>

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error'

export type NavId = 'dashboard' | 'plan' | 'gym' | 'recovery' | 'nutrition' | 'food' | 'workout'

export interface NavItem {
  id: NavId
  label: string
  icon: string
}

// ─── Component prop types ─────────────────────────────────────────────────────

export interface WeekCardProps {
  weekData: Week
  progress: Progress
  isActive: boolean
  onClick: (week: number) => void
}

export interface CheckBoxProps {
  checked: boolean
  onChange: () => void
}

export interface TagProps {
  children: React.ReactNode
  color?: string
  style?: React.CSSProperties
}

export interface CardProps {
  children: React.ReactNode
  style?: React.CSSProperties
  accent?: string
}

export interface SectionTitleProps {
  children: React.ReactNode
  style?: React.CSSProperties
}

export interface GymTableProps {
  splitName: string
  gymSplits: Record<string, GymSplit>
}

export interface GymSplitEditorProps {
  splitName:  string
  gymSplits:  Record<string, GymSplit>
  onRefetch:  () => Promise<void>
}

export interface DayPickerProps {
  currentDay: string
  onSelect:   (day: string) => void
  onCancel:   () => void
}

export interface GymPageProps {
  gymSplits:  Record<string, GymSplit>
  gymLoading: boolean
  gymError:   string | null
  onRefetch:  () => Promise<void>
}

export interface SyncDotProps {
  status: SyncStatus
}

export interface DashboardProps {
  progress: Progress
}

export interface PlanProps {
  progress:       Progress
  gymSplits:      Record<string, GymSplit>
  onToggle:       (key: string, value?: string, isText?: boolean) => void
  onSaveNote:     (weekNum: number, text: string) => Promise<void>
  onSaveSetting:  (key: string, value: string) => void
  onRefetch:      () => Promise<void>
}

export interface UserMenuProps {
  user:     AuthUser
  onSignOut: () => Promise<void>
}

export interface AuthGateProps {
  onAuthenticated: () => void
}


// ─── Theme ────────────────────────────────────────────────────────────────────

export type Theme = 'dark' | 'light'

// ─── Food Planner types ───────────────────────────────────────────────────────

export type MealType = 'lunch' | 'snack'

export const MEAL_TYPES: MealType[] = ['lunch', 'snack']

export const MEAL_LABELS: Record<MealType, { label: string; icon: string; color: string; border: string; bg: string }> = {
  lunch: { label: 'Lunch',  icon: '🥗', color: 'var(--blue)',   border: 'rgba(96,165,250,0.3)',  bg: 'rgba(96,165,250,0.07)'  },
  snack: { label: 'Snack',  icon: '🍎', color: 'var(--green)',  border: 'rgba(74,222,128,0.3)',  bg: 'rgba(74,222,128,0.07)'  },
}

export const WEEKDAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] as const
export type Weekday = typeof WEEKDAYS[number]

// ─── Meal Library ─────────────────────────────────────────────────────────────

export interface LibraryIngredient {
  id:         number
  meal_id:    number
  name:       string
  quantity:   string
  sort_order: number
}

export type NewLibraryIngredient = Omit<LibraryIngredient, 'id' | 'meal_id'>

export interface MealLibraryItem {
  id:          number
  name:        string
  description: string
  notes:       string
  meal_type:   MealType
  sort_order:  number
  created_at:  string
  ingredients: LibraryIngredient[]
}

export type NewMealLibraryItem = Omit<MealLibraryItem, 'id' | 'created_at' | 'ingredients'>

// ─── Weekly Meal Plan ─────────────────────────────────────────────────────────

export interface MealPlanSlot {
  id:         number
  week_start: string
  weekday:    Weekday
  meal_type:  MealType
  meal_id:    number             // FK → meal_library.id
  notes:      string             // per-slot override note
  created_at: string
  meal:       MealLibraryItem    // joined from meal_library
}

export type NewMealPlanSlot = Omit<MealPlanSlot, 'id' | 'created_at' | 'meal'>

// ─── Legacy (kept for trainer progress, do not remove) ───────────────────────

export interface Ingredient {
  id:          number
  meal_id:     number
  name:        string
  quantity:    string
  sort_order:  number
}

export type NewIngredient = Omit<Ingredient, 'id' | 'meal_id'>

export interface MealPlan {
  id:          number
  user_id:     string
  week_start:  string
  weekday:     Weekday
  meal_type:   MealType
  title:       string
  description: string
  notes:       string
  ingredients: Ingredient[]
  created_at:  string
}

export type NewMealPlan = Omit<MealPlan, 'id' | 'user_id' | 'created_at' | 'ingredients'>

// ─── Workout / Gym Planner types ──────────────────────────────────────────────

export type ExerciseType =
  | 'upper_body' | 'lower_body' | 'core' | 'cardio' | 'full_body' | 'flexibility' | 'other'

export const EXERCISE_TYPES: ExerciseType[] = [
  'upper_body','lower_body','core','cardio','full_body','flexibility','other',
]

export const EXERCISE_TYPE_LABELS: Record<ExerciseType, { label: string; icon: string; color: string; border: string; bg: string }> = {
  upper_body:  { label: 'Upper Body',  icon: '💪', color: 'var(--blue)',   border: 'rgba(96,165,250,0.35)',  bg: 'rgba(96,165,250,0.08)'  },
  lower_body:  { label: 'Lower Body',  icon: '🦵', color: 'var(--purple)', border: 'rgba(167,139,250,0.35)', bg: 'rgba(167,139,250,0.08)' },
  core:        { label: 'Core',        icon: '🎯', color: 'var(--amber)',  border: 'rgba(245,158,11,0.35)',  bg: 'rgba(245,158,11,0.08)'  },
  cardio:      { label: 'Cardio',      icon: '🏃', color: 'var(--red)',    border: 'rgba(248,113,113,0.35)', bg: 'rgba(248,113,113,0.08)' },
  full_body:   { label: 'Full Body',   icon: '⚡', color: 'var(--yellow)', border: 'rgba(250,204,21,0.35)',  bg: 'rgba(250,204,21,0.08)'  },
  flexibility: { label: 'Flexibility', icon: '🧘', color: 'var(--green)',  border: 'rgba(74,222,128,0.35)',  bg: 'rgba(74,222,128,0.08)'  },
  other:       { label: 'Other',       icon: '🏅', color: 'var(--text-muted)', border: 'var(--border)',     bg: 'var(--surface)'         },
}

export interface ExerciseLibraryItem {
  id:            number
  name:          string
  description:   string
  exercise_type: ExerciseType
  impact_areas:  string[]      // e.g. ['chest','triceps']
  default_sets:  number
  default_reps:  string        // e.g. "8-12" or "30 sec"
  audio_url:     string | null // Supabase Storage public URL
  sort_order:    number
  created_at:    string
}

export type NewExerciseLibraryItem = Omit<ExerciseLibraryItem, 'id' | 'created_at'>

export interface WorkoutSlot {
  id:           number
  user_id:      string
  week_start:   string
  weekday:      Weekday
  exercise_id:  number
  custom_sets:  number | null
  custom_reps:  string | null
  notes:        string
  sort_order:   number
  created_at:   string
  exercise:     ExerciseLibraryItem   // joined
}

export type NewWorkoutSlot = Omit<WorkoutSlot, 'id' | 'user_id' | 'created_at' | 'exercise'>

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
  /** ISO date string for the Monday that starts this week e.g. "2026-04-06" */
  startDate: string
}

export interface Exercise {
  name: string
  sets: number
  reps: string
  weight: string
  muscles: string
  notes: string
}

export interface GymSplit {
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

// ─── App state types ──────────────────────────────────────────────────────────

export type Progress = Record<string, boolean | string>

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error'

export type NavId = 'dashboard' | 'plan' | 'gym' | 'recovery' | 'nutrition'

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
}

export interface SyncDotProps {
  status: SyncStatus
}

export interface DashboardProps {
  progress: Progress
}

export interface PlanProps {
  progress: Progress
  onToggle: (key: string, value?: string, isText?: boolean) => void
  onSaveNote: (weekNum: number, text: string) => Promise<void>
}

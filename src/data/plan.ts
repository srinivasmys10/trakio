import { weekStartISO } from '../lib/dates'
import type {
  Phase, Week, GymSplit, MobilityItem,
  NutritionTip, PhaseColor,
} from '../types'

// ─── PHASES ──────────────────────────────────────────────────────────────────

export const PHASES: Phase[] = [
  { id: 1, name: 'Foundation', weeks: [1, 2, 3, 4], color: '#4ade80', desc: 'Build aerobic base & gym habits' },
  { id: 2, name: 'Development', weeks: [5, 6, 7, 8, 9], color: '#60a5fa', desc: 'Increase volume & introduce tempo' },
  { id: 3, name: 'Build', weeks: [10, 11, 12, 13], color: '#f59e0b', desc: 'Peak mileage, intervals & strength' },
  { id: 4, name: 'Taper & Race', weeks: [14, 15, 16, 17], color: '#f87171', desc: 'Reduce volume, sharpen & race' },
]

// ─── WEEKS (Week 1 = Mon 6 Apr 2026) ─────────────────────────────────────────

export const WEEKS: Week[] = [
  // ── Phase 1: Foundation ──────────────────────────────────────────────────
  {
    week: 1, phase: 1, startDate: weekStartISO(1),
    focus: 'Establish routine, easy aerobic base',
    runs: [
      { day: 'Mon', type: 'Easy', distance: 4, pace: '5:30–6:00', notes: 'Comfortable conversational pace' },
      { day: 'Wed', type: 'Easy', distance: 5, pace: '5:30–6:00', notes: 'Maintain current 5 km fitness' },
      { day: 'Sat', type: 'Long', distance: 6, pace: '5:45–6:15', notes: 'Run/walk if needed, keep HR low' },
    ],
    weeklyKm: 15,
    gym: [
      { day: 'Tue', split: 'Lower Body A' },
      { day: 'Thu', split: 'Upper Body A' },
      { day: 'Sun', split: 'Full Body / Core' },
    ],
    tip: "Don't run faster than easy pace this week. Let your body adapt.",
  },
  {
    week: 2, phase: 1, startDate: weekStartISO(2),
    focus: 'Consolidate base, introduce strides',
    runs: [
      { day: 'Mon', type: 'Easy', distance: 4, pace: '5:30–6:00', notes: 'Easy effort' },
      { day: 'Wed', type: 'Easy + Strides', distance: 5, pace: '5:20–5:40 w/ 4×100m strides', notes: 'Strides at 5:00 pace, walk back' },
      { day: 'Sat', type: 'Long', distance: 7, pace: '5:45–6:15', notes: 'Slow and steady' },
    ],
    weeklyKm: 16,
    gym: [
      { day: 'Tue', split: 'Lower Body A' },
      { day: 'Thu', split: 'Upper Body A' },
      { day: 'Sun', split: 'Full Body / Core' },
    ],
    tip: 'Strides build neuromuscular speed without fatigue. Stay relaxed.',
  },
  {
    week: 3, phase: 1, startDate: weekStartISO(3),
    focus: 'Increase long run, build confidence',
    runs: [
      { day: 'Mon', type: 'Easy', distance: 5, pace: '5:30–6:00', notes: '' },
      { day: 'Wed', type: 'Easy + Strides', distance: 5, pace: '5:20–5:40 w/ 4×100m strides', notes: '' },
      { day: 'Sat', type: 'Long', distance: 8, pace: '5:45–6:15', notes: 'Bring water, keep HR Zone 2' },
    ],
    weeklyKm: 18,
    gym: [
      { day: 'Tue', split: 'Lower Body A' },
      { day: 'Thu', split: 'Upper Body A' },
      { day: 'Sun', split: 'Full Body / Core' },
    ],
    tip: "If your long run pace drifts above 6:15 that's fine — it's about time on feet.",
  },
  {
    week: 4, phase: 1, deload: true, startDate: weekStartISO(4),
    focus: 'DELOAD — Recover & absorb training',
    runs: [
      { day: 'Mon', type: 'Easy', distance: 4, pace: '5:30–6:00', notes: 'Very easy, legs should feel fresh' },
      { day: 'Wed', type: 'Easy', distance: 4, pace: '5:30–6:00', notes: '' },
      { day: 'Sat', type: 'Long', distance: 6, pace: '5:45–6:15', notes: 'Cut back week — enjoy it' },
    ],
    weeklyKm: 14,
    gym: [
      { day: 'Tue', split: 'Lower Body A (–20% volume)' },
      { day: 'Thu', split: 'Upper Body A (–20% volume)' },
      { day: 'Sun', split: 'Mobility & Core only' },
    ],
    tip: 'Deload weeks are where fitness is gained. Sleep more, stress less.',
  },
  // ── Phase 2: Development ─────────────────────────────────────────────────
  {
    week: 5, phase: 2, startDate: weekStartISO(5),
    focus: 'Introduce tempo running',
    runs: [
      { day: 'Mon', type: 'Easy', distance: 5, pace: '5:30–6:00', notes: '' },
      { day: 'Wed', type: 'Tempo', distance: 6, pace: '5:00–5:10 for 3 km', notes: '2 km easy warm up, 3 km tempo, 1 km cool down' },
      { day: 'Sat', type: 'Long', distance: 9, pace: '5:45–6:15', notes: '' },
    ],
    weeklyKm: 20,
    gym: [
      { day: 'Tue', split: 'Lower Body B' },
      { day: 'Thu', split: 'Upper Body B' },
      { day: 'Sun', split: 'Full Body / Core' },
    ],
    tip: "Tempo pace should feel 'comfortably hard' — you can speak 3–4 words at a time.",
  },
  {
    week: 6, phase: 2, startDate: weekStartISO(6),
    focus: 'Build tempo & long run',
    runs: [
      { day: 'Mon', type: 'Easy', distance: 5, pace: '5:30–6:00', notes: '' },
      { day: 'Wed', type: 'Tempo', distance: 7, pace: '5:00–5:10 for 4 km', notes: '2 km easy, 4 km tempo, 1 km cool' },
      { day: 'Sat', type: 'Long', distance: 10, pace: '5:45–6:15', notes: 'First double-digit run!' },
    ],
    weeklyKm: 22,
    gym: [
      { day: 'Tue', split: 'Lower Body B' },
      { day: 'Thu', split: 'Upper Body B' },
      { day: 'Sun', split: 'Full Body / Core' },
    ],
    tip: 'Celebrate the 10 km long run. Your aerobic system is adapting rapidly.',
  },
  {
    week: 7, phase: 2, startDate: weekStartISO(7),
    focus: 'Add 4th run (recovery run)',
    runs: [
      { day: 'Mon', type: 'Easy', distance: 5, pace: '5:30–6:00', notes: '' },
      { day: 'Wed', type: 'Tempo', distance: 7, pace: '5:00–5:10 for 4 km', notes: '' },
      { day: 'Fri', type: 'Recovery', distance: 4, pace: '6:00–6:30', notes: 'Very easy shake-out' },
      { day: 'Sat', type: 'Long', distance: 11, pace: '5:45–6:15', notes: '' },
    ],
    weeklyKm: 27,
    gym: [
      { day: 'Tue', split: 'Lower Body B' },
      { day: 'Thu', split: 'Upper Body B' },
      { day: 'Sun', split: 'Full Body / Core' },
    ],
    tip: 'Recovery runs should feel embarrassingly easy. Protect your long run.',
  },
  {
    week: 8, phase: 2, deload: true, startDate: weekStartISO(8),
    focus: 'DELOAD — Mid-programme recovery',
    runs: [
      { day: 'Mon', type: 'Easy', distance: 4, pace: '5:30–6:00', notes: '' },
      { day: 'Wed', type: 'Easy Tempo', distance: 5, pace: '5:10–5:20 for 2 km only', notes: 'Short tempo, mostly easy' },
      { day: 'Sat', type: 'Long', distance: 8, pace: '5:45–6:15', notes: 'Pull back on distance' },
    ],
    weeklyKm: 17,
    gym: [
      { day: 'Tue', split: 'Lower Body B (–20%)' },
      { day: 'Thu', split: 'Upper Body B (–20%)' },
      { day: 'Sun', split: 'Mobility & Core' },
    ],
    tip: "You're halfway there. Trust the process — easy weeks build champions.",
  },
  {
    week: 9, phase: 2, startDate: weekStartISO(9),
    focus: 'Introduce interval training',
    runs: [
      { day: 'Mon', type: 'Easy', distance: 5, pace: '5:30–6:00', notes: '' },
      { day: 'Wed', type: 'Intervals', distance: 7, pace: '5×1 km @ 4:40–4:50 w/ 90s jog rest', notes: 'Warm up 2 km, 5×1 km hard, cool 1 km' },
      { day: 'Fri', type: 'Recovery', distance: 4, pace: '6:00–6:30', notes: '' },
      { day: 'Sat', type: 'Long', distance: 11, pace: '5:45–6:15', notes: '' },
    ],
    weeklyKm: 27,
    gym: [
      { day: 'Tue', split: 'Lower Body B' },
      { day: 'Thu', split: 'Upper Body B' },
      { day: 'Sun', split: 'Full Body / Core' },
    ],
    tip: 'Interval pace should feel hard but controlled — RPE 8/10. Not a sprint.',
  },
  // ── Phase 3: Build ───────────────────────────────────────────────────────
  {
    week: 10, phase: 3, startDate: weekStartISO(10),
    focus: 'Peak volume week begins',
    runs: [
      { day: 'Mon', type: 'Easy', distance: 6, pace: '5:30–6:00', notes: '' },
      { day: 'Wed', type: 'Intervals', distance: 8, pace: '6×1 km @ 4:40–4:50 w/ 90s rest', notes: '' },
      { day: 'Fri', type: 'Recovery', distance: 4, pace: '6:00–6:30', notes: '' },
      { day: 'Sat', type: 'Long', distance: 12, pace: '5:45–6:15', notes: 'Longest run yet — nutrition matters' },
    ],
    weeklyKm: 30,
    gym: [
      { day: 'Tue', split: 'Lower Body C (Heavy)' },
      { day: 'Thu', split: 'Upper Body C (Heavy)' },
      { day: 'Sun', split: 'Full Body / Core' },
    ],
    tip: 'Fuel your long run with a banana or dates at km 7–8. Practice race nutrition.',
  },
  {
    week: 11, phase: 3, startDate: weekStartISO(11),
    focus: 'Combine tempo & intervals in same week',
    runs: [
      { day: 'Mon', type: 'Easy', distance: 6, pace: '5:30–6:00', notes: '' },
      { day: 'Tue', type: 'Tempo', distance: 8, pace: '5:00–5:10 for 5 km', notes: '2 km warm, 5 km tempo, 1 km cool' },
      { day: 'Thu', type: 'Recovery', distance: 4, pace: '6:00–6:30', notes: '' },
      { day: 'Sat', type: 'Long', distance: 13, pace: '5:45–6:15', notes: 'Almost race distance!' },
    ],
    weeklyKm: 31,
    gym: [
      { day: 'Wed', split: 'Lower Body C (Heavy)' },
      { day: 'Fri', split: 'Upper Body C (Heavy)' },
      { day: 'Sun', split: 'Full Body / Core' },
    ],
    tip: '13 km long run is the confidence builder. If you hit this, 14 km on race day is yours.',
  },
  {
    week: 12, phase: 3, startDate: weekStartISO(12),
    focus: 'Maintain peak, add race-pace work',
    runs: [
      { day: 'Mon', type: 'Easy', distance: 6, pace: '5:30–6:00', notes: '' },
      { day: 'Wed', type: 'Race Pace', distance: 8, pace: '5:00 for middle 4 km', notes: 'Easy, then 4 km at goal 5:00, then easy' },
      { day: 'Fri', type: 'Recovery', distance: 4, pace: '6:00–6:30', notes: '' },
      { day: 'Sat', type: 'Long', distance: 13, pace: '5:45–6:15', notes: '' },
    ],
    weeklyKm: 31,
    gym: [
      { day: 'Tue', split: 'Lower Body C (Heavy)' },
      { day: 'Thu', split: 'Upper Body C (Heavy)' },
      { day: 'Sun', split: 'Full Body / Core' },
    ],
    tip: 'Race pace runs teach your body what 5:00/km feels like when fatigued.',
  },
  {
    week: 13, phase: 3, deload: true, startDate: weekStartISO(13),
    focus: 'DELOAD — Pre-taper recovery',
    runs: [
      { day: 'Mon', type: 'Easy', distance: 5, pace: '5:30–6:00', notes: '' },
      { day: 'Wed', type: 'Tempo', distance: 6, pace: '5:00–5:10 for 3 km only', notes: '' },
      { day: 'Sat', type: 'Long', distance: 10, pace: '5:45–6:15', notes: 'Controlled — legs should feel great' },
    ],
    weeklyKm: 21,
    gym: [
      { day: 'Tue', split: 'Lower Body C (–25%)' },
      { day: 'Thu', split: 'Upper Body C (–25%)' },
      { day: 'Sun', split: 'Mobility & Core' },
    ],
    tip: "This deload is critical before taper. Don't skip it — you'll thank yourself on race day.",
  },
  // ── Phase 4: Taper & Race ─────────────────────────────────────────────────
  {
    week: 14, phase: 4, startDate: weekStartISO(14),
    focus: 'Taper begins — reduce volume 20%',
    runs: [
      { day: 'Mon', type: 'Easy', distance: 5, pace: '5:30–6:00', notes: '' },
      { day: 'Wed', type: 'Race Pace', distance: 6, pace: '5:00 for 3 km', notes: 'Keep it sharp and controlled' },
      { day: 'Sat', type: 'Long', distance: 10, pace: '5:30–5:50', notes: 'Slightly faster — fresher legs' },
    ],
    weeklyKm: 21,
    gym: [
      { day: 'Tue', split: 'Lower Body A (–30%)' },
      { day: 'Thu', split: 'Upper Body A (–30%)' },
      { day: 'Sun', split: 'Core & Mobility only' },
    ],
    tip: "The hay is in the barn. Trust your training. Don't add extra miles.",
  },
  {
    week: 15, phase: 4, startDate: weekStartISO(15),
    focus: 'Taper — reduce volume 35%',
    runs: [
      { day: 'Mon', type: 'Easy', distance: 4, pace: '5:30–6:00', notes: '' },
      { day: 'Wed', type: 'Race Pace + Strides', distance: 5, pace: '5:00 for 2 km + 4 strides', notes: '' },
      { day: 'Sat', type: 'Long', distance: 8, pace: '5:30–5:45', notes: 'Controlled, confidence run' },
    ],
    weeklyKm: 17,
    gym: [
      { day: 'Tue', split: 'Lower Body A (–40%)' },
      { day: 'Thu', split: 'Upper Body A (–40%)' },
      { day: 'Sun', split: 'Gentle mobility only' },
    ],
    tip: "It's normal to feel restless in taper. That's called taper madness — it's a good sign.",
  },
  {
    week: 16, phase: 4, startDate: weekStartISO(16),
    focus: 'Race week prep',
    runs: [
      { day: 'Mon', type: 'Easy', distance: 3, pace: '5:45–6:00', notes: 'Just get the blood moving' },
      { day: 'Wed', type: 'Shakeout + Strides', distance: 4, pace: 'Easy w/ 4 strides', notes: 'Feel sharp and light' },
      { day: 'Fri', type: 'Easy', distance: 2, pace: '6:00', notes: 'Legs feel fresh? Perfect.' },
    ],
    weeklyKm: 9,
    gym: [
      { day: 'Tue', split: 'Upper Body only (light, –50%)' },
      { day: 'Thu', split: 'Core & Mobility only' },
    ],
    tip: 'Race prep: lay out your gear, plan your nutrition, sleep 8+ hours. Nothing new on race day.',
  },
  {
    week: 17, phase: 4, startDate: weekStartISO(17),
    focus: 'RACE WEEK 🏁',
    runs: [
      { day: 'Mon', type: 'Easy', distance: 2, pace: '6:00', notes: 'Shake out the nerves' },
      { day: 'Wed', type: 'Strides only', distance: 2, pace: 'Easy + 4 strides', notes: 'Last pre-race activation' },
      { day: 'Sat/Sun', type: '🏁 RACE DAY', distance: 14, pace: '5:00 target', notes: 'Start easy first 2 km (5:10–5:20), settle into 5:00, finish strong!' },
    ],
    weeklyKm: 18,
    gym: [],
    tip: 'Race strategy: Go out 5–10 sec/km SLOWER for first 2 km. Negative split = strong finish.',
  },
]

// ─── GYM SPLITS ──────────────────────────────────────────────────────────────

export const GYM_SPLITS: Record<string, GymSplit> = {
  'Lower Body A': {
    phase: 'Foundation (Wks 1–4)',
    exercises: [
      { name: 'Barbell Back Squat', sets: 3, reps: '8–10', weight: 'RPE 7 (~60–65% 1RM)', muscles: 'Quads, Glutes', notes: 'Focus on depth and braced core' },
      { name: 'Romanian Deadlift', sets: 3, reps: '10–12', weight: 'RPE 7 (~55–60% 1RM)', muscles: 'Hamstrings, Glutes', notes: 'Hip hinge, slight knee bend' },
      { name: 'Walking Lunges', sets: 3, reps: '10 each leg', weight: 'BW or light DBs', muscles: 'Quads, Glutes', notes: 'Great for unilateral runner strength' },
      { name: 'Seated Calf Raise', sets: 3, reps: '15–20', weight: 'Moderate load', muscles: 'Soleus', notes: 'Slow eccentric for tendon health' },
      { name: 'Glute Bridge', sets: 3, reps: '15', weight: 'BW or barbell', muscles: 'Glutes', notes: 'Squeeze at top for 1 second' },
      { name: 'Dead Bug', sets: 3, reps: '10 each side', weight: 'Bodyweight', muscles: 'Core', notes: 'Lower back pressed to floor' },
    ],
  },
  'Upper Body A': {
    phase: 'Foundation (Wks 1–4)',
    exercises: [
      { name: 'Pull-Up / Lat Pulldown', sets: 3, reps: '6–10', weight: 'BW or RPE 7', muscles: 'Lats, Biceps', notes: 'Full range of motion' },
      { name: 'Dumbbell Row (single arm)', sets: 3, reps: '10–12 each', weight: 'RPE 7', muscles: 'Lats, Rhomboids', notes: 'Elbow close to body' },
      { name: 'DB Bench Press', sets: 3, reps: '10–12', weight: 'RPE 7', muscles: 'Chest, Triceps', notes: 'Controlled eccentric' },
      { name: 'Face Pulls', sets: 3, reps: '15–20', weight: 'Light cable', muscles: 'Rear Delts, Traps, Ext Rotators', notes: 'Key for posture — never skip' },
      { name: 'Overhead Press (DB)', sets: 3, reps: '10', weight: 'RPE 7', muscles: 'Shoulders, Traps', notes: 'Brace core, no arch' },
      { name: 'Plank', sets: 3, reps: '30–45 sec', weight: 'BW', muscles: 'Core', notes: 'Tight glutes and core throughout' },
    ],
  },
  'Full Body / Core': {
    phase: 'Foundation (Wks 1–4)',
    exercises: [
      { name: 'Goblet Squat', sets: 3, reps: '12', weight: 'Moderate KB/DB', muscles: 'Quads, Glutes', notes: 'Great for mobility and strength' },
      { name: 'DB Romanian Deadlift', sets: 3, reps: '12', weight: 'RPE 6', muscles: 'Hamstrings, Glutes', notes: '' },
      { name: 'Push-Up (weighted or standard)', sets: 3, reps: '12–15', weight: 'BW or plate', muscles: 'Chest, Shoulders, Triceps', notes: '' },
      { name: 'Band Pull-Apart', sets: 3, reps: '20', weight: 'Light band', muscles: 'Rear Delts, Posture', notes: 'Posture correction drill' },
      { name: 'Pallof Press', sets: 3, reps: '12 each side', weight: 'Light cable', muscles: 'Anti-rotation core', notes: 'Resist rotation — key for runners' },
      { name: 'Side-Lying Hip Abduction', sets: 3, reps: '15 each side', weight: 'BW or band', muscles: 'Glute Med', notes: 'Prevents IT band issues' },
    ],
  },
  'Lower Body B': {
    phase: 'Development (Wks 5–9)',
    exercises: [
      { name: 'Barbell Back Squat', sets: 4, reps: '6–8', weight: 'RPE 8 (~70–75% 1RM)', muscles: 'Quads, Glutes', notes: 'Increase weight from Phase 1' },
      { name: 'Deadlift (Conventional)', sets: 3, reps: '6–8', weight: 'RPE 8 (~70% 1RM)', muscles: 'Posterior chain', notes: 'Brace hard, drive through floor' },
      { name: 'Bulgarian Split Squat', sets: 3, reps: '8–10 each', weight: 'DBs or barbell', muscles: 'Quads, Glutes', notes: 'Best runner exercise for imbalances' },
      { name: 'Leg Curl / Nordic Curl', sets: 3, reps: '10–12', weight: 'RPE 7', muscles: 'Hamstrings', notes: 'Nordic curls = elite hamstring strength' },
      { name: 'Standing Calf Raise', sets: 4, reps: '12–15', weight: 'Moderate–heavy', muscles: 'Gastrocnemius', notes: 'Single-leg if able' },
      { name: 'Copenhagen Plank', sets: 3, reps: '20–30 sec', weight: 'BW', muscles: 'Adductors, Core', notes: 'Hip strength for runners' },
    ],
  },
  'Upper Body B': {
    phase: 'Development (Wks 5–9)',
    exercises: [
      { name: 'Barbell Row (Bent Over)', sets: 4, reps: '8–10', weight: 'RPE 8', muscles: 'Lats, Rhomboids, Biceps', notes: 'Big posture builder' },
      { name: 'Weighted Pull-Up', sets: 3, reps: '5–8', weight: 'BW + 5–10 kg belt', muscles: 'Lats, Biceps', notes: 'Add weight gradually' },
      { name: 'Incline DB Press', sets: 3, reps: '10–12', weight: 'RPE 7', muscles: 'Upper Chest, Shoulders', notes: '' },
      { name: 'Face Pulls', sets: 4, reps: '20', weight: 'Light cable', muscles: 'Rear Delts, Posture', notes: 'Non-negotiable for posture' },
      { name: 'Lateral Raise', sets: 3, reps: '15', weight: 'Light DB', muscles: 'Lateral Deltoid', notes: 'Controlled, no swinging' },
      { name: 'Dead Bug with Band', sets: 3, reps: '10 each side', weight: 'Light band', muscles: 'Core', notes: '' },
    ],
  },
  'Lower Body C (Heavy)': {
    phase: 'Build (Wks 10–13)',
    exercises: [
      { name: 'Barbell Back Squat', sets: 4, reps: '5', weight: 'RPE 8.5 (~80% 1RM)', muscles: 'Quads, Glutes', notes: 'Heavier week — strength focus' },
      { name: 'Deadlift (Conventional)', sets: 4, reps: '5', weight: 'RPE 8.5 (~80% 1RM)', muscles: 'Posterior chain', notes: '2–3 min rest between sets' },
      { name: 'Bulgarian Split Squat', sets: 3, reps: '8 each', weight: '+5–10% from Phase 2', muscles: 'Quads, Glutes', notes: '' },
      { name: 'Romanian Deadlift', sets: 3, reps: '8–10', weight: 'RPE 8', muscles: 'Hamstrings', notes: '' },
      { name: 'Single-Leg Calf Raise', sets: 4, reps: '12', weight: 'Moderate', muscles: 'Calf complex', notes: '3-second eccentric' },
      { name: 'GHR or Nordic Curl', sets: 3, reps: '6–8', weight: 'BW assisted', muscles: 'Hamstrings', notes: 'Injury prevention gold standard' },
    ],
  },
  'Upper Body C (Heavy)': {
    phase: 'Build (Wks 10–13)',
    exercises: [
      { name: 'Weighted Pull-Up', sets: 4, reps: '5–6', weight: 'BW + 10–15 kg', muscles: 'Lats, Biceps', notes: '' },
      { name: 'Barbell Row', sets: 4, reps: '6–8', weight: 'RPE 8.5', muscles: 'Lats, Rhomboids', notes: '' },
      { name: 'DB Bench Press', sets: 4, reps: '8', weight: 'RPE 8', muscles: 'Chest, Triceps', notes: '' },
      { name: 'Face Pulls', sets: 4, reps: '20', weight: 'Moderate', muscles: 'Rear Delts', notes: 'Every session, non-negotiable' },
      { name: 'Overhead Press (Barbell)', sets: 3, reps: '6–8', weight: 'RPE 8', muscles: 'Shoulders', notes: 'Upgrade from DB phase' },
      { name: 'Ab Wheel Rollout', sets: 3, reps: '8–12', weight: 'BW', muscles: 'Core', notes: 'Full extension only if able' },
    ],
  },
  'Mobility & Core only': {
    phase: 'Deload / Taper',
    exercises: [
      { name: 'Hip Flexor Stretch (kneeling)', sets: 2, reps: '60 sec each', weight: 'BW', muscles: 'Hip flexors', notes: 'Critical for runners' },
      { name: 'Pigeon Pose', sets: 2, reps: '60 sec each', weight: 'BW', muscles: 'Glutes, piriformis', notes: '' },
      { name: "World's Greatest Stretch", sets: 2, reps: '5 each side', weight: 'BW', muscles: 'Full body', notes: 'Mobility staple' },
      { name: 'Dead Bug', sets: 3, reps: '10 each side', weight: 'BW', muscles: 'Core', notes: '' },
      { name: 'Bird Dog', sets: 3, reps: '12 each side', weight: 'BW', muscles: 'Core, Glutes', notes: '' },
      { name: 'Foam Roll: Quads, IT, Calves', sets: 1, reps: '60 sec each', weight: 'Foam roller', muscles: 'Full leg', notes: 'Slow, controlled pressure' },
    ],
  },
  'Mobility & Core': {
    phase: 'Deload',
    exercises: [
      { name: 'Hip Flexor Stretch', sets: 2, reps: '60 sec each', weight: 'BW', muscles: 'Hip flexors', notes: '' },
      { name: 'Hamstring Stretch', sets: 2, reps: '45 sec each', weight: 'BW', muscles: 'Hamstrings', notes: '' },
      { name: 'Calf Stretch (wall)', sets: 2, reps: '45 sec each', weight: 'BW', muscles: 'Calf', notes: '' },
      { name: 'Plank', sets: 2, reps: '45 sec', weight: 'BW', muscles: 'Core', notes: '' },
      { name: 'Glute Bridge', sets: 2, reps: '15', weight: 'BW', muscles: 'Glutes', notes: '' },
      { name: 'Foam Roll full legs', sets: 1, reps: '2 min', weight: 'Foam roller', muscles: 'Legs', notes: '' },
    ],
  },
  'Core & Mobility only': {
    phase: 'Taper',
    exercises: [
      { name: 'Hip Flexor Stretch', sets: 2, reps: '60 sec each', weight: 'BW', muscles: 'Hips', notes: '' },
      { name: 'Dead Bug', sets: 3, reps: '10 each side', weight: 'BW', muscles: 'Core', notes: '' },
      { name: 'Bird Dog', sets: 3, reps: '12 each side', weight: 'BW', muscles: 'Core, Glutes', notes: '' },
      { name: 'Foam Roll legs', sets: 1, reps: '5 min', weight: 'Foam roller', muscles: 'Full leg', notes: '' },
    ],
  },
  'Gentle mobility only': {
    phase: 'Taper',
    exercises: [
      { name: 'Full body foam roll', sets: 1, reps: '5 min', weight: 'Foam roller', muscles: 'Full body', notes: 'Stay gentle — no aggressive rolling' },
      { name: 'Hip & hip flexor stretches', sets: 1, reps: '3 min', weight: 'BW', muscles: 'Hips', notes: '' },
      { name: 'Calf & Achilles stretch', sets: 1, reps: '2 min', weight: 'BW', muscles: 'Calf', notes: '' },
    ],
  },
  'Upper Body only (light, –50%)': {
    phase: 'Race week',
    exercises: [
      { name: 'Lat Pulldown (light)', sets: 2, reps: '10', weight: '50% of normal', muscles: 'Lats', notes: '' },
      { name: 'Face Pulls', sets: 2, reps: '15', weight: 'Light', muscles: 'Rear Delts', notes: '' },
      { name: 'Band Pull-Apart', sets: 2, reps: '20', weight: 'Light band', muscles: 'Posture', notes: '' },
    ],
  },
}

// ─── MOBILITY ────────────────────────────────────────────────────────────────

export const MOBILITY_ROUTINE: MobilityItem[] = [
  { name: 'Calf & Achilles Stretch', duration: '45 sec each side', timing: 'Post-run daily' },
  { name: 'Hip Flexor (Kneeling Lunge)', duration: '60 sec each side', timing: 'Daily, especially after sitting' },
  { name: 'Hamstring Stretch', duration: '45 sec each side', timing: 'Post-run' },
  { name: 'IT Band / Piriformis (Pigeon/Fig. 4)', duration: '60 sec each side', timing: 'Post-run or evening' },
  { name: 'Quad Stretch (standing)', duration: '45 sec each side', timing: 'Post-run' },
  { name: 'Thoracic Rotation', duration: '10 reps each side', timing: 'Morning or pre-gym' },
  { name: 'Glute Bridge (activation)', duration: '2×15 reps', timing: 'Pre-run warmup' },
  { name: 'Leg Swings (front/back + side)', duration: '10 each direction', timing: 'Pre-run warmup' },
]

export const WARMUP_STEPS: string[] = [
  '2 min easy walk or slow jog',
  'Leg swings × 10 each direction',
  'Hip circles × 10 each side',
  'Glute bridges × 15',
  'High knees × 20 steps',
  'A-skips × 20 steps',
]

export const COOLDOWN_STEPS: string[] = [
  '2 min easy walk',
  'Standing quad stretch × 45 sec each',
  'Calf stretch vs wall × 45 sec each',
  'Hip flexor kneeling stretch × 60 sec each',
  'Seated hamstring stretch × 45 sec each',
  'Lying glute stretch (figure 4) × 60 sec each',
  "Child's pose × 60 sec",
]

// ─── NUTRITION (Vegetarian) ───────────────────────────────────────────────────

export const NUTRITION_TIPS: NutritionTip[] = [
  {
    title: 'Protein — Vegetarian Sources',
    detail: 'Target 1.6–2.0g per kg of bodyweight daily. Prioritise: Greek yogurt, paneer, eggs, tofu, tempeh, edamame, lentils, chickpeas, black beans, quinoa, and whey/plant protein powder. Combine incomplete proteins (e.g. rice + lentils) to get all essential amino acids.',
  },
  {
    title: 'Carbohydrates — Your Fuel',
    detail: "Don't fear carbs — they are your primary running fuel. Prioritise whole grains (oats, brown rice, quinoa), sweet potato, fruit, and legumes. Aim for ~50–60% of total calories from carbs on high-mileage days.",
  },
  {
    title: 'Iron — Critical for Vegetarians',
    detail: 'Plant-based iron (non-haem) is less absorbed than meat iron. Eat iron-rich foods (lentils, spinach, tofu, fortified cereals) with vitamin C (citrus, capsicum) to boost absorption. Avoid tea/coffee with meals. Get blood iron checked every few months.',
  },
  {
    title: 'B12 & Zinc',
    detail: 'B12 is found almost exclusively in animal products — supplement 500–1000 mcg/day or eat B12-fortified foods (nutritional yeast, plant milks). Zinc from legumes and seeds is less bioavailable; consider a supplement if training hard.',
  },
  {
    title: 'Pre-Run Fuel',
    detail: '2–3 hrs before: carb-rich meal (oats + banana, toast + nut butter, dahl + rice). 30–60 min before: banana, a medjool date, or rice cakes. Avoid high-fat/fibre foods immediately before long runs.',
  },
  {
    title: 'During Long Runs (>75 min)',
    detail: 'Take a banana, medjool dates (2–3), sports gel, or homemade energy balls at the 45–60 min mark. Practice this in training — never try something new on race day.',
  },
  {
    title: 'Post-Run Recovery',
    detail: 'Within 30–45 min: protein + carbs. Great options: Greek yogurt + banana, tofu scramble + toast, protein shake + fruit, paneer + rice, or a legume-based bowl.',
  },
  {
    title: 'Hydration',
    detail: '2–3L water daily. Add electrolytes (coconut water is a natural source) on long run days. Vegetarians can be prone to low sodium if not salting food — add a pinch to meals.',
  },
  {
    title: 'Calorie Surplus for Muscle Growth',
    detail: 'Eat 200–300 kcal above maintenance on gym days. Vegetarian diets can be high in fibre and lower in caloric density — be intentional: add nuts, nut butters, avocado, and full-fat dairy to hit your targets.',
  },
  {
    title: 'Sleep',
    detail: '8+ hours is the most powerful recovery and performance tool. Non-negotiable during heavy training weeks.',
  },
]

// ─── COLOUR MAPS ─────────────────────────────────────────────────────────────

export const PHASE_COLORS: Record<number, PhaseColor> = {
  1: { bg: 'rgba(74,222,128,0.12)', border: '#4ade80', text: '#4ade80' },
  2: { bg: 'rgba(96,165,250,0.12)', border: '#60a5fa', text: '#60a5fa' },
  3: { bg: 'rgba(245,158,11,0.12)', border: '#f59e0b', text: '#f59e0b' },
  4: { bg: 'rgba(248,113,113,0.12)', border: '#f87171', text: '#f87171' },
}

export const RUN_TYPE_COLORS: Record<string, string> = {
  'Easy': '#4ade80',
  'Easy + Strides': '#86efac',
  'Easy Tempo': '#a3e635',
  'Tempo': '#facc15',
  'Race Pace': '#f97316',
  'Race Pace + Strides': '#f97316',
  'Intervals': '#f43f5e',
  'Recovery': '#818cf8',
  'Long': '#60a5fa',
  'Strides only': '#c084fc',
  'Shakeout + Strides': '#c084fc',
  '🏁 RACE DAY': '#fbbf24',
}

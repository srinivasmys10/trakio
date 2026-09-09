// ─────────────────────────────────────────────────────────────────────────────
// 26-Week Sub-3:30 Marathon Plan
// Start: Monday 5 October 2026
// Race:  Sunday 4 April 2027
// Target pace: 5:00/km (3:30:00 finish)
// ─────────────────────────────────────────────────────────────────────────────

export type SessionType =
  | 'rest' | 'easy' | 'tempo' | 'intervals' | 'long' | 'recovery' | 'cross' | 'race'

export const SESSION_META: Record<SessionType, { icon: string; color: string; bg: string; border: string; label: string }> = {
  rest:      { icon: '😴', color: 'var(--text-muted)',  bg: 'var(--surface)',             border: 'var(--border)',                label: 'Rest'          },
  easy:      { icon: '🏃', color: 'var(--blue)',        bg: 'rgba(96,165,250,0.08)',      border: 'rgba(96,165,250,0.3)',         label: 'Easy Run'      },
  tempo:     { icon: '⚡', color: 'var(--amber)',       bg: 'rgba(245,158,11,0.08)',      border: 'rgba(245,158,11,0.3)',         label: 'Tempo'         },
  intervals: { icon: '🔥', color: 'var(--red)',         bg: 'rgba(248,113,113,0.08)',     border: 'rgba(248,113,113,0.3)',        label: 'Intervals'     },
  long:      { icon: '🏅', color: 'var(--purple)',      bg: 'rgba(167,139,250,0.08)',     border: 'rgba(167,139,250,0.3)',        label: 'Long Run'      },
  recovery:  { icon: '🌿', color: 'var(--green)',       bg: 'rgba(74,222,128,0.07)',      border: 'rgba(74,222,128,0.25)',        label: 'Recovery'      },
  cross:     { icon: '🚴', color: 'var(--yellow)',      bg: 'rgba(250,204,21,0.07)',      border: 'rgba(250,204,21,0.3)',         label: 'Cross-Train'   },
  race:      { icon: '🏁', color: '#f43f5e',            bg: 'rgba(244,63,94,0.1)',        border: 'rgba(244,63,94,0.4)',          label: 'RACE DAY'      },
}

export interface MarathonSession {
  type:       SessionType
  title:      string
  km?:        number           // total session distance
  pace?:      string           // target pace zone
  duration?:  string           // for non-run sessions
  description:string
  structure?: string[]         // workout breakdown
  exercises?: string[]         // strength/mobility work
}

export interface MarathonDay {
  date:       string           // "YYYY-MM-DD"
  weekNum:    number
  dayIndex:   number           // 0 = Monday … 6 = Sunday
  session:    MarathonSession
}

export interface MarathonWeek {
  weekNum:    number
  startDate:  string           // ISO Monday
  phase:      string
  phaseNum:   number
  weeklyKm:   number
  focus:      string
  days:       MarathonDay[]
}

// ─── Pace constants ────────────────────────────────────────────────────────────
const P = {
  rec:  '6:30–7:00/km',
  easy: '5:45–6:15/km',
  aero: '5:30–5:50/km',
  mp:   '4:58–5:05/km',   // marathon pace
  tp:   '4:25–4:40/km',   // threshold/tempo
  iv:   '4:00–4:15/km',   // interval
  str:  '5:00–5:15/km',   // marathon-pace strides
}

// ─── Strength sessions ─────────────────────────────────────────────────────────
const MOBILITY_BASE = [
  'Hip flexor stretch 90 sec each side',
  'Pigeon pose 60 sec each side',
  'Calf raise 3 × 20 (slow eccentric)',
  'Glute bridge 3 × 15',
  'Dead bug 3 × 10 each',
]
const STRENGTH_FULL = [
  'Single-leg RDL 3 × 8 each',
  'Bulgarian split squat 3 × 8 each',
  'Copenhagen plank 3 × 20 sec each',
  'Pallof press 3 × 12 each',
  'Nordic hamstring curl 3 × 6',
  'Calf raise 4 × 20 with 4-sec down',
  'Tibialis raise 3 × 25 (shin-splint prevention)',
]
const CORE_CIRCUIT = [
  'Plank 3 × 45 sec',
  'Side plank 3 × 30 sec each',
  'Dead bug 3 × 10 each',
  'Bird dog 3 × 12 each',
  'Hollow body hold 3 × 20 sec',
]

// ─── Date helper ──────────────────────────────────────────────────────────────

const PLAN_START = '2026-10-05'  // Monday

function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d + n)
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`
}

function weekStart(weekNum: number): string {
  return addDays(PLAN_START, (weekNum - 1) * 7)
}

// ─── Week spec: [Mon, Tue, Wed, Thu, Fri, Sat, Sun] ───────────────────────────

type DaySpec = MarathonSession

function day(s: MarathonSession): DaySpec { return s }

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 1: BASE  (Weeks 1–6)  — Build aerobic engine, injury prevention
// ─────────────────────────────────────────────────────────────────────────────

//const BASE_STRENGTH_NOTE = 'Strength training is non-negotiable in base phase — it prevents 70% of running injuries.'

const PHASE1_WEEKS: DaySpec[][] = [
  // Week 1 — 40 km  LR 16 km
  [
    day({ type:'rest', title:'Rest + Mobility', description:'First week — let your body adapt. Walk, stretch, and prepare mentally.', exercises:MOBILITY_BASE }),
    day({ type:'easy', title:'Easy Run', km:8, pace:P.easy, description:'First run of the plan. No watch pressure — run conversationally. If you can\'t hold a sentence, slow down.', structure:['10 min walk warm-up', '8 km at easy effort', '5 min walk cool-down', '5 min stretching'] }),
    day({ type:'easy', title:'Easy Run + Strength', km:8, pace:P.easy, description:'Morning run, then strength in the evening or afternoon. Build the habit now — this combo is your weekly cornerstone.', structure:['8 km easy run', 'Evening: full strength circuit'], exercises:STRENGTH_FULL }),
    day({ type:'easy', title:'Easy Run', km:6, pace:P.rec, description:'Recovery-pace run — even easier than Tuesday. Focus on landing softly under your hips.', structure:['6 km comfortable', 'Foam roll calves and quads afterward'] }),
    day({ type:'rest', title:'Rest + Core', description:'Light day. Core work only — no running.', exercises:CORE_CIRCUIT }),
    day({ type:'long', title:'Long Run', km:16, pace:P.aero, description:'First long run. Start very easy — the first 5 km should feel almost too slow. Bring water after 10 km.', structure:['16 km steady aerobic', 'Hydrate every 20 min', 'Post-run: eat within 30 min', 'Elevate legs for 20 min'] }),
    day({ type:'recovery', title:'Recovery Run', km:6, pace:P.rec, description:'Shake out the legs from Saturday. This is the most important run you\'ll want to skip and the most important one to do.', structure:['6 km very easy — no GPS pressure'] }),
  ],
  // Week 2 — 42 km  LR 18 km
  [
    day({ type:'rest', title:'Rest + Mobility', description:'Weekly reset. Hip flexors, glutes, and thoracic spine are your priorities after Saturday\'s long run.', exercises:MOBILITY_BASE }),
    day({ type:'easy', title:'Easy Run', km:9, pace:P.easy, description:'Building to 9 km now. If Tuesday still feels hard, you\'re running too fast. Use the talk test.', structure:['9 km easy', '6 strides of 20 sec at the end (controlled acceleration)'] }),
    day({ type:'easy', title:'Easy Run + Strength', km:8, pace:P.easy, description:'Morning run, evening strength. You should be adapting to this rhythm by now.', exercises:STRENGTH_FULL }),
    day({ type:'easy', title:'Easy Run', km:7, pace:P.easy, description:'Comfortable run. Notice how your legs feel compared to week 1. Recovery is improving.', structure:['7 km easy', 'Focus on cadence — aim for 170–180 steps/min'] }),
    day({ type:'cross', title:'Cross-Training', duration:'40 min', description:'Cycling, swimming, or elliptical. Heart rate 60–70% max. Rest your running muscles while building aerobic capacity.' }),
    day({ type:'long', title:'Long Run', km:18, pace:P.aero, description:'Add 2 km to last week. Begin implementing your race-day nutrition strategy — gel or dates at 60 min.', structure:['18 km aerobic', 'Nutrition: 30–45g carbs at 60 min', 'Negative split: second half slightly faster'] }),
    day({ type:'recovery', title:'Recovery Run', km:6, pace:P.rec, description:'Active recovery — move the blood, flush the lactate.', structure:['6 km very easy'] }),
  ],
  // Week 3 — 45 km  LR 20 km
  [
    day({ type:'rest', title:'Rest + Mobility', description:'Entering the build now. The soreness you may have felt in weeks 1–2 should be reducing. Body is adapting.', exercises:MOBILITY_BASE }),
    day({ type:'easy', title:'Easy Run', km:10, pace:P.easy, description:'First double-digit easy run. Still conversational pace. Add 4–6 strides at the end to begin developing turnover.', structure:['10 km easy', '5 × 20-sec strides with full recovery'] }),
    day({ type:'easy', title:'Easy Run + Strength', km:8, pace:P.easy, description:'Consistent strength work pays dividends at km 35 of the race.', exercises:STRENGTH_FULL }),
    day({ type:'easy', title:'Easy Run', km:7, pace:P.easy, description:'Maintain easy effort. Experiment with breathing rhythm: inhale 3 steps, exhale 2.', structure:['7 km easy'] }),
    day({ type:'rest', title:'Rest + Core', description:'Rest day before big weekend. Core circuit only.', exercises:CORE_CIRCUIT }),
    day({ type:'long', title:'Long Run', km:20, pace:P.aero, description:'First 20 km. A milestone. Mental note: at km 20 in the race, you\'ll have 22 km left — stay humble today.', structure:['20 km steady', 'Walk 60 sec every 5 km if needed — that\'s a valid strategy', 'Nutrition: gel or dates at 60 and 90 min'] }),
    day({ type:'recovery', title:'Recovery Run', km:6, pace:P.rec, description:'If yesterday hurt, this still needs to happen. 6 km easy. Your aerobic system recovers running slowly, not resting completely.', structure:['6 km easy'] }),
  ],
  // Week 4 — 42 km RECOVERY WEEK  LR 18 km
  [
    day({ type:'rest', title:'Rest + Mobility', description:'Recovery week — reduce volume ~10%. Adaptation happens in rest. Don\'t add extra runs this week.', exercises:MOBILITY_BASE }),
    day({ type:'easy', title:'Easy Run', km:9, pace:P.easy, description:'Back off slightly from last week. Use this run to assess: anything aching? Address it now.', structure:['9 km easy', '4 strides'] }),
    day({ type:'easy', title:'Easy Run + Strength', km:8, pace:P.easy, description:'Recovery week but still strength training — reduce weights by 10% for deload.', exercises:STRENGTH_FULL }),
    day({ type:'easy', title:'Easy Run', km:7, pace:P.easy, description:'Feel refreshed compared to last Thursday? Good — your aerobic base is building.', structure:['7 km easy'] }),
    day({ type:'rest', title:'Rest', description:'Full rest day. Sleep 8+ hours. This is as important as the running.', }),
    day({ type:'long', title:'Long Run', km:18, pace:P.aero, description:'Recovery week long run — 2 km shorter than peak. Run by feel, not by target pace. Enjoy it.', structure:['18 km comfortable', 'No pace pressure — run on effort'] }),
    day({ type:'recovery', title:'Recovery Run', km:6, pace:P.rec, description:'Easy finish to recovery week. You should feel noticeably fresher than week 3.', structure:['6 km easy'] }),
  ],
  // Week 5 — 50 km  LR 22 km
  [
    day({ type:'rest', title:'Rest + Mobility', description:'Big build week. You\'ve recovered — now push forward. Focus this week: running tall, leaning slightly from ankles.', exercises:MOBILITY_BASE }),
    day({ type:'easy', title:'Easy Run + Strides', km:10, pace:P.easy, description:'Strides are short accelerations that develop neuromuscular efficiency without fatigue.', structure:['10 km easy', '6 × 20-sec strides — accelerate over 10 sec, hold, decelerate. Full 2-min jog recovery.'] }),
    day({ type:'easy', title:'Easy Run + Strength', km:9, pace:P.easy, description:'Increase single-leg work this week — runners need unilateral strength.', exercises:STRENGTH_FULL }),
    day({ type:'easy', title:'Easy Run', km:9, pace:P.easy, description:'Build confidence. By now, 9 km should feel manageable — you\'re fitter than week 1.', structure:['9 km easy'] }),
    day({ type:'rest', title:'Rest + Core', description:'Rest before the biggest long run so far.', exercises:CORE_CIRCUIT }),
    day({ type:'long', title:'Long Run', km:22, pace:P.aero, description:'22 km — your longest yet. At this point you\'re running roughly the equivalent of 3 weeks of training from 3 months ago. Your body has transformed.', structure:['22 km — first 12 km easy, last 10 km aerobic effort', 'Nutrition: gel at 60 and 90 min', 'Focus on form in last 4 km when tired'] }),
    day({ type:'recovery', title:'Recovery Run', km:6, pace:P.rec, description:'The long-run recovery run is the secret weapon of experienced marathoners. Do it.', structure:['6 km easy'] }),
  ],
  // Week 6 — 52 km  LR 24 km  (end of base)
  [
    day({ type:'rest', title:'Rest + Mobility', description:'Final week of base phase. You\'ve built a real aerobic foundation. Next phase brings speed — enjoy these last easy days.', exercises:MOBILITY_BASE }),
    day({ type:'easy', title:'Easy Run + Strides', km:10, pace:P.easy, description:'Last easy-phase Tuesday. Strides sharper than ever — you have the fitness now.', structure:['10 km easy', '8 × 20-sec strides — faster this time, close to 10km effort'] }),
    day({ type:'easy', title:'Easy Run + Strength', km:10, pace:P.easy, description:'Strength benchmark: can you do 3 × 10 single-leg RDL with control? You\'re ready for phase 2 if yes.', exercises:STRENGTH_FULL }),
    day({ type:'easy', title:'Easy Run', km:8, pace:P.easy, description:'Easy 8 km. Your aerobic system can now sustain efforts your legs couldn\'t in week 1.', structure:['8 km easy'] }),
    day({ type:'rest', title:'Rest + Core', description:'Rest before your phase-ending long run.', exercises:CORE_CIRCUIT }),
    day({ type:'long', title:'Long Run', km:24, pace:P.aero, description:'24 km — base phase capstone. A strong finish here sets up everything that comes next. You\'re now capable of running 60% of the race distance in training.', structure:['24 km steady aerobic', 'Km 18–22: ease to marathon-pace effort to practice feel', 'Last 2 km: cool down easy', 'Post-run protein + carbs within 30 min'] }),
    day({ type:'recovery', title:'Recovery Run', km:6, pace:P.rec, description:'Celebrate completing phase 1 with an easy 6 km. You\'ve built the engine — phase 2 sharpens it.', structure:['6 km easy'] }),
  ],
]

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 2: DEVELOPMENT  (Weeks 7–12)
// Introduce tempo, intervals, higher volume
// ─────────────────────────────────────────────────────────────────────────────

const PHASE2_WEEKS: DaySpec[][] = [
  // Week 7 — 55 km  LR 26 km
  [
    day({ type:'rest', title:'Rest + Mobility', description:'Welcome to Phase 2. The work gets harder but you\'re ready for it. Today: extra focus on glutes and hips — you\'ll need them for tempo runs.', exercises:MOBILITY_BASE }),
    day({ type:'tempo', title:'Tempo Run', km:10, pace:P.tp, description:'First tempo session. Tempo pace feels "comfortably hard" — you can say a few words but not a sentence. Don\'t start too fast.', structure:['2 km easy warm-up', '6 km at threshold pace (4:25–4:40/km)', '2 km easy cool-down', 'Heart rate 80–85% max throughout tempo portion'] }),
    day({ type:'easy', title:'Easy Run + Strength', km:10, pace:P.easy, description:'Day after tempo: keep it easy. Strength training as normal — single-leg focus.', exercises:STRENGTH_FULL }),
    day({ type:'easy', title:'Easy Run', km:9, pace:P.easy, description:'Mid-week easy run. Your legs should feel recovered from Tuesday. If not, slow down.', structure:['9 km easy'] }),
    day({ type:'rest', title:'Rest', description:'Full rest day before interval work begins next week. Core if you feel good.', exercises:CORE_CIRCUIT }),
    day({ type:'long', title:'Long Run', km:26, pace:P.aero, description:'First 26+ km run. You\'ve entered uncharted territory — further than most non-marathon runners will ever go. Trust your training.', structure:['26 km — first 20 km aerobic, km 20–24 at marathon pace effort, last 2 km easy', 'Nutrition: gel at 60, 90, 120 min', 'Walk aid station style every 7 km for 30 sec — practice race strategy'] }),
    day({ type:'recovery', title:'Recovery Run', km:8, pace:P.rec, description:'8 km easy. Your capacity to recover quickly is itself a fitness adaptation.', structure:['8 km easy'] }),
  ],
  // Week 8 — 58 km  LR 28 km
  [
    day({ type:'rest', title:'Rest + Mobility', description:'Your weekly volume is approaching 60 km. Sleep, nutrition, and mobility work are now as important as the runs.', exercises:MOBILITY_BASE }),
    day({ type:'tempo', title:'Tempo Run', km:11, pace:P.tp, description:'Extend the tempo. 7 km at threshold. This pace will become easier over the next 8 weeks.', structure:['2 km warm-up', '7 km threshold (4:25–4:40/km)', '2 km cool-down'] }),
    day({ type:'easy', title:'Easy Run + Strength', km:10, pace:P.easy, description:'Strength: increase loads slightly from week 6. You should feel stronger.', exercises:STRENGTH_FULL }),
    day({ type:'intervals', title:'Interval Session', km:10, pace:P.iv, description:'First interval session of the plan. Intervals build speed economy that makes marathon pace feel easier.', structure:['2 km easy warm-up', '5 × 1,000 m at 4:05–4:15/km', '2-min jog recovery between reps', '2 km easy cool-down', 'Total: ~10 km'] }),
    day({ type:'rest', title:'Rest', description:'Full rest. Two quality sessions this week — your body needs the recovery.', }),
    day({ type:'long', title:'Long Run', km:28, pace:P.aero, description:'28 km. At km 28 in the race you\'ll have 14 to go — the real marathon begins there. Today you\'re teaching your body what fatigue feels like and how to push through it.', structure:['28 km', 'Km 0–18: easy-aerobic', 'Km 18–25: marathon pace feel', 'Km 25–28: race simulation — push slightly'] }),
    day({ type:'recovery', title:'Recovery Run', km:8, pace:P.rec, description:'Easy 8 km. Sunday runs prevent the "dead legs" feeling that hits on Monday if you rest completely.', structure:['8 km easy'] }),
  ],
  // Week 9 — 55 km RECOVERY  LR 24 km
  [
    day({ type:'rest', title:'Rest + Mobility', description:'Recovery week. Reduce intensity slightly. This is deliberate — supercompensation happens now.', exercises:MOBILITY_BASE }),
    day({ type:'tempo', title:'Tempo Run (lighter)', km:9, pace:P.tp, description:'Shorter tempo this week: 5 km threshold. Treat it as a reminder of the effort, not a max session.', structure:['2 km warm-up', '5 km threshold', '2 km cool-down'] }),
    day({ type:'easy', title:'Easy Run + Strength', km:10, pace:P.easy, description:'Deload strength: reduce weights 10%, keep movements sharp.', exercises:STRENGTH_FULL }),
    day({ type:'easy', title:'Easy Run', km:8, pace:P.easy, description:'Feel the benefit of the lighter week. Use today to reflect: what\'s your race-day plan?', structure:['8 km easy'] }),
    day({ type:'rest', title:'Rest', description:'Full rest. You\'ve earned it.', }),
    day({ type:'long', title:'Long Run', km:24, pace:P.aero, description:'Recovery week long run — back to 24 km. Run by feel. No interval finish this week — steady aerobic only.', structure:['24 km comfortable aerobic'] }),
    day({ type:'recovery', title:'Recovery Run', km:7, pace:P.rec, description:'7 km easy to close the recovery week.', structure:['7 km easy'] }),
  ],
  // Week 10 — 62 km  LR 29 km
  [
    day({ type:'rest', title:'Rest + Mobility', description:'Post-recovery push. You should feel fresh and ready to build. This week reaches 62 km — the highest mileage so far.', exercises:MOBILITY_BASE }),
    day({ type:'tempo', title:'Tempo Run', km:12, pace:P.tp, description:'8 km tempo — your longest threshold session yet. The goal is not to survive it, but to maintain form and rhythm through the whole effort.', structure:['2 km warm-up', '8 km threshold (4:25–4:35/km)', '2 km cool-down'] }),
    day({ type:'easy', title:'Easy Run + Strength', km:11, pace:P.easy, description:'Volume building — 11 km easy with full strength circuit.', exercises:STRENGTH_FULL }),
    day({ type:'intervals', title:'Interval Session', km:11, pace:P.iv, description:'6 × 1,000 m intervals — one more than week 8. Pace control is key: don\'t blow rep 1 and crawl through rep 6.', structure:['2 km warm-up', '6 × 1,000 m at 4:05/km with 90-sec jog recovery', '2 km cool-down'] }),
    day({ type:'rest', title:'Rest + Core', description:'Three quality sessions this week — rest is essential.', exercises:CORE_CIRCUIT }),
    day({ type:'long', title:'Long Run', km:29, pace:P.aero, description:'29 km. You\'re running longer on Saturday than most people do in a week. Stay patient — the fitness is compounding.', structure:['29 km', 'Km 0–20: aerobic base', 'Km 20–27: marathon pace', 'Last 2 km: easy'] }),
    day({ type:'recovery', title:'Recovery Run', km:9, pace:P.rec, description:'9 km easy — your longest recovery run. This is now standard.', structure:['9 km easy'] }),
  ],
  // Week 11 — 65 km  LR 30 km
  [
    day({ type:'rest', title:'Rest + Mobility', description:'Approaching peak development. Your aerobic engine is now capable of things that seemed impossible in October. Trust the process.', exercises:MOBILITY_BASE }),
    day({ type:'tempo', title:'Tempo Run', km:12, pace:P.tp, description:'8 km threshold — same distance as week 10 but it should feel slightly easier. That\'s fitness.', structure:['2 km warm-up', '8 km at 4:22–4:35/km', '2 km cool-down', 'Target: last 2 km faster than first 2 km'] }),
    day({ type:'easy', title:'Medium-Long Run + Strength', km:14, pace:P.aero, description:'Medium-long Wednesday run enters the program. 14 km builds volume without the fatigue cost of a long run.', exercises:STRENGTH_FULL }),
    day({ type:'intervals', title:'Interval Session', km:11, pace:P.iv, description:'7 × 800 m. Shorter reps, higher pace — develops speed reserve that makes 5:00/km feel controlled.', structure:['2 km warm-up', '7 × 800 m at 3:55–4:05/km with 75-sec jog recovery', '2 km cool-down'] }),
    day({ type:'easy', title:'Easy Run', km:8, pace:P.easy, description:'Easy between the big days. Keep it genuinely easy.', structure:['8 km easy'] }),
    day({ type:'long', title:'Long Run', km:30, pace:P.aero, description:'30 km — the training landmark. Many programs stop here. Yours continues. You\'re learning what the race actually feels like.', structure:['Km 0–22: aerobic effort (5:45–6:00/km)', 'Km 22–28: marathon pace (4:58–5:05/km)', 'Km 28–30: race-effort finish', 'Nutrition every 30 min: gels + water'] }),
    day({ type:'recovery', title:'Recovery Run', km:9, pace:P.rec, description:'9 km easy. Non-negotiable.', structure:['9 km very easy'] }),
  ],
  // Week 12 — 55 km RECOVERY  LR 26 km
  [
    day({ type:'rest', title:'Rest + Mobility', description:'Phase 2 ends with a recovery week. You\'ve built speed and volume simultaneously. Phase 3 is the hardest part — take this week seriously.', exercises:MOBILITY_BASE }),
    day({ type:'tempo', title:'Tempo Run (lighter)', km:9, pace:P.tp, description:'5 km tempo — maintain the feel, not the volume.', structure:['2 km warm-up', '5 km threshold', '2 km cool-down'] }),
    day({ type:'easy', title:'Easy Run + Strength', km:10, pace:P.easy, description:'Deload strength. Focus on technique over load.', exercises:STRENGTH_FULL }),
    day({ type:'easy', title:'Easy Run', km:8, pace:P.easy, description:'Easy 8 km. Review your progress: in 6 weeks you\'ve gone from 40 km/week to 65 km/week. Remarkable.', structure:['8 km easy'] }),
    day({ type:'rest', title:'Rest', description:'Full rest before the last long run of development phase.', }),
    day({ type:'long', title:'Long Run', km:26, pace:P.aero, description:'Recovery week long run at 26 km. Run easy — enjoy it. Phase 3 starts next week.', structure:['26 km steady aerobic — no intensity finish this week'] }),
    day({ type:'recovery', title:'Recovery Run', km:8, pace:P.rec, description:'Recovery run to close phase 2. You\'re ready for peak training.', structure:['8 km easy'] }),
  ],
]

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 3: PEAK TRAINING  (Weeks 13–18)
// Maximum mileage, race-specific workouts, mental toughness
// ─────────────────────────────────────────────────────────────────────────────

const PHASE3_WEEKS: DaySpec[][] = [
  // Week 13 — 68 km  LR 32 km
  [
    day({ type:'rest', title:'Rest + Mobility', description:'Phase 3 — peak training. The hardest 6 weeks of the plan. Trust that every hard day is a deposit in your race-day bank account.', exercises:MOBILITY_BASE }),
    day({ type:'tempo', title:'Tempo Run', km:12, pace:P.tp, description:'9 km threshold. You\'ve done 8 km — add one more. It\'s uncomfortable. That\'s the point.', structure:['2 km warm-up', '9 km at 4:20–4:35/km', '2 km cool-down'] }),
    day({ type:'easy', title:'Medium-Long Run + Strength', km:15, pace:P.aero, description:'15 km on a Wednesday. This is now your "medium" run. Your aerobic base is exceptional.', exercises:STRENGTH_FULL }),
    day({ type:'intervals', title:'Interval Session', km:12, pace:P.iv, description:'3 × 2,000 m — race-specific intervals. Longer reps teach your body to sustain quality for longer.', structure:['2 km warm-up', '3 × 2,000 m at 4:05–4:10/km with 3-min jog recovery', '2 km cool-down'] }),
    day({ type:'easy', title:'Easy Run', km:9, pace:P.easy, description:'Easy 9 km to recover from two quality sessions.', structure:['9 km easy'] }),
    day({ type:'long', title:'Long Run', km:32, pace:P.aero, description:'32 km — you\'re running further in a single session than a half-marathon. Your legs will ask why. Your mind must answer.', structure:['Km 0–22: aerobic (5:40–6:00/km)', 'Km 22–30: marathon pace (5:00/km)', 'Km 30–32: hold on — you\'re practicing the last 12 km of the race', 'Nutrition: every 30 min, gels + electrolytes'] }),
    day({ type:'recovery', title:'Recovery Run', km:10, pace:P.rec, description:'10 km easy. Your new normal on Sundays.', structure:['10 km very easy'] }),
  ],
  // Week 14 — 72 km  LR 33 km
  [
    day({ type:'rest', title:'Rest + Mobility', description:'Approaching maximum mileage. Prioritise sleep (9 hours), protein (1.8g/kg), and iron-rich foods this week.', exercises:MOBILITY_BASE }),
    day({ type:'tempo', title:'Tempo Run', km:13, pace:P.tp, description:'10 km threshold. You\'re now running threshold for 10 km — most recreational runners can\'t do this. You\'re no longer a recreational runner.', structure:['2 km warm-up', '10 km at 4:18–4:30/km', '2 km cool-down'] }),
    day({ type:'easy', title:'Medium-Long Run + Strength', km:16, pace:P.aero, description:'16 km medium-long. Treat this like a long run with less total time.', exercises:STRENGTH_FULL }),
    day({ type:'intervals', title:'Interval Session', km:13, pace:P.iv, description:'1,200 m reps — the most race-specific interval length. You\'ll run ~8 of them in a full marathon if broken into even segments.', structure:['2 km warm-up', '5 × 1,200 m at 4:00–4:08/km with 2-min recovery', '2 km cool-down'] }),
    day({ type:'easy', title:'Easy Run', km:10, pace:P.easy, description:'Easy 10 km. Essential recovery before the peak long run.', structure:['10 km easy — slower than you think necessary'] }),
    day({ type:'long', title:'Long Run', km:33, pace:P.aero, description:'33 km. Near the absolute peak of training. At km 33, most first-timers hit the wall. You\'re training here to NOT hit it on race day.', structure:['33 km', 'Km 0–20: aerobic base (5:45/km)', 'Km 20–30: marathon pace (5:00/km)', 'Km 30–33: strong finish — mirror race experience', 'Nutrition: gel every 30 min from km 12'] }),
    day({ type:'recovery', title:'Recovery Run', km:10, pace:P.rec, description:'10 km easy. Your legs built 33 km worth of mitochondria yesterday. Today you\'re reminding them how easy running feels.', structure:['10 km easy'] }),
  ],
  // Week 15 — 60 km RECOVERY  LR 27 km
  [
    day({ type:'rest', title:'Rest + Mobility', description:'Vital recovery week after two monster weeks. If you feel the urge to add runs, resist it — this rest is the training.', exercises:MOBILITY_BASE }),
    day({ type:'tempo', title:'Tempo Run (lighter)', km:10, pace:P.tp, description:'6 km threshold. Lighter version — maintain the neuromuscular pattern without cumulative fatigue.', structure:['2 km warm-up', '6 km threshold', '2 km cool-down'] }),
    day({ type:'easy', title:'Easy Run + Strength', km:12, pace:P.easy, description:'Deload strength. You may be surprised how strong you feel after the recovery.', exercises:STRENGTH_FULL }),
    day({ type:'intervals', title:'Interval Session (lighter)', km:10, pace:P.iv, description:'4 × 1,000 m — fewer reps, same quality. Stay sharp without accumulating fatigue.', structure:['2 km warm-up', '4 × 1,000 m at 4:05/km with 2-min recovery', '2 km cool-down'] }),
    day({ type:'rest', title:'Rest', description:'Full rest. You\'ve earned every second of it.', }),
    day({ type:'long', title:'Long Run', km:27, pace:P.aero, description:'Recovery long run at 27 km — comfortable, no intensity finish. Run this like a tourist, not a racer.', structure:['27 km easy-aerobic — no pace goal, just time on feet'] }),
    day({ type:'recovery', title:'Recovery Run', km:8, pace:P.rec, description:'8 km easy to close the recovery week.', structure:['8 km easy'] }),
  ],
  // Week 16 — 75 km  LR 35 km (PEAK WEEK)
  [
    day({ type:'rest', title:'Rest + Mobility', description:'PEAK WEEK. Your highest-ever training volume. Everything from the past 15 weeks has been building to this. Respect it.', exercises:MOBILITY_BASE }),
    day({ type:'tempo', title:'Tempo Run', km:13, pace:P.tp, description:'10 km threshold again — same as week 14 but you\'re fitter. It should feel slightly more controlled.', structure:['2 km warm-up', '10 km at 4:15–4:28/km', '2 km cool-down'] }),
    day({ type:'easy', title:'Medium-Long Run + Strength', km:17, pace:P.aero, description:'17 km on Wednesday. A long run in its own right. Back-to-back quality with Thursday.', exercises:STRENGTH_FULL }),
    day({ type:'intervals', title:'Interval Session', km:13, pace:P.iv, description:'4 × 1,600 m — mile repeats. Training your body to sustain race-pace effort for longer chunks.', structure:['2 km warm-up', '4 × 1,600 m at 4:02–4:10/km with 2.5-min jog recovery', '2 km cool-down'] }),
    day({ type:'easy', title:'Easy Run', km:10, pace:P.easy, description:'Easy 10 km. Tomorrow is the furthest you\'ll run before the race.', structure:['10 km easy — protect the legs for Saturday'] }),
    day({ type:'long', title:'Long Run', km:35, pace:P.aero, description:'35 km — your peak training run. The furthest you\'ll go before race day. You will feel this. You will also know that you\'ve done everything you need to do to run 42.2 km on April 4th.', structure:['35 km total', 'Km 0–20: aerobic (5:45–6:00/km)', 'Km 20–32: marathon pace (4:58–5:05/km)', 'Km 32–35: just finish — this is where champions are made', 'Nutrition strategy: gel every 25 min from km 10 + electrolytes every 45 min'] }),
    day({ type:'recovery', title:'Recovery Run', km:10, pace:P.rec, description:'After 35 km, your body will protest. Run anyway. 10 km easy Sunday is how you flush the damage and begin adapting.', structure:['10 km — truly easy, no pushing'] }),
  ],
  // Week 17 — 72 km  LR 33 km
  [
    day({ type:'rest', title:'Rest + Mobility', description:'Post-peak maintenance week. Still hard, but the worst is behind you. The body is now converting all that work into race fitness.', exercises:MOBILITY_BASE }),
    day({ type:'tempo', title:'Marathon-Pace Tempo', km:13, pace:P.mp, description:'Switch tempo style: instead of threshold, run at marathon pace. This teaches your body to run economically at race pace.', structure:['2 km warm-up', '10 km at exact marathon pace (4:58–5:02/km)', '2 km cool-down', 'This should feel controlled — if hard, you\'re going too fast'] }),
    day({ type:'easy', title:'Medium-Long Run + Strength', km:16, pace:P.aero, description:'16 km medium-long. Your aerobic ceiling is near its peak. Strength training focus: injury prevention over strength gains now.', exercises:STRENGTH_FULL }),
    day({ type:'intervals', title:'Interval Session', km:12, pace:P.iv, description:'6 × 800 m — shorter reps to maintain speed without the volume of longer sessions.', structure:['2 km warm-up', '6 × 800 m at 3:52–4:00/km with 75-sec recovery', '2 km cool-down'] }),
    day({ type:'easy', title:'Easy Run', km:9, pace:P.easy, description:'Easy 9 km. Protect the legs. Long run tomorrow.', structure:['9 km easy'] }),
    day({ type:'long', title:'Long Run', km:33, pace:P.aero, description:'33 km — third of your long 30+ km runs. Your legs know how to do this now.', structure:['33 km', 'Km 0–18: aerobic', 'Km 18–30: marathon pace', 'Km 30–33: strong — close this run like you\'d close the race'] }),
    day({ type:'recovery', title:'Recovery Run', km:10, pace:P.rec, description:'10 km easy Sunday.', structure:['10 km easy'] }),
  ],
  // Week 18 — 60 km RECOVERY  LR 28 km
  [
    day({ type:'rest', title:'Rest + Mobility', description:'Phase 3 ends. You have completed the hardest block of training. What you\'ve built in 18 weeks cannot be taken away. Phase 4 sharpens the blade.', exercises:MOBILITY_BASE }),
    day({ type:'tempo', title:'Tempo Run (moderate)', km:10, pace:P.tp, description:'7 km threshold — staying sharp but reducing volume.', structure:['2 km warm-up', '7 km threshold', '2 km cool-down'] }),
    day({ type:'easy', title:'Easy Run + Strength', km:11, pace:P.easy, description:'Maintain strength work. Final phase of strength training — shift focus to explosive single-leg movements.', exercises:STRENGTH_FULL }),
    day({ type:'easy', title:'Easy Run', km:8, pace:P.easy, description:'Easy 8 km recovery.', structure:['8 km easy'] }),
    day({ type:'rest', title:'Rest', description:'Full rest. Phase 4 begins fresh next week.', }),
    day({ type:'long', title:'Long Run', km:28, pace:P.aero, description:'28 km — phase 3 final long run. The reduction feels significant. Embrace the taper instinct that is beginning to develop.', structure:['28 km — easy aerobic, no intensity finish'] }),
    day({ type:'recovery', title:'Recovery Run', km:8, pace:P.rec, description:'8 km easy. Phase 3 complete. You\'re a different runner than you were in October.', structure:['8 km easy'] }),
  ],
]

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 4: SHARPENING  (Weeks 19–22)
// Race-specific, marathon-pace work, reduce volume
// ─────────────────────────────────────────────────────────────────────────────

const PHASE4_WEEKS: DaySpec[][] = [
  // Week 19 — 65 km  LR 32 km
  [
    day({ type:'rest', title:'Rest + Mobility', description:'Phase 4: Sharpening. Every session now has a race-day purpose. Marathon pace becomes your primary intensity tool.', exercises:MOBILITY_BASE }),
    day({ type:'tempo', title:'Marathon-Pace Run', km:14, pace:P.mp, description:'10 km at race pace — this is your dress rehearsal pace. Notice how it feels now vs the first tempo run. Dramatically easier.', structure:['2 km easy', '10 km at 5:00/km', '2 km easy', 'Check: pace should feel "controlled hard" not "all-out"'] }),
    day({ type:'easy', title:'Easy Run + Strength', km:13, pace:P.easy, description:'13 km with final heavy strength week. After this, strength maintenance only.', exercises:STRENGTH_FULL }),
    day({ type:'intervals', title:'Race-Simulation Intervals', km:12, pace:P.iv, description:'Broken marathon pace: simulate the race experience at higher intensity.', structure:['2 km warm-up', '3 × 3,000 m at marathon pace (5:00/km) with 2-min recovery', '2 km cool-down', 'Goal: these should feel controlled — this is NOT threshold pace'] }),
    day({ type:'rest', title:'Rest', description:'Rest. Two quality sessions complete.', }),
    day({ type:'long', title:'Long Run', km:32, pace:P.aero, description:'32 km — sharpening phase long run. Focus on finishing strong: km 25–32 at marathon pace.', structure:['Km 0–20: aerobic base', 'Km 20–30: marathon pace', 'Km 30–32: strong — mirror race finish'] }),
    day({ type:'recovery', title:'Recovery Run', km:10, pace:P.rec, description:'10 km easy. You are 11 weeks from the race.', structure:['10 km easy'] }),
  ],
  // Week 20 — 62 km  LR 30 km
  [
    day({ type:'rest', title:'Rest + Mobility', description:'10 weeks to race. Volume begins its gradual descent. Quality remains high.', exercises:MOBILITY_BASE }),
    day({ type:'tempo', title:'Marathon-Pace Run', km:14, pace:P.mp, description:'12 km marathon pace — your longest at race pace. By now, 5:00/km should feel like a natural cruise control.', structure:['1 km easy', '12 km at 5:00/km', '1 km easy'] }),
    day({ type:'easy', title:'Easy Run + Strength (maintenance)', km:12, pace:P.easy, description:'Strength: maintenance mode. 2 sets instead of 3, focus on single-leg stability.', exercises:['Single-leg RDL 2 × 8 each', 'Bulgarian split squat 2 × 8 each', 'Calf raise 2 × 20', 'Copenhagen plank 2 × 20 sec each', 'Dead bug 2 × 10'] }),
    day({ type:'intervals', title:'Interval Session', km:11, pace:P.iv, description:'5 × 1,000 m — speed maintenance. You don\'t need to build more speed now, just maintain it.', structure:['2 km warm-up', '5 × 1,000 m at 4:00–4:08/km with 90-sec recovery', '2 km cool-down'] }),
    day({ type:'rest', title:'Rest', description:'Full rest.', }),
    day({ type:'long', title:'Long Run', km:30, pace:P.aero, description:'30 km — good solid long run with marathon-pace finish.', structure:['Km 0–18: aerobic', 'Km 18–28: marathon pace (5:00/km)', 'Km 28–30: cool down'] }),
    day({ type:'recovery', title:'Recovery Run', km:9, pace:P.rec, description:'9 km easy.', structure:['9 km easy'] }),
  ],
  // Week 21 — 58 km  LR 28 km
  [
    day({ type:'rest', title:'Rest + Mobility', description:'9 weeks to race. Your fitness is near its ceiling. The taper instinct is building — legs may feel heavy, mood may dip. This is normal. Don\'t add runs.', exercises:MOBILITY_BASE }),
    day({ type:'tempo', title:'Marathon-Pace + Tempo', km:13, pace:P.mp, description:'Combination session: marathon-pace run followed by brief threshold.', structure:['2 km easy', '8 km marathon pace (5:00/km)', '3 km threshold (4:25/km)', '2 km cool-down', 'This session teaches your body to shift gears'] }),
    day({ type:'easy', title:'Easy Run + Strength', km:11, pace:P.easy, description:'Strength maintenance — identical to last week.', exercises:['Single-leg RDL 2 × 8', 'Split squat 2 × 8', 'Calf raise 2 × 20', 'Copenhagen plank 2 × 20 sec'] }),
    day({ type:'intervals', title:'Interval Session', km:10, pace:P.iv, description:'4 × 1,200 m — quality not quantity.', structure:['2 km warm-up', '4 × 1,200 m at 4:00/km with 2-min recovery', '2 km cool-down'] }),
    day({ type:'rest', title:'Rest', description:'Rest.', }),
    day({ type:'long', title:'Long Run', km:28, pace:P.aero, description:'28 km. Volume is reducing — this is the plan working. Don\'t second-guess it by adding more.', structure:['Km 0–16: aerobic', 'Km 16–24: marathon pace', 'Km 24–28: easy finish'] }),
    day({ type:'recovery', title:'Recovery Run', km:9, pace:P.rec, description:'9 km easy.', structure:['9 km easy'] }),
  ],
  // Week 22 — 55 km  LR 26 km
  [
    day({ type:'rest', title:'Rest + Mobility', description:'Final sharpening week before the taper. Give everything this week, then hand the controls over to your body for 3 weeks.', exercises:MOBILITY_BASE }),
    day({ type:'tempo', title:'Final Tempo Block', km:12, pace:P.tp, description:'9 km threshold — a strong, controlled session to conclude the quality phase.', structure:['2 km warm-up', '9 km at 4:20–4:32/km', '2 km cool-down', 'Last quality tempo session of the program'] }),
    day({ type:'easy', title:'Easy Run + Strength', km:11, pace:P.easy, description:'Final full strength session of the program. After this week, strength drops to very light maintenance.', exercises:STRENGTH_FULL }),
    day({ type:'intervals', title:'Final Interval Session', km:10, pace:P.iv, description:'5 × 1,000 m — the last hard interval session before taper. Finish fast. Finish proud.', structure:['2 km warm-up', '5 × 1,000 m at 3:58–4:05/km with 90-sec recovery', '2 km cool-down'] }),
    day({ type:'rest', title:'Rest', description:'Rest. Your final hard week is almost done.', }),
    day({ type:'long', title:'Long Run', km:26, pace:P.aero, description:'26 km — final 20+ km long run. The last major physical test before the race. Run it with gratitude.', structure:['Km 0–14: aerobic', 'Km 14–22: marathon pace', 'Km 22–26: easy — enjoy it'] }),
    day({ type:'recovery', title:'Recovery Run', km:8, pace:P.rec, description:'8 km easy. Phase 4 complete. Taper begins next week.', structure:['8 km easy'] }),
  ],
]

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 5: TAPER  (Weeks 23–25)
// Reduce volume, maintain intensity, peak for race
// ─────────────────────────────────────────────────────────────────────────────

const PHASE5_WEEKS: DaySpec[][] = [
  // Week 23 — 45 km  LR 22 km  (first taper week)
  [
    day({ type:'rest', title:'Rest + Mobility', description:'TAPER BEGINS. Your fitness is set. These 3 weeks are about arriving at the start line rested, sharp, and confident. Trust the process.', exercises:MOBILITY_BASE }),
    day({ type:'tempo', title:'Tempo Run (reduced)', km:9, pace:P.tp, description:'5 km threshold. Sharp but brief. You might feel rusty — ignore it. This is normal taper phenomenon.', structure:['2 km warm-up', '5 km threshold (4:25/km)', '2 km cool-down'] }),
    day({ type:'easy', title:'Easy Run', km:10, pace:P.easy, description:'10 km easy — no strength this week, just running.', structure:['10 km easy', '6 strides at 10km effort'] }),
    day({ type:'easy', title:'Easy Run + Strides', km:8, pace:P.easy, description:'Easy 8 km with sharp strides. Your legs should start feeling fresher.', structure:['8 km easy', '8 × 20-sec strides at 5km effort'] }),
    day({ type:'rest', title:'Rest', description:'Rest. Legs are absorbing 22 weeks of training.', }),
    day({ type:'long', title:'Long Run', km:22, pace:P.aero, description:'22 km — first taper long run. Notice how it feels compared to 35 km in week 16. You\'ve retained the fitness while reducing the stress. This is taper magic.', structure:['22 km aerobic — no marathon-pace work this week'] }),
    day({ type:'recovery', title:'Recovery Run', km:8, pace:P.rec, description:'8 km easy.', structure:['8 km easy'] }),
  ],
  // Week 24 — 35 km  LR 16 km
  [
    day({ type:'rest', title:'Rest + Mobility', description:'2 weeks to race. Your legs will feel heavy, your fitness may feel like it\'s disappearing. It\'s not. Your glycogen stores are topping up. Trust the science.', exercises:MOBILITY_BASE }),
    day({ type:'tempo', title:'Tempo Run (very short)', km:8, pace:P.tp, description:'Just 4 km threshold — a reminder to your body of what fast feels like.', structure:['2 km easy', '4 km at 4:25/km', '2 km easy'] }),
    day({ type:'easy', title:'Easy Run + Marathon Pace', km:10, pace:P.mp, description:'6 km with a 4 km marathon-pace segment. This is your final quality midweek session.', structure:['2 km easy', '4 km at 5:00/km', '2 km easy', 'Should feel very controlled'] }),
    day({ type:'easy', title:'Easy Run', km:6, pace:P.easy, description:'Easy 6 km. Short and easy. Your legs are not tired — they\'re loaded.', structure:['6 km easy', '6 strides'] }),
    day({ type:'rest', title:'Rest', description:'Full rest. Sleep 9 hours. Carb-load starts building this week.', }),
    day({ type:'long', title:'Long Run', km:16, pace:P.aero, description:'Final "long" run — 16 km. You\'ve run 35 km in training. Today\'s 16 should feel like a Tuesday easy run. That\'s the taper working.', structure:['16 km comfortable aerobic', 'No intensity — just time on feet'] }),
    day({ type:'recovery', title:'Recovery Run', km:7, pace:P.rec, description:'7 km easy. Race week begins in 7 days.', structure:['7 km easy'] }),
  ],
  // Week 25 — 25 km  LR 13 km
  [
    day({ type:'rest', title:'Rest + Mobility', description:'RACE WEEK MINUS ONE. You\'re fully fit. There\'s nothing to gain from running now and everything to lose. Protect your legs, sleep more than you think you need.', exercises:MOBILITY_BASE }),
    day({ type:'easy', title:'Easy Run + Strides', km:6, pace:P.easy, description:'Easy 6 km with strides to keep the legs sharp. Race pace should feel slow after this.', structure:['6 km easy', '8 × 15-sec strides at 5km effort with full recovery'] }),
    day({ type:'easy', title:'Easy Run', km:6, pace:P.easy, description:'6 km easy. Begin full carb-loading protocol today (10–12g carbs per kg body weight over the next 3 days).', structure:['6 km easy', 'Carb-load: pasta, rice, bread, oats — fuel the engine'] }),
    day({ type:'easy', title:'Easy Run', km:5, pace:P.easy, description:'5 km easy. Prepare your race kit tonight. Pin on your number. Know your start wave. Know the course.', structure:['5 km easy', 'Race kit check: shoes, socks, shorts, vest, gels, number, timing chip'] }),
    day({ type:'rest', title:'Rest', description:'Full rest. Legs up. Eat well. Sleep. No standing for long periods.', }),
    day({ type:'recovery', title:'Short Shakeout Run', km:3, pace:P.rec, description:'3 km easy shakeout. Many runners skip this and regret it. Tomorrow\'s pace will feel controlled and natural after today\'s movement.', structure:['3 km very easy', '4 × 10-sec strides at race pace', 'Spend the rest of the day off your feet'] }),
    day({ type:'rest', title:'Rest — Race Eve', description:'Complete rest. Lay out your race kit: shoes, number, gels, watch charged. Eat a normal dinner — nothing experimental. Sleep by 9pm.', exercises:['Race kit check: bib, timing chip, shoes, socks, shorts, vest, gels × 5, watch, sunscreen'] }),
  ],
]

// ─── Week 26 (Race Week) ──────────────────────────────────────────────────────
const RACE_WEEK: DaySpec[][] = [
  // Week 26 — RACE WEEK  Target: April 4, 2027
  [
    day({ type:'rest', title:'Rest + Easy Walk', description:'Race week. Do nothing that could risk injury. Short walks only. Hydrate well. Carb-load continues.', }),
    day({ type:'easy', title:'Easy Jog + Strides', km:4, pace:P.rec, description:'4 km very easy jog to keep legs moving. 4 × 10-sec strides at race pace to wake up the fast-twitch fibres.', structure:['4 km easy', '4 x 10-sec strides at 5:00/km with full recovery'] }),
    day({ type:'easy', title:'Easy Jog', km:3, pace:P.rec, description:'3 km easy jog. No strides. Collect your race number if possible. Visualise the course.', structure:['3 km easy — thats it'] }),
    day({ type:'rest', title:'Rest — Final Preparation', description:'Rest. Feet up. Confirm logistics: travel, start time, bag drop. Eat carbs at every meal. Sleep 9 hours.', }),
    day({ type:'rest', title:'Rest — Race Eve', description:'Full rest. Final kit prep. Race strategy printed or memorised. Dinner: pasta or rice at 5pm — nothing heavy or unusual. In bed by 9pm.', exercises:['Kit check: bib, chip, shoes, socks, gels × 5, watch, electrolyte tabs, sunscreen'] }),
    day({ type:'recovery', title:'Morning Shakeout', km:2, pace:P.rec, description:'2 km very easy morning shake-out (if race start is afternoon). Otherwise full rest and extra sleep.', structure:['2 km easy walk/jog only', 'Dynamic warm-up 10 min before race start'] }),
    day({ type:'race', title:'🏁 RACE DAY — Marathon', km:42.2, pace:'4:58–5:02/km', description:'You are ready. 26 weeks of preparation have come to this. Trust your training. Trust your pacing. Trust your body. You have done everything right. Now go run your race.', structure:['Start conservative — everyone goes out too fast in the first 5 km', 'Km 0–10: feel almost too easy (5:05–5:10/km) — it SHOULD feel easy', 'Km 10–21: settle into race pace (5:00–5:05/km)', 'Km 21–32: hold the pace — this is where the race is won or lost', 'Km 32–38: if you feel strong, push. If not, focus on form and breathe.', 'Km 38–42.2: give absolutely everything you have left', 'Nutrition: gel at km 8, 16, 24, 32, 37 + water at every station', 'Run your own race — ignore everyone else\'s pace', 'Smile at km 40 — you\'re almost there.', 'Enjoy every single kilometre. You earned every one of them.'], exercises:['Post-race: protein + carbs within 30 min', 'Walk for 10 min before stopping completely', 'Ice bath or cold water 15 min', 'Elevate legs 30 min', 'You did it.'] }),
  ],
]


// ─────────────────────────────────────────────────────────────────────────────
// PLAN ASSEMBLY
// ─────────────────────────────────────────────────────────────────────────────

const PHASES: { specs: DaySpec[][]; phase: string; phaseNum: number; weeklyKm: number[]; focus: string[] }[] = [
  {
    phase: 'Base', phaseNum: 1, specs: PHASE1_WEEKS,
    weeklyKm: [40, 42, 45, 42, 50, 52],
    focus: [
      'Aerobic foundation & injury prevention',
      'Building weekly mileage habit',
      'Introducing progression runs',
      'Recovery week — supercompensation',
      'Strides & turnover development',
      'Phase capstone — 24 km long run',
    ],
  },
  {
    phase: 'Development', phaseNum: 2, specs: PHASE2_WEEKS,
    weeklyKm: [55, 58, 55, 62, 65, 55],
    focus: [
      'First tempo runs — threshold conditioning',
      'First intervals — speed development',
      'Recovery week',
      'Volume peak + interval progression',
      'Back-to-back quality sessions',
      'Phase 2 recovery — ready for peak',
    ],
  },
  {
    phase: 'Peak Training', phaseNum: 3, specs: PHASE3_WEEKS,
    weeklyKm: [68, 72, 60, 75, 72, 60],
    focus: [
      '32 km long run — mental toughness',
      '33 km long run — near-race simulation',
      'Recovery week — adaptation',
      'PEAK WEEK — 75 km + 35 km long run',
      'Marathon-pace integration',
      'Phase 3 close — tapering begins',
    ],
  },
  {
    phase: 'Sharpening', phaseNum: 4, specs: PHASE4_WEEKS,
    weeklyKm: [65, 62, 58, 55],
    focus: [
      'Race-pace runs replace threshold',
      'Volume reduction, quality maintained',
      'Race specificity + gear shift sessions',
      'Final heavy week — send off',
    ],
  },
  {
    phase: 'Taper', phaseNum: 5, specs: PHASE5_WEEKS,
    weeklyKm: [45, 35, 25],
    focus: [
      'Taper week 1 — let the legs freshen',
      'Taper week 2 — carb loading begins',
      'Final prep week — race-eve protocol',
    ],
  },
  {
    phase: 'Race Week', phaseNum: 6, specs: RACE_WEEK,
    weeklyKm: [15],
    focus: [
      'Race week — everything for Sunday 4 April 2027',
    ],
  },
]

export const MARATHON_PLAN: MarathonWeek[] = []
export const RACE_DATE = '2027-04-04'
export const PLAN_START_DATE = PLAN_START

let globalWeekNum = 1
for (const phase of PHASES) {
  phase.specs.forEach((weekDays, i) => {
    const wStart  = weekStart(globalWeekNum)
    const week: MarathonWeek = {
      weekNum:   globalWeekNum,
      startDate: wStart,
      phase:     phase.phase,
      phaseNum:  phase.phaseNum,
      weeklyKm:  phase.weeklyKm[i],
      focus:     phase.focus[i],
      days:      weekDays.map((session, dayIndex) => ({
        date:     addDays(wStart, dayIndex),
        weekNum:  globalWeekNum,
        dayIndex,
        session,
      })),
    }
    MARATHON_PLAN.push(week)
    globalWeekNum++
  })
}

export const TOTAL_WEEKS = MARATHON_PLAN.length  // 26

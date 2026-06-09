import { useState, useMemo } from 'react';
import { ProgressRing } from '../components/ProgressRing';
import {
  getTodayPlan,
  getProgramWeek,
  resolveWorkoutDay,
  getWeekStart,
  WEEK_SCHEDULE,
  toISODate,
} from '../data/schedule';
import { TRAINING_DAYS } from '../data/training';
import { getDefaultDailyMeals } from '../data/meals';
import {
  getProfile,
  getExerciseLogs,
  getExerciseLogsForDate,
  saveExerciseLog,
  getRunLogs,
  saveRunLog,
  getMealLogsForDate,
  saveMealLog,
} from '../store/storage';
import type {
  Exercise,
  DaySchedule,
  ExerciseLogEntry,
  WorkoutDay,
  MealType,
  RunLogEntry,
} from '../types';

// ─── Date helpers ─────────────────────────────────────────────

const WEEKDAY_LABEL = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
const MONTH_LABEL   = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

function nextKraftAfter(today: Date): { label: string; workoutDay: WorkoutDay } | null {
  for (let i = 1; i <= 7; i++) {
    const next = new Date(today);
    next.setDate(next.getDate() + i);
    const entry = WEEK_SCHEDULE.find(e => e.dayOfWeek === next.getDay() && e.type === 'kraft');
    if (entry?.workoutDay) {
      const training = TRAINING_DAYS.find(t => t.day === entry.workoutDay)!;
      const dayName  = i === 1 ? 'Morgen' : WEEKDAY_LABEL[next.getDay()];
      return { label: `${dayName} · Kraft ${entry.workoutDay} (${training.focus})`, workoutDay: entry.workoutDay };
    }
  }
  return null;
}

// ─── Format helpers ───────────────────────────────────────────

function formatReps(ex: Exercise): string {
  if (ex.isTimeBased) {
    const s = ex.repsMin === ex.repsMax ? `${ex.repsMin}` : `${ex.repsMin}–${ex.repsMax}`;
    return `${s} Sek`;
  }
  const r = ex.repsMin === ex.repsMax ? `${ex.repsMin}` : `${ex.repsMin}–${ex.repsMax}`;
  return ex.perSide ? `${r} Wdh./Seite` : `${r} Wdh.`;
}

function formatRIR(ex: Exercise): string | null {
  if (ex.rirMin === null) return null;
  return ex.rirMin === ex.rirMax ? `RIR ${ex.rirMin}` : `RIR ${ex.rirMin}–${ex.rirMax}`;
}

function formatPauseSec(sec: number): string {
  if (sec === 150) return '2–3 Min';
  if (sec >= 60 && sec % 60 === 0) return `${sec / 60} Min`;
  return `${sec} Sek`;
}

// ─── Exercise input state helpers ─────────────────────────────

type SetInput = { kg: string; reps: string };
type ExInputMap = Record<string, SetInput[]>;

function initExerciseInputs(exercises: Exercise[], logs: ExerciseLogEntry[]): ExInputMap {
  const map: ExInputMap = {};
  for (const ex of exercises) {
    const saved = logs.find(l => l.exerciseId === ex.id);
    map[ex.id] = Array.from({ length: ex.sets }, (_, i) => ({
      kg:   saved?.sets[i]?.weightKg.toString() ?? '',
      reps: saved?.sets[i]?.reps.toString()    ?? '',
    }));
  }
  return map;
}

function hasAnyValidSet(inputs: SetInput[]): boolean {
  return inputs.some(s => s.kg !== '' && s.reps !== '');
}

// ─── Reusable card header ─────────────────────────────────────

function CardHeader({
  title, badge, badgeAccent = false,
}: { title: string; badge?: string; badgeAccent?: boolean }) {
  return (
    <div
      style={{
        padding: '14px 20px',
        borderBottom: '0.5px solid var(--clr-separator)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}
    >
      <span className="headline">{title}</span>
      {badge && (
        <span
          className="footnote"
          style={{ fontWeight: 500, color: badgeAccent ? 'var(--clr-accent)' : 'var(--clr-text-3)' }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

// ─── Exercise Card ────────────────────────────────────────────

interface ExerciseCardProps {
  ex: Exercise;
  index: number;
  isLast: boolean;
  inputs: SetInput[];
  isSaved: boolean;
  onInputChange: (setIdx: number, field: 'kg' | 'reps', value: string) => void;
  onSave: () => void;
}

function ExerciseCard({ ex, index, isLast, inputs, isSaved, onInputChange, onSave }: ExerciseCardProps) {
  const repsStr  = formatReps(ex);
  const rirStr   = formatRIR(ex);
  const pauseStr = formatPauseSec(ex.pauseSec);
  const meta     = [rirStr, `Pause ${pauseStr}`].filter(Boolean).join(' · ');
  const canSave  = hasAnyValidSet(inputs);

  return (
    <div style={{ borderBottom: isLast ? undefined : '0.5px solid var(--clr-separator-2)' }}>
      {/* Exercise header */}
      <div
        style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          padding: '12px 20px 8px',
        }}
      >
        {/* Number badge */}
        <div
          style={{
            width: 26, height: 26, borderRadius: '50%', flexShrink: 0, marginTop: 1,
            background: isSaved ? 'rgba(48,209,88,0.15)' : 'var(--clr-accent-soft)',
            color: isSaved ? '#30D158' : 'var(--clr-accent)',
            fontSize: 12, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.3s ease, color 0.3s ease',
          }}
        >
          {isSaved ? '✓' : index}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="callout" style={{ fontWeight: 600, color: 'var(--clr-text-1)' }}>
            {ex.name}
          </div>
          <div className="footnote" style={{ marginTop: 2, color: 'var(--clr-text-3)' }}>
            {ex.sets} Sätze · {repsStr}{meta ? ` · ${meta}` : ''}
          </div>
          {ex.alternative && (
            <div className="caption" style={{ marginTop: 1, color: 'var(--clr-text-3)' }}>
              Alt: {ex.alternative}
            </div>
          )}
        </div>
      </div>

      {/* Set rows */}
      <div style={{ paddingInline: 20, paddingBottom: 4 }}>
        {inputs.map((set, i) => (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              paddingBlock: 5,
            }}
          >
            <span
              className="footnote"
              style={{ width: 48, color: 'var(--clr-text-3)', flexShrink: 0 }}
            >
              Satz {i + 1}
            </span>
            <input
              className="num-input"
              type="number"
              inputMode="decimal"
              min={0}
              step={0.5}
              placeholder="kg"
              value={set.kg}
              onChange={e => onInputChange(i, 'kg', e.target.value)}
            />
            <span style={{ color: 'var(--clr-text-3)', fontSize: 15, flexShrink: 0 }}>×</span>
            <input
              className="num-input"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Wdh."
              value={set.reps}
              onChange={e => onInputChange(i, 'reps', e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Save button */}
      <div style={{ paddingInline: 20, paddingBottom: 14, paddingTop: 6 }}>
        <button
          onClick={onSave}
          disabled={!canSave}
          style={{
            width: '100%',
            height: 44,
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: !canSave
              ? 'var(--clr-surface-2)'
              : isSaved
              ? 'rgba(48,209,88,0.15)'
              : 'var(--clr-accent-soft)',
            color: !canSave
              ? 'var(--clr-text-3)'
              : isSaved
              ? '#30D158'
              : 'var(--clr-accent)',
            fontSize: 15,
            fontWeight: 600,
            fontFamily: 'inherit',
            cursor: canSave ? 'pointer' : 'default',
            transition: 'background 0.2s ease, color 0.2s ease',
          }}
        >
          {isSaved ? '✓ Gespeichert – Aktualisieren?' : 'Notieren'}
        </button>
      </div>
    </div>
  );
}

// ─── Kraft Section ────────────────────────────────────────────

interface KraftSectionProps {
  workoutDay: WorkoutDay;
  todayExLogs: ExerciseLogEntry[];
  exerciseInputs: ExInputMap;
  onInputChange: (exId: string, setIdx: number, field: 'kg' | 'reps', val: string) => void;
  onSaveExercise: (exId: string) => void;
}

function KraftSection({ workoutDay, todayExLogs, exerciseInputs, onInputChange, onSaveExercise }: KraftSectionProps) {
  const training = TRAINING_DAYS.find(t => t.day === workoutDay)!;
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <CardHeader
        title="Training"
        badge={`Kraft ${workoutDay}`}
        badgeAccent
      />
      <div
        style={{
          padding: '8px 20px 8px',
          borderBottom: '0.5px solid var(--clr-separator-2)',
        }}
      >
        <span className="subhead" style={{ color: 'var(--clr-text-3)' }}>
          {training.focus} · {training.exercises.length} Übungen
        </span>
      </div>
      {training.exercises.map((ex, i) => (
        <ExerciseCard
          key={ex.id}
          ex={ex}
          index={i + 1}
          isLast={i === training.exercises.length - 1}
          inputs={exerciseInputs[ex.id] ?? Array.from({ length: ex.sets }, () => ({ kg: '', reps: '' }))}
          isSaved={todayExLogs.some(l => l.exerciseId === ex.id)}
          onInputChange={(si, f, v) => onInputChange(ex.id, si, f, v)}
          onSave={() => onSaveExercise(ex.id)}
        />
      ))}
    </div>
  );
}

// ─── Lauf Section ─────────────────────────────────────────────

interface LaufSectionProps {
  plan: Extract<DaySchedule, { type: 'lauf' }>;
  duration: string;
  feeling: RunLogEntry['feeling'] | null;
  isSaved: boolean;
  onDurationChange: (v: string) => void;
  onFeelingSelect: (f: RunLogEntry['feeling']) => void;
}

function LaufSection({ plan, duration, feeling, isSaved, onDurationChange, onFeelingSelect }: LaufSectionProps) {
  const { runSpec } = plan;
  const durationLabel = runSpec.durationMinMin === runSpec.durationMinMax
    ? `${runSpec.durationMinMin} Min`
    : `${runSpec.durationMinMin}–${runSpec.durationMinMax} Min`;

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <CardHeader title="Training" badge="Lauf optional" />
      <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Zone 2 info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: 'var(--clr-accent-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
            }}
          >
            🏃
          </div>
          <div>
            <div className="callout" style={{ fontWeight: 600 }}>Zone 2 · locker</div>
            <div className="footnote" style={{ color: 'var(--clr-text-3)', marginTop: 2 }}>
              Ziel: {durationLabel} · Talk Test (du kannst reden)
            </div>
          </div>
        </div>

        {runSpec.hasSprints && (
          <div
            style={{
              borderRadius: 'var(--radius-sm)', background: 'var(--clr-surface-2)',
              padding: '10px 14px',
            }}
          >
            <span className="footnote" style={{ color: 'var(--clr-text-2)' }}>
              + 4× 20 Sek zügig am Ende (optionaler Sprints-Block)
            </span>
          </div>
        )}

        {/* Duration input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="callout" style={{ fontWeight: 500, color: 'var(--clr-text-2)' }}>
            Dauer
          </span>
          <input
            className="num-input"
            style={{ width: 80 }}
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="Min"
            value={duration}
            onChange={e => onDurationChange(e.target.value)}
          />
          <span className="footnote" style={{ color: 'var(--clr-text-3)' }}>Minuten</span>
        </div>

        {/* Feeling toggle */}
        <div>
          <div className="footnote" style={{ marginBottom: 8, color: 'var(--clr-text-3)' }}>
            Wie war's?
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className={`feeling-btn${feeling === 'locker' ? ' selected-locker' : ''}`}
              onClick={() => onFeelingSelect('locker')}
            >
              🙂 Locker
            </button>
            <button
              className={`feeling-btn${feeling === 'anstrengend' ? ' selected-anstrengend' : ''}`}
              onClick={() => onFeelingSelect('anstrengend')}
            >
              😤 Anstrengend
            </button>
          </div>
        </div>

        {/* Save state */}
        {isSaved && (
          <div
            style={{
              borderRadius: 'var(--radius-sm)', background: 'rgba(48,209,88,0.12)',
              padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <span style={{ color: '#30D158', fontSize: 15, fontWeight: 600 }}>
              ✓ Lauf gespeichert
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Rest Card ────────────────────────────────────────────────

function RestCard({ today }: { today: Date }) {
  const next = nextKraftAfter(today);
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <CardHeader title="Training" badge="Ruhetag" />
      <div style={{ padding: '16px 20px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: 'var(--clr-surface-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
          }}
        >
          🌙
        </div>
        <div>
          <div className="callout" style={{ fontWeight: 600 }}>Erholung & Regeneration</div>
          {next && (
            <div className="footnote" style={{ color: 'var(--clr-text-3)', marginTop: 3 }}>
              Nächste Einheit: {next.label}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Summary Ring Card ────────────────────────────────────────

interface SummaryCardProps {
  plan: DaySchedule;
  workoutDay: WorkoutDay | null;
  completed: number;
  total: number;
  programWeek: number;
  isRunSaved: boolean;
}

function SummaryCard({ plan, workoutDay, completed, total, programWeek, isRunSaved }: SummaryCardProps) {
  if (plan.type === 'ruhe') return null;

  const isKraft   = plan.type === 'kraft';
  const progress  = isKraft
    ? (total > 0 ? completed / total : 0)
    : (isRunSaved ? 1 : 0);
  const label     = isKraft ? completed.toString() : (isRunSaved ? '1' : '0');
  const sub       = isKraft ? `/ ${total}` : '/ 1';
  const headline  = isKraft
    ? `Kraft ${workoutDay} · Woche ${programWeek}`
    : `Lauftag · Woche ${programWeek}`;
  const sub2      = isKraft
    ? (completed === total && total > 0
        ? 'Alle Übungen notiert 🎉'
        : `${completed} von ${total} Übungen notiert`)
    : (isRunSaved ? 'Lauf gespeichert ✓' : 'Noch nicht geloggt');

  return (
    <div
      className="card"
      style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px', marginBottom: 16 }}
    >
      <ProgressRing progress={progress} size={84} strokeWidth={8} centerLabel={label} centerSub={sub} />
      <div>
        <div className="headline" style={{ color: 'var(--clr-text-1)' }}>{headline}</div>
        <div className="subhead" style={{ marginTop: 4, color: 'var(--clr-text-3)' }}>{sub2}</div>
      </div>
    </div>
  );
}

// ─── Meals Card ───────────────────────────────────────────────

interface MealsCardProps {
  isWorkday: boolean;
  mealDone: Record<MealType, boolean>;
  onToggle: (type: MealType, mealId: string) => void;
}

function MealsCard({ isWorkday, mealDone, onToggle }: MealsCardProps) {
  const meals = getDefaultDailyMeals(isWorkday);
  const rows: { label: string; type: MealType; meal: (typeof meals)['fruehstueck'] }[] = [
    { label: 'Frühstück',   type: 'fruehstueck',  meal: meals.fruehstueck  },
    { label: 'Mittagessen', type: 'mittagessen',  meal: meals.mittagessen  },
    { label: 'Abendessen',  type: 'abendessen',   meal: meals.abendessen   },
  ];

  return (
    <div className="card">
      <CardHeader
        title="Mahlzeiten"
        badge={`${Object.values(mealDone).filter(Boolean).length} / 3`}
        badgeAccent={Object.values(mealDone).every(Boolean)}
      />
      {rows.map(({ label, type, meal }, i) => {
        const done = mealDone[type] ?? false;
        return (
          <div
            key={type}
            onClick={() => onToggle(type, meal.id)}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 14,
              padding: '13px 20px',
              borderBottom: i < rows.length - 1 ? '0.5px solid var(--clr-separator-2)' : undefined,
              cursor: 'pointer',
              WebkitUserSelect: 'none',
            }}
          >
            {/* Checkbox */}
            <div
              style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                border: done ? 'none' : '1.5px solid var(--clr-separator)',
                background: done ? 'var(--clr-accent)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s ease, border 0.2s ease',
              }}
            >
              {done && <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>✓</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                className="callout"
                style={{
                  fontWeight: 600,
                  color: done ? 'var(--clr-text-3)' : 'var(--clr-text-1)',
                  textDecoration: done ? 'line-through' : 'none',
                  transition: 'color 0.2s ease',
                }}
              >
                {label} · {meal.name}
              </div>
              <div className="footnote" style={{ marginTop: 3, color: 'var(--clr-text-3)' }}>
                {meal.description}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────

export function HeutePage() {
  const today      = new Date();
  const todayStr   = toISODate(today);
  const profile    = getProfile();
  const startDate  = profile.programStartDate ?? getWeekStart(today);
  const programWeek = getProgramWeek(today, startDate);
  const calendarPlan = getTodayPlan(today, startDate);
  const isWorkday  = (profile.workdays ?? []).includes(today.getDay());

  // ── Forgiving rotation (computed once at mount) ────────────
  const workoutDay = useMemo<WorkoutDay | null>(() => {
    if (calendarPlan.type !== 'kraft') return null;
    return resolveWorkoutDay(todayStr, getExerciseLogs());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const activeTraining = workoutDay
    ? (TRAINING_DAYS.find(t => t.day === workoutDay) ?? null)
    : null;

  // ── Logging state ──────────────────────────────────────────
  const [todayExLogs, setTodayExLogs] = useState<ExerciseLogEntry[]>(() =>
    getExerciseLogsForDate(todayStr)
  );

  const [exerciseInputs, setExerciseInputs] = useState<ExInputMap>(() => {
    if (!activeTraining) return {};
    return initExerciseInputs(activeTraining.exercises, getExerciseLogsForDate(todayStr));
  });

  const [mealDone, setMealDone] = useState<Record<MealType, boolean>>(() => {
    const logs = getMealLogsForDate(todayStr);
    return {
      fruehstueck:  logs.find(l => l.mealType === 'fruehstueck')?.done  ?? false,
      mittagessen:  logs.find(l => l.mealType === 'mittagessen')?.done  ?? false,
      abendessen:   logs.find(l => l.mealType === 'abendessen')?.done   ?? false,
      snack:        logs.find(l => l.mealType === 'snack')?.done        ?? false,
    };
  });

  const [runDuration, setRunDuration] = useState<string>(() => {
    const saved = getRunLogs().find(l => l.date === todayStr);
    return saved?.durationMin.toString() ?? '';
  });

  const [runFeeling, setRunFeeling] = useState<RunLogEntry['feeling'] | null>(() => {
    const saved = getRunLogs().find(l => l.date === todayStr);
    return saved?.feeling ?? null;
  });

  const [isRunSaved, setIsRunSaved] = useState(() =>
    getRunLogs().some(l => l.date === todayStr)
  );

  // ── Handlers ───────────────────────────────────────────────

  function handleInputChange(exId: string, setIdx: number, field: 'kg' | 'reps', value: string) {
    setExerciseInputs(prev => ({
      ...prev,
      [exId]: prev[exId].map((s, i) => i === setIdx ? { ...s, [field]: value } : s),
    }));
  }

  function handleSaveExercise(exId: string) {
    if (!workoutDay) return;
    const inputs = exerciseInputs[exId] ?? [];
    const sets = inputs
      .filter(s => s.kg !== '' && s.reps !== '')
      .map(s => ({ weightKg: parseFloat(s.kg), reps: parseInt(s.reps, 10) }))
      .filter(s => !isNaN(s.weightKg) && !isNaN(s.reps));
    if (sets.length === 0) return;
    saveExerciseLog(todayStr, workoutDay, exId, sets);
    setTodayExLogs(getExerciseLogsForDate(todayStr));
  }

  function handleToggleMeal(type: MealType, mealId: string) {
    const next = !mealDone[type];
    saveMealLog(todayStr, type, mealId, next);
    setMealDone(prev => ({ ...prev, [type]: next }));
  }

  function handleRunDurationChange(val: string) {
    setRunDuration(val);
    const dur = parseInt(val, 10);
    if (!isNaN(dur) && dur > 0 && runFeeling) {
      saveRunLog(todayStr, dur, runFeeling);
      setIsRunSaved(true);
    }
  }

  function handleFeelingSelect(feeling: RunLogEntry['feeling']) {
    setRunFeeling(feeling);
    const dur = parseInt(runDuration, 10);
    if (!isNaN(dur) && dur > 0) {
      saveRunLog(todayStr, dur, feeling);
      setIsRunSaved(true);
    }
  }

  // ── Progress ───────────────────────────────────────────────
  const totalExercises     = activeTraining?.exercises.length ?? 0;
  const completedExercises = activeTraining
    ? activeTraining.exercises.filter(ex => todayExLogs.some(l => l.exerciseId === ex.id)).length
    : 0;

  // ── Effective plan for display ─────────────────────────────
  const effectivePlan: DaySchedule = workoutDay
    ? { type: 'kraft', workoutDay, training: activeTraining! }
    : calendarPlan;

  // ── Render ─────────────────────────────────────────────────
  const weekday = WEEKDAY_LABEL[today.getDay()];
  const date    = `${today.getDate()}. ${MONTH_LABEL[today.getMonth()]}`;

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch' as const,
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div style={{ padding: '20px 20px 40px' }}>

        {/* Large Title */}
        <div style={{ marginBottom: 28 }}>
          <h1 className="large-title" style={{ margin: 0 }}>Heute</h1>
          <p className="subhead" style={{ margin: '4px 0 0', color: 'var(--clr-text-3)' }}>
            {weekday}, {date}
          </p>
        </div>

        {/* Summary ring */}
        <SummaryCard
          plan={effectivePlan}
          workoutDay={workoutDay}
          completed={completedExercises}
          total={totalExercises}
          programWeek={programWeek}
          isRunSaved={isRunSaved}
        />

        {/* Day-specific content */}
        {effectivePlan.type === 'kraft' && workoutDay && (
          <KraftSection
            workoutDay={workoutDay}
            todayExLogs={todayExLogs}
            exerciseInputs={exerciseInputs}
            onInputChange={handleInputChange}
            onSaveExercise={handleSaveExercise}
          />
        )}
        {calendarPlan.type === 'lauf' && (
          <LaufSection
            plan={calendarPlan}
            duration={runDuration}
            feeling={runFeeling}
            isSaved={isRunSaved}
            onDurationChange={handleRunDurationChange}
            onFeelingSelect={handleFeelingSelect}
          />
        )}
        {calendarPlan.type === 'ruhe' && <RestCard today={today} />}

        {/* Meals */}
        <MealsCard
          isWorkday={isWorkday}
          mealDone={mealDone}
          onToggle={handleToggleMeal}
        />

      </div>
    </div>
  );
}

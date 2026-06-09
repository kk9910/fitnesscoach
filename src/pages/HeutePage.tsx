import { useState, useMemo, useEffect } from 'react';
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
import { MEALS, getMealsOfType, getDefaultDailyMeals } from '../data/meals';
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

// ─── Meal state helpers ───────────────────────────────────────

type MealSlotState = { done: boolean; mealId: string };

function initMealSlots(dateStr: string, workday: boolean): Record<MealType, MealSlotState> {
  const logs     = getMealLogsForDate(dateStr);
  const defaults = getDefaultDailyMeals(workday);
  const resolve  = (type: MealType, fallbackId: string): MealSlotState => ({
    done:   logs.find(l => l.mealType === type)?.done   ?? false,
    mealId: logs.find(l => l.mealType === type)?.mealId ?? fallbackId,
  });
  return {
    fruehstueck: resolve('fruehstueck', defaults.fruehstueck.id),
    mittagessen: resolve('mittagessen', defaults.mittagessen.id),
    abendessen:  resolve('abendessen',  defaults.abendessen.id),
    snack:       resolve('snack',       'sn-skyr'),
  };
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

// ─── Nav arrow ────────────────────────────────────────────────

function NavArrow({ direction, onClick }: { direction: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={direction === 'left' ? 'Vorheriger Tag' : 'Nächster Tag'}
      style={{
        width: 44, height: 44, flexShrink: 0,
        border: 'none', background: 'transparent',
        color: 'var(--clr-accent)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 10, marginTop: 4,
      }}
    >
      <svg width="11" height="18" viewBox="0 0 11 18" fill="none">
        {direction === 'left'
          ? <path d="M9 2L2 9L9 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          : <path d="M2 2L9 9L2 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        }
      </svg>
    </button>
  );
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
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 20px 8px' }}>
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

      <div style={{ paddingInline: 20, paddingBottom: 4 }}>
        {inputs.map((set, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBlock: 5 }}>
            <span className="footnote" style={{ width: 48, color: 'var(--clr-text-3)', flexShrink: 0 }}>
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

      <div style={{ paddingInline: 20, paddingBottom: 14, paddingTop: 6 }}>
        <button
          onClick={onSave}
          disabled={!canSave}
          style={{
            width: '100%', height: 44,
            borderRadius: 'var(--radius-sm)', border: 'none',
            background: !canSave ? 'var(--clr-surface-2)' : isSaved ? 'rgba(48,209,88,0.15)' : 'var(--clr-accent-soft)',
            color: !canSave ? 'var(--clr-text-3)' : isSaved ? '#30D158' : 'var(--clr-accent)',
            fontSize: 15, fontWeight: 600, fontFamily: 'inherit',
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
      <CardHeader title="Training" badge={`Kraft ${workoutDay}`} badgeAccent />
      <div style={{ padding: '8px 20px 8px', borderBottom: '0.5px solid var(--clr-separator-2)' }}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: 'var(--clr-accent-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
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
          <div style={{ borderRadius: 'var(--radius-sm)', background: 'var(--clr-surface-2)', padding: '10px 14px' }}>
            <span className="footnote" style={{ color: 'var(--clr-text-2)' }}>
              + 4× 20 Sek zügig am Ende (optionaler Sprints-Block)
            </span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="callout" style={{ fontWeight: 500, color: 'var(--clr-text-2)' }}>Dauer</span>
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

        <div>
          <div className="footnote" style={{ marginBottom: 8, color: 'var(--clr-text-3)' }}>Wie war's?</div>
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

        {isSaved && (
          <div style={{ borderRadius: 'var(--radius-sm)', background: 'rgba(48,209,88,0.12)', padding: '10px 14px' }}>
            <span style={{ color: '#30D158', fontSize: 15, fontWeight: 600 }}>✓ Lauf gespeichert</span>
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

  const isKraft  = plan.type === 'kraft';
  const progress = isKraft ? (total > 0 ? completed / total : 0) : (isRunSaved ? 1 : 0);
  const label    = isKraft ? completed.toString() : (isRunSaved ? '1' : '0');
  const sub      = isKraft ? `/ ${total}` : '/ 1';
  const headline = isKraft
    ? `Kraft ${workoutDay} · Woche ${programWeek}`
    : `Lauftag · Woche ${programWeek}`;
  const sub2     = isKraft
    ? (completed === total && total > 0 ? 'Alle Übungen notiert 🎉' : `${completed} von ${total} Übungen notiert`)
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
  mealSlots: Record<MealType, MealSlotState>;
  onToggleDone: (type: MealType) => void;
  onSwap: (type: MealType, newMealId: string) => void;
  kcalMin: number;
  kcalMax: number;
  proteinTarget: number;
}

function MealsCard({ mealSlots, onToggleDone, onSwap, kcalMin, kcalMax, proteinTarget }: MealsCardProps) {
  const [expanded, setExpanded] = useState<MealType | null>(null);

  const rows: { label: string; type: MealType }[] = [
    { label: 'Frühstück',   type: 'fruehstueck' },
    { label: 'Mittagessen', type: 'mittagessen' },
    { label: 'Abendessen',  type: 'abendessen'  },
    { label: 'Snack',       type: 'snack'        },
  ];

  const doneCount = rows.filter(({ type }) => mealSlots[type].done).length;

  // Daily nutrition total across all 4 slots
  const total = rows.reduce(
    (acc, { type }) => {
      const meal = MEALS.find(m => m.id === mealSlots[type].mealId);
      if (!meal) return acc;
      return {
        kcal:     acc.kcal     + meal.nutrition.kcal,
        proteinG: acc.proteinG + meal.nutrition.proteinG,
        carbsG:   acc.carbsG   + meal.nutrition.carbsG,
        fatG:     acc.fatG     + meal.nutrition.fatG,
      };
    },
    { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  );

  const kcalOk = total.kcal >= kcalMin && total.kcal <= kcalMax;
  const proteinOk = total.proteinG >= proteinTarget;

  return (
    <div className="card">
      <CardHeader
        title="Mahlzeiten"
        badge={`${doneCount} / 4`}
        badgeAccent={doneCount === 4}
      />

      {rows.map(({ label, type }, rowIdx) => {
        const slot         = mealSlots[type];
        const meal         = MEALS.find(m => m.id === slot.mealId)!;
        const alternatives = getMealsOfType(type);
        const isExpanded   = expanded === type;
        const isLastRow    = rowIdx === rows.length - 1;

        return (
          <div
            key={type}
            style={{ borderBottom: (!isLastRow || isExpanded) ? '0.5px solid var(--clr-separator-2)' : undefined }}
          >
            {/* Compact row */}
            <div
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 14,
                padding: '13px 20px',
                cursor: 'pointer',
                WebkitUserSelect: 'none',
              }}
              onClick={() => setExpanded(isExpanded ? null : type)}
            >
              {/* Done circle — tap to toggle without expanding */}
              <div
                onClick={e => { e.stopPropagation(); onToggleDone(type); }}
                style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                  border: slot.done ? 'none' : '1.5px solid var(--clr-separator)',
                  background: slot.done ? 'var(--clr-accent)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s ease',
                  cursor: 'pointer',
                }}
              >
                {slot.done && <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>✓</span>}
              </div>

              {/* Meal info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  className="callout"
                  style={{
                    fontWeight: 600,
                    color: slot.done ? 'var(--clr-text-3)' : 'var(--clr-text-1)',
                    textDecoration: slot.done ? 'line-through' : 'none',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {label} · {meal.name}
                </div>
                <div className="footnote" style={{ marginTop: 2, color: 'var(--clr-text-3)' }}>
                  {meal.description}
                </div>
                <div className="caption" style={{ marginTop: 4, color: 'var(--clr-text-3)' }}>
                  ca. {meal.nutrition.kcal} kcal · {meal.nutrition.proteinG}g E · {meal.nutrition.carbsG}g KH · {meal.nutrition.fatG}g F
                </div>
              </div>

              {/* Expand chevron */}
              <svg
                width="12" height="12" viewBox="0 0 12 12" fill="none"
                style={{
                  flexShrink: 0, marginTop: 7, color: 'var(--clr-text-3)',
                  transform: isExpanded ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease',
                }}
              >
                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Alternatives panel */}
            {isExpanded && (
              <div style={{ background: 'var(--clr-surface-2)', borderTop: '0.5px solid var(--clr-separator-2)' }}>
                <div style={{ padding: '8px 20px 4px' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--clr-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Andere Option wählen
                  </span>
                </div>
                {alternatives.map((alt) => {
                  const isSelected = alt.id === slot.mealId;
                  return (
                    <div
                      key={alt.id}
                      onClick={() => { onSwap(type, alt.id); setExpanded(null); }}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 14,
                        padding: '11px 20px',
                        borderTop: '0.5px solid var(--clr-separator-2)',
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(0,122,255,0.06)' : 'transparent',
                        WebkitUserSelect: 'none',
                      }}
                    >
                      {/* Radio dot */}
                      <div
                        style={{
                          width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                          border: isSelected ? 'none' : '1.5px solid var(--clr-separator)',
                          background: isSelected ? 'var(--clr-accent)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {isSelected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          className="subhead"
                          style={{ fontWeight: isSelected ? 600 : 400, color: isSelected ? 'var(--clr-accent)' : 'var(--clr-text-1)' }}
                        >
                          {alt.name}
                        </div>
                        <div className="caption" style={{ marginTop: 3, color: 'var(--clr-text-3)' }}>
                          ca. {alt.nutrition.kcal} kcal · {alt.nutrition.proteinG}g E · {alt.nutrition.carbsG}g KH · {alt.nutrition.fatG}g F
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Daily nutrition: planned vs target */}
      <div
        style={{
          padding: '12px 20px',
          borderTop: '0.5px solid var(--clr-separator)',
          background: 'var(--clr-surface-2)',
        }}
      >
        {/* Row 1: planned total */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--clr-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>
            Geplant
          </span>
          <span className="footnote" style={{ fontWeight: 600, color: kcalOk ? '#30D158' : 'var(--clr-text-2)' }}>
            ca. {total.kcal} kcal ·{' '}
            <span style={{ color: proteinOk ? '#30D158' : 'var(--clr-text-2)' }}>{total.proteinG}g E</span>
          </span>
          <span className="footnote" style={{ color: 'var(--clr-text-3)' }}>
            · {total.carbsG}g KH · {total.fatG}g F
          </span>
        </div>
        {/* Row 2: target */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--clr-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>
            Ziel
          </span>
          <span className="footnote" style={{ color: 'var(--clr-text-3)' }}>
            ca. {kcalMin}–{kcalMax} kcal · ~{proteinTarget}g E
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────

export function HeutePage() {
  const realToday = useMemo(() => new Date(), []);

  const [offsetDays, setOffsetDays] = useState(0);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  // Derived view date
  const viewDate    = new Date(realToday);
  viewDate.setDate(viewDate.getDate() + offsetDays);
  const viewDateStr = toISODate(viewDate);

  // Profile & plan
  const profile      = getProfile();
  const startDate    = profile.programStartDate ?? getWeekStart(realToday);
  const programWeek  = getProgramWeek(viewDate, startDate);
  const calendarPlan = getTodayPlan(viewDate, startDate);
  const isWorkday    = (profile.workdays ?? []).includes(viewDate.getDay());

  // Forgiving rotation for all days (past, today, future)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const workoutDay = useMemo<WorkoutDay | null>(() => {
    if (calendarPlan.type !== 'kraft') return null;
    return resolveWorkoutDay(viewDateStr, getExerciseLogs());
  }, [offsetDays]);

  const activeTraining = workoutDay
    ? (TRAINING_DAYS.find(t => t.day === workoutDay) ?? null)
    : null;

  // ── Logging state ──────────────────────────────────────────
  const [todayExLogs, setTodayExLogs] = useState<ExerciseLogEntry[]>(() =>
    getExerciseLogsForDate(viewDateStr)
  );
  const [exerciseInputs, setExerciseInputs] = useState<ExInputMap>(() => {
    if (!activeTraining) return {};
    return initExerciseInputs(activeTraining.exercises, getExerciseLogsForDate(viewDateStr));
  });
  const [mealSlots, setMealSlots] = useState<Record<MealType, MealSlotState>>(() =>
    initMealSlots(viewDateStr, isWorkday)
  );
  const [runDuration, setRunDuration] = useState<string>(() => {
    const saved = getRunLogs().find(l => l.date === viewDateStr);
    return saved?.durationMin.toString() ?? '';
  });
  const [runFeeling, setRunFeeling] = useState<RunLogEntry['feeling'] | null>(() => {
    const saved = getRunLogs().find(l => l.date === viewDateStr);
    return saved?.feeling ?? null;
  });
  const [isRunSaved, setIsRunSaved] = useState(() =>
    getRunLogs().some(l => l.date === viewDateStr)
  );

  // Re-initialise all logging state when the selected date changes
  useEffect(() => {
    const exLogs   = getExerciseLogsForDate(viewDateStr);
    const training = workoutDay ? TRAINING_DAYS.find(t => t.day === workoutDay) ?? null : null;
    setTodayExLogs(exLogs);
    setExerciseInputs(training ? initExerciseInputs(training.exercises, exLogs) : {});
    setMealSlots(initMealSlots(viewDateStr, isWorkday));
    const savedRun = getRunLogs().find(l => l.date === viewDateStr);
    setRunDuration(savedRun?.durationMin.toString() ?? '');
    setRunFeeling(savedRun?.feeling ?? null);
    setIsRunSaved(!!savedRun);
  }, [viewDateStr, workoutDay]); // eslint-disable-line react-hooks/exhaustive-deps

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
    saveExerciseLog(viewDateStr, workoutDay, exId, sets);
    setTodayExLogs(getExerciseLogsForDate(viewDateStr));
  }

  function handleToggleMeal(type: MealType) {
    const next = !mealSlots[type].done;
    saveMealLog(viewDateStr, type, mealSlots[type].mealId, next);
    setMealSlots(prev => ({ ...prev, [type]: { ...prev[type], done: next } }));
  }

  function handleSwapMeal(type: MealType, newMealId: string) {
    saveMealLog(viewDateStr, type, newMealId, mealSlots[type].done);
    setMealSlots(prev => ({ ...prev, [type]: { ...prev[type], mealId: newMealId } }));
  }

  function handleRunDurationChange(val: string) {
    setRunDuration(val);
    const dur = parseInt(val, 10);
    if (!isNaN(dur) && dur > 0 && runFeeling) {
      saveRunLog(viewDateStr, dur, runFeeling);
      setIsRunSaved(true);
    }
  }

  function handleFeelingSelect(feeling: RunLogEntry['feeling']) {
    setRunFeeling(feeling);
    const dur = parseInt(runDuration, 10);
    if (!isNaN(dur) && dur > 0) {
      saveRunLog(viewDateStr, dur, feeling);
      setIsRunSaved(true);
    }
  }

  // ── Swipe ──────────────────────────────────────────────────

  function handleTouchStart(e: React.TouchEvent) {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    setTouchStart(null);
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      setOffsetDays(o => o + (dx < 0 ? 1 : -1));
    }
  }

  // ── Progress ───────────────────────────────────────────────
  const totalExercises     = activeTraining?.exercises.length ?? 0;
  const completedExercises = activeTraining
    ? activeTraining.exercises.filter(ex => todayExLogs.some(l => l.exerciseId === ex.id)).length
    : 0;

  // ── Effective plan ─────────────────────────────────────────
  const effectivePlan: DaySchedule = workoutDay
    ? { type: 'kraft', workoutDay, training: activeTraining! }
    : calendarPlan;

  // ── Title / subtitle ───────────────────────────────────────
  const weekday  = WEEKDAY_LABEL[viewDate.getDay()];
  const dateStr  = `${viewDate.getDate()}. ${MONTH_LABEL[viewDate.getMonth()]}`;
  const title    =
    offsetDays === 0  ? 'Heute'   :
    offsetDays === -1 ? 'Gestern' :
    offsetDays === 1  ? 'Morgen'  :
    weekday;
  const subtitle = (offsetDays >= -1 && offsetDays <= 1)
    ? `${weekday}, ${dateStr}`
    : dateStr;

  // ── Render ─────────────────────────────────────────────────
  return (
    <div
      style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch' as const,
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div style={{ padding: '20px 20px 40px' }}>

        {/* Navigation header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 28 }}>
          <NavArrow direction="left" onClick={() => setOffsetDays(o => o - 1)} />
          <div style={{ flex: 1, paddingInline: 4 }}>
            <h1 className="large-title" style={{ margin: 0 }}>{title}</h1>
            <p className="subhead" style={{ margin: '4px 0 0', color: 'var(--clr-text-3)' }}>{subtitle}</p>
          </div>
          <NavArrow direction="right" onClick={() => setOffsetDays(o => o + 1)} />
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
        {calendarPlan.type === 'ruhe' && <RestCard today={realToday} />}

        {/* Meals */}
        <MealsCard
          mealSlots={mealSlots}
          onToggleDone={handleToggleMeal}
          onSwap={handleSwapMeal}
          kcalMin={profile.kcalTargetMin ?? 2100}
          kcalMax={profile.kcalTargetMax ?? 2300}
          proteinTarget={profile.proteinTargetG ?? 150}
        />

      </div>
    </div>
  );
}

import type { WeekScheduleEntry, DaySchedule, RunSpec, WorkoutDay, ExerciseLogEntry } from '../types';
import { TRAINING_DAYS, RUN_PLAN } from './training';

// ─────────────────────────────────────────────────────────────
// Source: content/trainingsplan-recomp.md – "Wochenstruktur"
//
//  Mo  → Kraft A   Di  → Ruhe
//  Mi  → Kraft B   Do  → Lauf optional
//  Fr  → Kraft C   Sa  → Ruhe
//  So  → Lauf optional
// ─────────────────────────────────────────────────────────────

export const WEEK_SCHEDULE: WeekScheduleEntry[] = [
  { dayOfWeek: 1, type: 'kraft',  workoutDay: 'A'              },  // Montag
  { dayOfWeek: 2, type: 'ruhe'                                 },  // Dienstag
  { dayOfWeek: 3, type: 'kraft',  workoutDay: 'B'              },  // Mittwoch
  { dayOfWeek: 4, type: 'lauf',   laufOptional: true           },  // Donnerstag
  { dayOfWeek: 5, type: 'kraft',  workoutDay: 'C'              },  // Freitag
  { dayOfWeek: 6, type: 'ruhe'                                 },  // Samstag
  { dayOfWeek: 0, type: 'lauf',   laufOptional: true           },  // Sonntag
];

// ─── Helpers ──────────────────────────────────────────────────

/** Calculates the current programme week (1-indexed). Returns 1 if not started yet. */
export function getProgramWeek(today: Date, programStartDate: string | null | undefined): number {
  if (!programStartDate) return 1;
  const start = new Date(programStartDate);
  const diffDays = Math.floor((today.getTime() - start.getTime()) / 86_400_000);
  return Math.max(1, Math.floor(diffDays / 7) + 1);
}

/** Returns the RunSpec (primary run / run1) for the given programme week. */
export function getRunSpecForWeek(programWeek: number): RunSpec {
  const spec =
    RUN_PLAN.find(
      w => programWeek >= w.weekFrom && (w.weekTo === null || programWeek <= w.weekTo),
    ) ?? RUN_PLAN[RUN_PLAN.length - 1];
  return spec.run1;
}

/**
 * Returns what's on the programme for a given date.
 * Used by HeutePage to know what to show.
 */
export function getTodayPlan(
  today: Date,
  programStartDate: string | null | undefined,
): DaySchedule {
  const dow = today.getDay();  // 0=Sun … 6=Sat
  const entry = WEEK_SCHEDULE.find(e => e.dayOfWeek === dow);

  if (!entry || entry.type === 'ruhe') return { type: 'ruhe' };

  if (entry.type === 'kraft' && entry.workoutDay) {
    const training = TRAINING_DAYS.find(t => t.day === entry.workoutDay)!;
    return { type: 'kraft', workoutDay: entry.workoutDay, training };
  }

  if (entry.type === 'lauf') {
    const week = getProgramWeek(today, programStartDate);
    return { type: 'lauf', optional: true, runSpec: getRunSpecForWeek(week) };
  }

  return { type: 'ruhe' };
}

/** Human-readable label for a day schedule (used in the UI). */
export function dayScheduleLabel(plan: DaySchedule): string {
  if (plan.type === 'ruhe')  return 'Ruhetag';
  if (plan.type === 'lauf')  return 'Lauftag (optional)';
  return `Kraft ${plan.workoutDay} – ${plan.training.focus}`;
}

/** ISO date string "YYYY-MM-DD" for a given Date. */
export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** ISO date of the Monday of the week containing `d`. */
export function getWeekStart(d: Date): string {
  const copy = new Date(d);
  const dow  = copy.getDay();
  copy.setDate(copy.getDate() - (dow === 0 ? 6 : dow - 1));
  return toISODate(copy);
}

/**
 * Forgiving A→B→C→A rotation.
 *
 * 1. If there are already logs for `todayStr`, keep that workout day (session continuity).
 * 2. Otherwise find the most recent logged workout, then count how many Kraft calendar
 *    days (Mon/Wed/Fri per WEEK_SCHEDULE) fall strictly after that log up to and
 *    including `todayStr`, and advance the rotation by that many steps.
 *    This correctly handles past catch-up days and future preview days.
 * 3. No prior logs → fall back to the schedule's own A/B/C assignment for that weekday.
 */
export function resolveWorkoutDay(
  todayStr: string,
  allExerciseLogs: ExerciseLogEntry[],
): WorkoutDay {
  // Already started today → stay consistent
  const todayLog = allExerciseLogs.find(l => l.date === todayStr);
  if (todayLog) return todayLog.workoutDay;

  // Find most recent workout before today
  const prev = allExerciseLogs
    .filter(l => l.date < todayStr)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (prev.length === 0) {
    // No prior logs: use the schedule's default assignment for this weekday
    const dow = new Date(todayStr + 'T12:00:00').getDay();
    const entry = WEEK_SCHEDULE.find(e => e.dayOfWeek === dow && e.type === 'kraft');
    return (entry?.workoutDay as WorkoutDay) ?? 'A';
  }

  const lastLog = prev[0];
  const seq: WorkoutDay[] = ['A', 'B', 'C'];

  // Kraft weekday indices from the schedule
  const kraftDows = new Set(
    WEEK_SCHEDULE.filter(e => e.type === 'kraft').map(e => e.dayOfWeek),
  );

  // Count Kraft calendar days strictly after lastLog.date up to and including todayStr
  let steps = 0;
  const cursor = new Date(lastLog.date + 'T12:00:00');
  const end    = new Date(todayStr    + 'T12:00:00');
  cursor.setDate(cursor.getDate() + 1);
  while (cursor <= end) {
    if (kraftDows.has(cursor.getDay())) steps++;
    cursor.setDate(cursor.getDate() + 1);
  }

  return seq[(seq.indexOf(lastLog.workoutDay) + steps) % 3];
}

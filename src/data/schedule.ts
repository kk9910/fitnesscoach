import type { WeekScheduleEntry, DaySchedule, RunSpec } from '../types';
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

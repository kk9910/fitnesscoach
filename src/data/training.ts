import type { TrainingDay, RunWeekSpec } from '../types';

// ─────────────────────────────────────────────────────────────
// Source: content/trainingsplan-recomp.md
// ─────────────────────────────────────────────────────────────

export const TRAINING_DAYS: TrainingDay[] = [
  // ── Kraft A – Ganzkörper (Push-Schwerpunkt) ───────────────
  {
    day: 'A',
    focus: 'Push-Schwerpunkt',
    exercises: [
      {
        id: 'a-kniebeuge',
        name: 'Kniebeuge (Langhantel)',
        sets: 3, repsMin: 6, repsMax: 10,
        isTimeBased: false, perSide: false,
        rirMin: 2, rirMax: 3,
        pauseSec: 150,   // 2–3 Min
        alternative: 'Beinpresse',
      },
      {
        id: 'a-bankdruecken',
        name: 'Bankdrücken (Langhantel)',
        sets: 3, repsMin: 6, repsMax: 10,
        isTimeBased: false, perSide: false,
        rirMin: 1, rirMax: 2,
        pauseSec: 120,   // 2 Min
        alternative: 'Brustpresse Maschine',
      },
      {
        id: 'a-latzug',
        name: 'Latzug breit',
        sets: 3, repsMin: 8, repsMax: 12,
        isTimeBased: false, perSide: false,
        rirMin: 1, rirMax: 2,
        pauseSec: 90,
        alternative: 'Klimmzug (assistiert)',
      },
      {
        id: 'a-schulterdruecken',
        name: 'Schulterdrücken (Kurzhantel)',
        sets: 3, repsMin: 8, repsMax: 12,
        isTimeBased: false, perSide: false,
        rirMin: 1, rirMax: 2,
        pauseSec: 90,
        alternative: 'Schulterpresse Maschine',
      },
      {
        id: 'a-beinbeuger',
        name: 'Beinbeuger liegend',
        sets: 3, repsMin: 10, repsMax: 15,
        isTimeBased: false, perSide: false,
        rirMin: 1, rirMax: 2,
        pauseSec: 60,
        alternative: null,
      },
      {
        id: 'a-plank',
        name: 'Plank',
        sets: 3, repsMin: 30, repsMax: 45,
        isTimeBased: true, perSide: false,
        rirMin: null, rirMax: null,
        pauseSec: 45,
        alternative: 'Ab-Wheel',
      },
    ],
  },

  // ── Kraft B – Ganzkörper (Hinge/Pull-Schwerpunkt) ─────────
  {
    day: 'B',
    focus: 'Hinge/Pull-Schwerpunkt',
    exercises: [
      {
        id: 'b-kreuzheben',
        name: 'Rumänisches Kreuzheben',
        sets: 3, repsMin: 6, repsMax: 10,
        isTimeBased: false, perSide: false,
        rirMin: 2, rirMax: 3,
        pauseSec: 150,   // 2–3 Min
        alternative: 'Hyperextension',
      },
      {
        id: 'b-rudern',
        name: 'Rudern vorgebeugt (Langhantel)',
        sets: 3, repsMin: 8, repsMax: 12,
        isTimeBased: false, perSide: false,
        rirMin: 1, rirMax: 2,
        pauseSec: 120,   // 2 Min
        alternative: 'Kabelrudern sitzend',
      },
      {
        id: 'b-schraegbank',
        name: 'Schrägbankdrücken (Kurzhantel)',
        sets: 3, repsMin: 8, repsMax: 12,
        isTimeBased: false, perSide: false,
        rirMin: 1, rirMax: 2,
        pauseSec: 90,
        alternative: 'Schräge Brustpresse',
      },
      {
        id: 'b-ausfallschritte',
        name: 'Ausfallschritte (Kurzhantel)',
        sets: 3, repsMin: 10, repsMax: 10,
        isTimeBased: false, perSide: true,   // 10/Bein
        rirMin: 2, rirMax: 2,
        pauseSec: 90,
        alternative: 'Beinpresse einbeinig',
      },
      {
        id: 'b-bizeps',
        name: 'Bizeps-Curls (Kurzhantel)',
        sets: 3, repsMin: 10, repsMax: 15,
        isTimeBased: false, perSide: false,
        rirMin: 1, rirMax: 2,
        pauseSec: 60,
        alternative: 'Kabel-Curls',
      },
      {
        id: 'b-kabel-crunch',
        name: 'Kabel-Crunch',
        sets: 3, repsMin: 12, repsMax: 15,
        isTimeBased: false, perSide: false,
        rirMin: 1, rirMax: 2,
        pauseSec: 45,
        alternative: 'Crunch am Boden',
      },
    ],
  },

  // ── Kraft C – Ganzkörper (Mix) ────────────────────────────
  {
    day: 'C',
    focus: 'Mix',
    exercises: [
      {
        id: 'c-beinpresse',
        name: 'Beinpresse',
        sets: 3, repsMin: 10, repsMax: 12,
        isTimeBased: false, perSide: false,
        rirMin: 2, rirMax: 2,
        pauseSec: 120,   // 2 Min
        alternative: 'Goblet Squat',
      },
      {
        id: 'c-schulterdruecken-stehend',
        name: 'Schulterdrücken stehend (Langhantel)',
        sets: 3, repsMin: 8, repsMax: 12,
        isTimeBased: false, perSide: false,
        rirMin: 1, rirMax: 2,
        pauseSec: 120,   // 2 Min
        alternative: 'Maschine',
      },
      {
        id: 'c-klimmzug',
        name: 'Klimmzug / Latzug eng',
        sets: 3, repsMin: 8, repsMax: 12,
        isTimeBased: false, perSide: false,
        rirMin: 1, rirMax: 2,
        pauseSec: 90,
        alternative: null,
      },
      {
        id: 'c-dips',
        name: 'Dips / Brustpresse',
        sets: 3, repsMin: 8, repsMax: 12,
        isTimeBased: false, perSide: false,
        rirMin: 1, rirMax: 2,
        pauseSec: 90,
        alternative: 'Trizeps-Drücken',
      },
      {
        id: 'c-trizeps',
        name: 'Trizeps am Kabel',
        sets: 3, repsMin: 10, repsMax: 15,
        isTimeBased: false, perSide: false,
        rirMin: 1, rirMax: 2,
        pauseSec: 60,
        alternative: null,
      },
      {
        id: 'c-beinheben',
        name: 'Hängendes Beinheben',
        sets: 3, repsMin: 10, repsMax: 15,
        isTimeBased: false, perSide: false,
        rirMin: 1, rirMax: 2,
        pauseSec: 45,
        alternative: 'Reverse Crunch',
      },
    ],
  },
];

// ─── Laufplan ─────────────────────────────────────────────────
// Source: content/trainingsplan-recomp.md – "Laufplan"
// Zone 2 = lockeres Tempo (Talk Test), Kraft hat Priorität

export const RUN_PLAN: RunWeekSpec[] = [
  {
    weekFrom: 1, weekTo: 2,
    run1: { durationMinMin: 25, durationMinMax: 25, notes: 'locker', hasSprints: false },
    run2: { durationMinMin: 20, durationMinMax: 20, notes: 'locker', hasSprints: false },
  },
  {
    weekFrom: 3, weekTo: 4,
    run1: { durationMinMin: 30, durationMinMax: 30, notes: 'locker', hasSprints: false },
    run2: { durationMinMin: 25, durationMinMax: 25, notes: 'locker', hasSprints: false },
  },
  {
    weekFrom: 5, weekTo: 6,
    run1: { durationMinMin: 35, durationMinMax: 35, notes: 'locker', hasSprints: false },
    run2: { durationMinMin: 25, durationMinMax: 25, notes: 'locker + 4× 20 Sek zügig am Ende', hasSprints: true },
  },
  {
    weekFrom: 7, weekTo: null,
    run1: { durationMinMin: 35, durationMinMax: 40, notes: 'locker', hasSprints: false },
    run2: { durationMinMin: 20, durationMinMax: 40, notes: 'nach Lust, locker halten', hasSprints: false },
  },
];

/** Returns the RunSpec for run1 (primary run) given the current programme week. */
export function getRunSpec(programWeek: number): RunWeekSpec {
  return (
    RUN_PLAN.find(
      w => programWeek >= w.weekFrom && (w.weekTo === null || programWeek <= w.weekTo),
    ) ?? RUN_PLAN[RUN_PLAN.length - 1]
  );
}

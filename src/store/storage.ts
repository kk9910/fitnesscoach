import type {
  Profile,
  ExerciseLogEntry,
  RunLogEntry,
  WeeklyCheck,
  MealLogEntry,
  AppData,
  SetLog,
  WorkoutDay,
  MealType,
} from '../types';

// ─── Storage keys ─────────────────────────────────────────────

const KEY = {
  PROFILE:        'fc:profile',
  EXERCISE_LOGS:  'fc:exercise_logs',
  RUN_LOGS:       'fc:run_logs',
  WEEKLY_CHECKS:  'fc:weekly_checks',
  MEAL_LOGS:      'fc:meal_logs',
} as const;

// ─── Helpers ──────────────────────────────────────────────────

function read<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : fallback;
}

function write(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Profile ──────────────────────────────────────────────────

export function getProfile(): Profile {
  return read<Profile>(KEY.PROFILE, {});
}

export function setProfile(profile: Profile): void {
  write(KEY.PROFILE, profile);
}

// ─── Exercise Logs ────────────────────────────────────────────

export function getExerciseLogs(): ExerciseLogEntry[] {
  return read<ExerciseLogEntry[]>(KEY.EXERCISE_LOGS, []);
}

export function saveExerciseLog(
  date: string,
  workoutDay: WorkoutDay,
  exerciseId: string,
  sets: SetLog[],
): ExerciseLogEntry {
  const logs = getExerciseLogs();
  // Replace existing entry for same date + exercise, or append
  const idx = logs.findIndex(l => l.date === date && l.exerciseId === exerciseId);
  const entry: ExerciseLogEntry = {
    id: idx >= 0 ? logs[idx].id : generateId(),
    date,
    workoutDay,
    exerciseId,
    sets,
  };
  if (idx >= 0) {
    logs[idx] = entry;
  } else {
    logs.push(entry);
  }
  write(KEY.EXERCISE_LOGS, logs);
  return entry;
}

export function getExerciseLogsForDate(date: string): ExerciseLogEntry[] {
  return getExerciseLogs().filter(l => l.date === date);
}

export function getExerciseLogsForExercise(exerciseId: string): ExerciseLogEntry[] {
  return getExerciseLogs()
    .filter(l => l.exerciseId === exerciseId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ─── Run Logs ─────────────────────────────────────────────────

export function getRunLogs(): RunLogEntry[] {
  return read<RunLogEntry[]>(KEY.RUN_LOGS, []);
}

export function saveRunLog(
  date: string,
  durationMin: number,
  feeling: RunLogEntry['feeling'],
  distanceKm?: number,
): RunLogEntry {
  const logs = getRunLogs();
  const idx = logs.findIndex(l => l.date === date);
  const entry: RunLogEntry = {
    id: idx >= 0 ? logs[idx].id : generateId(),
    date,
    durationMin,
    feeling,
    distanceKm,
  };
  if (idx >= 0) {
    logs[idx] = entry;
  } else {
    logs.push(entry);
  }
  write(KEY.RUN_LOGS, logs);
  return entry;
}

// ─── Weekly Checks ────────────────────────────────────────────

export function getWeeklyChecks(): WeeklyCheck[] {
  return read<WeeklyCheck[]>(KEY.WEEKLY_CHECKS, []);
}

export function saveWeeklyCheck(check: Omit<WeeklyCheck, 'id'>): WeeklyCheck {
  const checks = getWeeklyChecks();
  const idx = checks.findIndex(c => c.date === check.date);
  const entry: WeeklyCheck = { id: idx >= 0 ? checks[idx].id : generateId(), ...check };
  if (idx >= 0) {
    checks[idx] = entry;
  } else {
    checks.push(entry);
  }
  write(KEY.WEEKLY_CHECKS, checks);
  return entry;
}

// ─── Meal Logs ────────────────────────────────────────────────

export function getMealLogs(): MealLogEntry[] {
  return read<MealLogEntry[]>(KEY.MEAL_LOGS, []);
}

export function getMealLogsForDate(date: string): MealLogEntry[] {
  return getMealLogs().filter(l => l.date === date);
}

export function saveMealLog(
  date: string,
  mealType: MealType,
  mealId: string,
  done: boolean,
): MealLogEntry {
  const logs = getMealLogs();
  const idx = logs.findIndex(l => l.date === date && l.mealType === mealType);
  const entry: MealLogEntry = {
    id: idx >= 0 ? logs[idx].id : generateId(),
    date,
    mealType,
    mealId,
    done,
  };
  if (idx >= 0) {
    logs[idx] = entry;
  } else {
    logs.push(entry);
  }
  write(KEY.MEAL_LOGS, logs);
  return entry;
}

// ─── Export / Import ──────────────────────────────────────────

export function exportData(): AppData {
  return {
    profile:      getProfile(),
    exerciseLogs: getExerciseLogs(),
    runLogs:      getRunLogs(),
    weeklyChecks: getWeeklyChecks(),
    mealLogs:     getMealLogs(),
  };
}

export function importData(data: AppData): void {
  write(KEY.PROFILE,       data.profile);
  write(KEY.EXERCISE_LOGS, data.exerciseLogs);
  write(KEY.RUN_LOGS,      data.runLogs);
  write(KEY.WEEKLY_CHECKS, data.weeklyChecks);
  write(KEY.MEAL_LOGS,     data.mealLogs);
}

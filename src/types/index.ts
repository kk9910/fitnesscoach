// ─── Training ─────────────────────────────────────────────────

export type WorkoutDay = 'A' | 'B' | 'C';

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  /** reps OR seconds if isTimeBased */
  repsMin: number;
  repsMax: number;
  isTimeBased: boolean;   // true → reps are seconds (e.g. Plank)
  perSide: boolean;       // true → reps counted per side (e.g. Ausfallschritte)
  rirMin: number | null;  // null for isometric / timed exercises
  rirMax: number | null;
  /** recommended rest in seconds (mid-point of range) */
  pauseSec: number;
  alternative: string | null;
}

export interface TrainingDay {
  day: WorkoutDay;
  focus: string;
  exercises: Exercise[];
}

// ─── Running ──────────────────────────────────────────────────

export interface RunSpec {
  durationMinMin: number;
  durationMinMax: number;
  notes: string;
  hasSprints: boolean;
}

export interface RunWeekSpec {
  weekFrom: number;
  weekTo: number | null;  // null = open-ended ("ab Woche 7")
  run1: RunSpec;
  run2: RunSpec;
}

// ─── Schedule ─────────────────────────────────────────────────

export interface WeekScheduleEntry {
  /** JS day index: 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat */
  dayOfWeek: number;
  type: 'kraft' | 'lauf' | 'ruhe';
  workoutDay?: WorkoutDay;
  laufOptional?: boolean;
}

export type DaySchedule =
  | { type: 'kraft'; workoutDay: WorkoutDay; training: TrainingDay }
  | { type: 'lauf';  optional: true; runSpec: RunSpec }
  | { type: 'ruhe' };

// ─── Meals ────────────────────────────────────────────────────

export type MealType = 'fruehstueck' | 'mittagessen' | 'abendessen' | 'snack';

export type IngredientCategory =
  | 'fleisch-fisch'
  | 'milch-eier'
  | 'obst-gemuese'
  | 'getreide'
  | 'sonstiges';

export interface MealIngredient {
  item: string;
  amount: number;
  unit: 'g' | 'ml' | 'Stück';
  category: IngredientCategory;
}

export interface MealNutrition {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface Meal {
  id: string;
  type: MealType;
  name: string;
  description: string;
  /** Can be prepared quickly / taken to work */
  workdayFriendly: boolean;
  isVegetarian: boolean;
  /** Rough estimates – displayed with "ca." prefix, not for tracking */
  nutrition: MealNutrition;
  /** Per-serving shopping ingredients */
  ingredients: MealIngredient[];
}

// ─── Weekly Plan ──────────────────────────────────────────────

export interface WeekDayPlan {
  fruehstueck: string;  // mealId
  mittagessen: string;  // mealId
  abendessen:  string;  // mealId
  snack:       string;  // mealId
}

// ─── Profile ──────────────────────────────────────────────────

export interface Profile {
  heightCm?: number;
  startWeightKg?: number;
  proteinTargetG?: number;
  kcalTargetMin?: number;
  kcalTargetMax?: number;
  /** ISO date "YYYY-MM-DD" – used to calculate current programme week */
  programStartDate?: string;
  /** JS day indices that are work-days (user eats out) */
  workdays?: number[];
}

// ─── Log Entries ──────────────────────────────────────────────

export interface SetLog {
  weightKg: number;
  reps: number;
}

export interface ExerciseLogEntry {
  id: string;
  date: string;         // "YYYY-MM-DD"
  workoutDay: WorkoutDay;
  exerciseId: string;
  sets: SetLog[];
}

export interface RunLogEntry {
  id: string;
  date: string;
  durationMin: number;
  distanceKm?: number;
  feeling: 'locker' | 'anstrengend';
}

export interface WeeklyCheck {
  id: string;
  date: string;
  weightKg: number;
  waistCm: number;
  bodyFatPct?: number;
  muscleMassKg?: number;
}

export interface MealLogEntry {
  id: string;
  date: string;
  mealType: MealType;
  mealId: string;
  done: boolean;
}

// ─── Full Export Shape ─────────────────────────────────────────

export interface AppData {
  profile: Profile;
  exerciseLogs: ExerciseLogEntry[];
  runLogs: RunLogEntry[];
  weeklyChecks: WeeklyCheck[];
  mealLogs: MealLogEntry[];
}

import { ProgressRing } from '../components/ProgressRing';
import { getTodayPlan, getProgramWeek, WEEK_SCHEDULE, toISODate } from '../data/schedule';
import { TRAINING_DAYS } from '../data/training';
import { getDefaultDailyMeals } from '../data/meals';
import { getProfile } from '../store/storage';
import type { Exercise, DaySchedule, WorkoutDay } from '../types';

// ─── Date helpers ─────────────────────────────────────────────

const WEEKDAY_LABEL = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
const MONTH_LABEL   = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

function getWeekStart(d: Date): string {
  const copy = new Date(d);
  const dow = copy.getDay();
  copy.setDate(copy.getDate() - (dow === 0 ? 6 : dow - 1)); // back to Monday
  return toISODate(copy);
}

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

// ─── Sub-components ───────────────────────────────────────────

function CardHeader({ title, badge, badgeColor = 'var(--clr-accent)' }: {
  title: string;
  badge?: string;
  badgeColor?: string;
}) {
  return (
    <div
      style={{
        padding: '14px 20px',
        borderBottom: '0.5px solid var(--clr-separator)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <span className="headline">{title}</span>
      {badge && (
        <span className="footnote" style={{ color: badgeColor, fontWeight: 500 }}>
          {badge}
        </span>
      )}
    </div>
  );
}

// ── Exercise Row ─────────────────────────────────────────────

function ExerciseRow({ ex, index, isLast }: { ex: Exercise; index: number; isLast: boolean }) {
  const repsStr  = formatReps(ex);
  const rirStr   = formatRIR(ex);
  const pauseStr = formatPauseSec(ex.pauseSec);

  const meta = [`${ex.sets}×${repsStr}`, rirStr, `Pause ${pauseStr}`]
    .filter(Boolean)
    .join(' · ');

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '13px 20px',
        borderBottom: isLast ? undefined : '0.5px solid var(--clr-separator-2)',
      }}
    >
      {/* Number badge */}
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          background: 'var(--clr-accent-soft)',
          color: 'var(--clr-accent)',
          fontSize: 12,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        {index}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="callout" style={{ fontWeight: 600, color: 'var(--clr-text-1)' }}>
          {ex.name}
        </div>
        <div className="footnote" style={{ marginTop: '3px', color: 'var(--clr-text-2)' }}>
          {meta}
        </div>
        {ex.alternative && (
          <div className="caption" style={{ marginTop: '2px', color: 'var(--clr-text-3)' }}>
            Alt: {ex.alternative}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Kraft Card ───────────────────────────────────────────────

function KraftCard({ plan }: { plan: Extract<DaySchedule, { type: 'kraft' }> }) {
  const { training } = plan;
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <CardHeader title="Training" badge={`Kraft ${plan.workoutDay}`} />
      <div
        style={{
          padding: '10px 20px 6px',
          borderBottom: '0.5px solid var(--clr-separator-2)',
        }}
      >
        <span className="subhead" style={{ color: 'var(--clr-text-3)' }}>
          {training.focus} · {training.exercises.length} Übungen
        </span>
      </div>
      {training.exercises.map((ex, i) => (
        <ExerciseRow
          key={ex.id}
          ex={ex}
          index={i + 1}
          isLast={i === training.exercises.length - 1}
        />
      ))}
    </div>
  );
}

// ── Lauf Card ─────────────────────────────────────────────────

function LaufCard({ plan }: { plan: Extract<DaySchedule, { type: 'lauf' }> }) {
  const { runSpec } = plan;
  const duration =
    runSpec.durationMinMin === runSpec.durationMinMax
      ? `${runSpec.durationMinMin} Min`
      : `${runSpec.durationMinMin}–${runSpec.durationMinMax} Min`;

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <CardHeader title="Training" badge="Lauf optional" badgeColor="var(--clr-text-3)" />
      <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'var(--clr-accent-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, flexShrink: 0,
            }}
          >
            🏃
          </div>
          <div>
            <div className="callout" style={{ fontWeight: 600 }}>Zone 2 · locker</div>
            <div className="footnote" style={{ color: 'var(--clr-text-3)', marginTop: 2 }}>
              Ziel: {duration} · Talk Test (du kannst reden)
            </div>
          </div>
        </div>

        {runSpec.hasSprints && (
          <div
            style={{
              borderRadius: 'var(--radius-sm)',
              background: 'var(--clr-surface-2)',
              padding: '10px 14px',
            }}
          >
            <span className="footnote" style={{ color: 'var(--clr-text-2)' }}>
              + 4× 20 Sek zügig am Ende (optionaler Sprints-Block)
            </span>
          </div>
        )}

        <div className="footnote" style={{ color: 'var(--clr-text-3)' }}>
          {runSpec.notes !== 'locker' ? runSpec.notes : 'Wenn die Beine müde sind: kürzer oder weglassen — kein Drama.'}
        </div>
      </div>
    </div>
  );
}

// ── Rest Card ─────────────────────────────────────────────────

function RestCard({ today }: { today: Date }) {
  const next = nextKraftAfter(today);
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <CardHeader title="Training" badge="Ruhetag" badgeColor="var(--clr-text-3)" />
      <div style={{ padding: '16px 20px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'var(--clr-surface-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, flexShrink: 0,
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

// ── Summary Ring Card (Kraft days only) ───────────────────────

function SummaryCard({
  plan,
  programWeek,
}: {
  plan: DaySchedule;
  programWeek: number;
}) {
  if (plan.type !== 'kraft') return null;

  const total = plan.training.exercises.length;

  return (
    <div
      className="card"
      style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px', marginBottom: 16 }}
    >
      <ProgressRing
        progress={0}
        size={84}
        strokeWidth={8}
        centerLabel="0"
        centerSub={`/ ${total}`}
      />
      <div>
        <div className="headline" style={{ color: 'var(--clr-text-1)' }}>
          Kraft {plan.workoutDay} · Woche {programWeek}
        </div>
        <div className="subhead" style={{ marginTop: 4, color: 'var(--clr-text-3)' }}>
          {total} Übungen · noch nicht geloggt
        </div>
      </div>
    </div>
  );
}

// ── Meals Card ────────────────────────────────────────────────

function MealsCard({ isWorkday }: { isWorkday: boolean }) {
  const meals = getDefaultDailyMeals(isWorkday);
  const rows = [
    { label: 'Frühstück',   meal: meals.fruehstueck  },
    { label: 'Mittagessen', meal: meals.mittagessen  },
    { label: 'Abendessen',  meal: meals.abendessen   },
  ];

  return (
    <div className="card">
      <CardHeader title="Mahlzeiten" badge="3 geplant" badgeColor="var(--clr-text-3)" />
      {rows.map(({ label, meal }, i) => (
        <div
          key={meal.id}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
            padding: '13px 20px',
            borderBottom: i < rows.length - 1 ? '0.5px solid var(--clr-separator-2)' : undefined,
          }}
        >
          {/* Empty checkbox circle — logging comes in Schritt 5 */}
          <div
            style={{
              width: 24, height: 24, borderRadius: '50%',
              border: '1.5px solid var(--clr-separator)',
              flexShrink: 0, marginTop: 1,
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="callout" style={{ fontWeight: 600, color: 'var(--clr-text-1)' }}>
              {label} · {meal.name}
            </div>
            <div className="footnote" style={{ marginTop: 3, color: 'var(--clr-text-3)' }}>
              {meal.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────

export function HeutePage() {
  const today   = new Date();
  const profile = getProfile();

  // Use stored start date or fall back to Monday of current week
  const startDate   = profile.programStartDate ?? getWeekStart(today);
  const programWeek = getProgramWeek(today, startDate);
  const plan        = getTodayPlan(today, startDate);
  const isWorkday   = (profile.workdays ?? []).includes(today.getDay());

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

        {/* ── Large Title ── */}
        <div style={{ marginBottom: 28 }}>
          <h1 className="large-title" style={{ margin: 0 }}>Heute</h1>
          <p className="subhead" style={{ margin: '4px 0 0', color: 'var(--clr-text-3)' }}>
            {weekday}, {date}
          </p>
        </div>

        {/* ── Day-specific content ── */}
        <SummaryCard plan={plan} programWeek={programWeek} />

        {plan.type === 'kraft' && <KraftCard plan={plan} />}
        {plan.type === 'lauf'  && <LaufCard  plan={plan} />}
        {plan.type === 'ruhe'  && <RestCard  today={today} />}

        {/* ── Meals (always shown) ── */}
        <MealsCard isWorkday={isWorkday} />

      </div>
    </div>
  );
}

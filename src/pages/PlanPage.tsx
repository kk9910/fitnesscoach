import { useState, useMemo } from 'react';
import { MEALS, getMealsOfType } from '../data/meals';
import { WEEK_SCHEDULE, getWeekStart, toISODate } from '../data/schedule';
import {
  getProfile,
  getWeekPlan,
  saveWeekPlanDay,
  getShoppingChecked,
  saveShoppingChecked,
} from '../store/storage';
import type { MealType, WeekDayPlan, IngredientCategory } from '../types';

// ─── Types ────────────────────────────────────────────────────

type MealSlotKey = 'fruehstueck' | 'mittagessen' | 'abendessen' | 'snack';

// ─── Constants ────────────────────────────────────────────────

const WEEKDAY_FULL = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
const MONTH_SHORT  = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];

const SLOT_LABEL: Record<MealSlotKey, string> = {
  fruehstueck: 'Frühstück',
  mittagessen: 'Mittag',
  abendessen:  'Abend',
  snack:       'Snack',
};

const CATEGORY_ORDER: IngredientCategory[] = [
  'fleisch-fisch', 'obst-gemuese', 'milch-eier', 'getreide', 'sonstiges',
];

const CATEGORY_LABEL: Record<IngredientCategory, string> = {
  'fleisch-fisch': 'Fleisch & Fisch',
  'obst-gemuese':  'Obst & Gemüse',
  'milch-eier':    'Milch & Eier',
  'getreide':      'Getreide & Hülsenfrüchte',
  'sonstiges':     'Sonstiges',
};

// ─── Helpers ──────────────────────────────────────────────────

function weekDateStrings(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart + 'T12:00:00');
    d.setDate(d.getDate() + i);
    return toISODate(d);
  });
}

function getDayBadge(dow: number): string | null {
  const entry = WEEK_SCHEDULE.find(e => e.dayOfWeek === dow);
  if (!entry || entry.type === 'ruhe') return null;
  if (entry.type === 'lauf') return 'Lauf';
  if (entry.type === 'kraft' && entry.workoutDay) return `Kraft ${entry.workoutDay}`;
  return null;
}

const DEFAULT_BREAKFASTS: string[] = [
  'fr-muesli', 'fr-shake', 'fr-muesli', 'fr-shake', 'fr-muesli', 'fr-ruehrei', 'fr-ruehrei',
];
const DEFAULT_LUNCHES: string[] = [
  'mi-haehnchen-reis', 'mi-hack-kartoffel', 'mi-pute-nudeln',
  'mi-lachs-kartoffel', 'mi-linsen-curry', 'mi-haehnchen-reis', 'mi-hack-kartoffel',
];
const DEFAULT_DINNERS: string[] = [
  'ab-omelett', 'ab-quark', 'ab-wrap', 'ab-brot', 'ab-omelett', 'ab-huettenkaese', 'ab-wrap',
];
const DEFAULT_SNACKS: string[] = [
  'sn-skyr', 'sn-skyr', 'sn-ei', 'sn-skyr', 'sn-quark-beeren', 'sn-skyr', 'sn-ei',
];

function generateDefaultWeekPlan(weekStart: string): Record<string, WeekDayPlan> {
  const plan: Record<string, WeekDayPlan> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart + 'T12:00:00');
    d.setDate(d.getDate() + i);
    plan[toISODate(d)] = {
      fruehstueck: DEFAULT_BREAKFASTS[i],
      mittagessen: DEFAULT_LUNCHES[i],
      abendessen:  DEFAULT_DINNERS[i],
      snack:       DEFAULT_SNACKS[i],
    };
  }
  return plan;
}

function formatAmount(amount: number, unit: string): string {
  if (unit === 'Stück') return `${Math.ceil(amount)} Stück`;
  if (unit === 'g' && amount >= 1000) {
    const kg = amount / 1000;
    return `${Number.isInteger(kg) ? kg : kg.toFixed(1)} kg`;
  }
  if (unit === 'ml' && amount >= 1000) {
    const l = amount / 1000;
    return `${Number.isInteger(l) ? l : l.toFixed(1)} L`;
  }
  return `${Number.isInteger(amount) ? amount : amount.toFixed(0)} ${unit}`;
}

interface ShoppingItem {
  item: string;
  amount: number;
  unit: string;
  category: IngredientCategory;
}

function buildShoppingItems(
  weekPlan: Record<string, WeekDayPlan>,
  weekDates: string[],
  excludeWorkdayLunch: boolean,
  workdays: number[],
): Record<IngredientCategory, ShoppingItem[]> {
  const map = new Map<string, ShoppingItem>();

  for (const dateStr of weekDates) {
    const plan = weekPlan[dateStr];
    if (!plan) continue;
    const dow = new Date(dateStr + 'T12:00:00').getDay();
    const isWorkday = workdays.includes(dow);

    const mealIds: string[] = [plan.fruehstueck, plan.abendessen, plan.snack ?? 'sn-skyr'];
    if (!excludeWorkdayLunch || !isWorkday) mealIds.push(plan.mittagessen);

    for (const mealId of mealIds) {
      const meal = MEALS.find(m => m.id === mealId);
      if (!meal) continue;
      for (const ing of meal.ingredients) {
        const key = `${ing.item}||${ing.unit}`;
        const existing = map.get(key);
        if (existing) {
          existing.amount += ing.amount;
        } else {
          map.set(key, { item: ing.item, amount: ing.amount, unit: ing.unit, category: ing.category });
        }
      }
    }
  }

  const grouped: Record<IngredientCategory, ShoppingItem[]> = {
    'fleisch-fisch': [],
    'obst-gemuese':  [],
    'milch-eier':    [],
    'getreide':      [],
    'sonstiges':     [],
  };
  for (const item of map.values()) {
    grouped[item.category].push(item);
  }
  // Sort alphabetically within each category
  for (const cat of CATEGORY_ORDER) {
    grouped[cat].sort((a, b) => a.item.localeCompare(b.item, 'de'));
  }
  return grouped;
}

// ─── Shared UI atoms ──────────────────────────────────────────

function CardHeader({ title, badge, badgeAccent = false }: { title: string; badge?: string; badgeAccent?: boolean }) {
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
        <span className="footnote" style={{ fontWeight: 500, color: badgeAccent ? 'var(--clr-accent)' : 'var(--clr-text-3)' }}>
          {badge}
        </span>
      )}
    </div>
  );
}

function VegBadge() {
  return (
    <span
      style={{
        fontSize: 11, fontWeight: 700, color: '#30D158',
        background: 'rgba(48,209,88,0.12)',
        borderRadius: 6, padding: '2px 6px',
        flexShrink: 0,
      }}
    >
      V
    </span>
  );
}

// ─── Week Plan Section ────────────────────────────────────────

interface WeekPlanSectionProps {
  weekDates: string[];
  weekPlan: Record<string, WeekDayPlan>;
  workdays: number[];
  onUpdateMeal: (date: string, slot: MealSlotKey, mealId: string) => void;
  onLoadDefaults: () => void;
}

function WeekPlanSection({ weekDates, weekPlan, workdays, onUpdateMeal, onLoadDefaults }: WeekPlanSectionProps) {
  const [expandedCell, setExpandedCell] = useState<{ date: string; slot: MealSlotKey } | null>(null);

  const SLOTS: MealSlotKey[] = ['fruehstueck', 'mittagessen', 'abendessen', 'snack'];

  return (
    <div>
      {/* Standard-Plan button */}
      <button
        onClick={onLoadDefaults}
        style={{
          width: '100%', height: 44, marginBottom: 16,
          borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--clr-separator)',
          background: 'transparent', color: 'var(--clr-accent)',
          fontSize: 15, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
        }}
      >
        Standard-Plan laden
      </button>

      {/* Day cards */}
      {weekDates.map((dateStr) => {
        const d = new Date(dateStr + 'T12:00:00');
        const dow = d.getDay();
        const isWorkday = workdays.includes(dow);
        const badge = getDayBadge(dow);
        const plan = weekPlan[dateStr];

        return (
          <div key={dateStr} className="card" style={{ marginBottom: 12 }}>
            {/* Day header */}
            <div
              style={{
                padding: '11px 20px',
                borderBottom: '0.5px solid var(--clr-separator)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <span className="callout" style={{ fontWeight: 600 }}>
                {WEEKDAY_FULL[dow]}, {d.getDate()}. {MONTH_SHORT[d.getMonth()]}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                {badge && (
                  <span
                    className="caption"
                    style={{
                      background: 'var(--clr-accent-soft)', color: 'var(--clr-accent)',
                      borderRadius: 6, padding: '2px 8px', fontWeight: 600,
                    }}
                  >
                    {badge}
                  </span>
                )}
                {isWorkday && (
                  <span
                    className="caption"
                    style={{
                      background: 'var(--clr-surface-2)', color: 'var(--clr-text-3)',
                      borderRadius: 6, padding: '2px 8px', fontWeight: 500,
                    }}
                  >
                    Arbeitstag
                  </span>
                )}
              </div>
            </div>

            {/* Meal slots */}
            {SLOTS.map((slot, si) => {
              const mealId = (plan?.[slot] as string | undefined) ?? (slot === 'snack' ? 'sn-skyr' : '');
              const meal   = MEALS.find(m => m.id === mealId);
              const alts   = getMealsOfType(slot as MealType);
              const isExp  = expandedCell?.date === dateStr && expandedCell?.slot === slot;
              const isLast = si === SLOTS.length - 1;

              return (
                <div
                  key={slot}
                  style={{ borderBottom: (!isLast || isExp) ? '0.5px solid var(--clr-separator-2)' : undefined }}
                >
                  {/* Compact row */}
                  <div
                    onClick={() => setExpandedCell(isExp ? null : { date: dateStr, slot })}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '11px 20px', cursor: 'pointer',
                      WebkitUserSelect: 'none',
                    }}
                  >
                    <span
                      className="caption"
                      style={{
                        width: 48, flexShrink: 0, fontWeight: 600,
                        color: 'var(--clr-text-3)',
                      }}
                    >
                      {SLOT_LABEL[slot]}
                    </span>
                    <span className="subhead" style={{ flex: 1, color: 'var(--clr-text-1)' }}>
                      {meal?.name ?? '–'}
                    </span>
                    {meal?.isVegetarian && <VegBadge />}
                    <svg
                      width="12" height="12" viewBox="0 0 12 12" fill="none"
                      style={{
                        flexShrink: 0, color: 'var(--clr-text-3)',
                        transform: isExp ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>

                  {/* Alternatives panel */}
                  {isExp && (
                    <div style={{ background: 'var(--clr-surface-2)', borderTop: '0.5px solid var(--clr-separator-2)' }}>
                      <div style={{ padding: '7px 20px 3px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--clr-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Option wählen
                        </span>
                      </div>
                      {alts.map(alt => {
                        const isSel = alt.id === mealId;
                        return (
                          <div
                            key={alt.id}
                            onClick={() => { onUpdateMeal(dateStr, slot, alt.id); setExpandedCell(null); }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 12,
                              padding: '10px 20px',
                              borderTop: '0.5px solid var(--clr-separator-2)',
                              cursor: 'pointer',
                              background: isSel ? 'rgba(0,122,255,0.06)' : 'transparent',
                              WebkitUserSelect: 'none',
                            }}
                          >
                            {/* Radio dot */}
                            <div
                              style={{
                                width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                                border: isSel ? 'none' : '1.5px solid var(--clr-separator)',
                                background: isSel ? 'var(--clr-accent)' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}
                            >
                              {isSel && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div className="subhead" style={{ color: isSel ? 'var(--clr-accent)' : 'var(--clr-text-1)', fontWeight: isSel ? 600 : 400 }}>
                                {alt.name}
                              </div>
                              <div className="caption" style={{ marginTop: 2, color: 'var(--clr-text-3)' }}>
                                ca. {alt.nutrition.kcal} kcal · {alt.nutrition.proteinG}g E · {alt.nutrition.carbsG}g KH
                              </div>
                            </div>
                            {alt.isVegetarian && <VegBadge />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ─── Shopping List Section ────────────────────────────────────

interface ShoppingSectionProps {
  weekDates: string[];
  weekPlan: Record<string, WeekDayPlan>;
  workdays: number[];
  weekLabel: string;
}

function ShoppingSection({ weekDates, weekPlan, workdays, weekLabel }: ShoppingSectionProps) {
  const hasWorkdays = workdays.length > 0;
  const [excludeWorkdayLunch, setExcludeWorkdayLunch] = useState(hasWorkdays);
  const [checkedKeys, setCheckedKeys] = useState<Set<string>>(
    () => new Set(getShoppingChecked())
  );

  const grouped = useMemo(
    () => buildShoppingItems(weekPlan, weekDates, excludeWorkdayLunch, workdays),
    [weekPlan, weekDates, excludeWorkdayLunch, workdays],
  );

  function toggleChecked(key: string) {
    setCheckedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      saveShoppingChecked([...next]);
      return next;
    });
  }

  const totalItems   = CATEGORY_ORDER.reduce((s, c) => s + (grouped[c]?.length ?? 0), 0);
  const doneItems    = CATEGORY_ORDER.reduce(
    (s, c) => s + (grouped[c]?.filter(i => checkedKeys.has(`${i.item}||${i.unit}`)).length ?? 0),
    0,
  );

  return (
    <div>
      {/* Header info */}
      <div
        className="card"
        style={{ marginBottom: 16, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div>
          <div className="callout" style={{ fontWeight: 600 }}>Einkaufsliste</div>
          <div className="footnote" style={{ color: 'var(--clr-text-3)', marginTop: 2 }}>{weekLabel}</div>
        </div>
        <span className="footnote" style={{ color: doneItems === totalItems && totalItems > 0 ? 'var(--clr-accent)' : 'var(--clr-text-3)', fontWeight: 500 }}>
          {doneItems} / {totalItems}
        </span>
      </div>

      {/* Workday lunch toggle */}
      {hasWorkdays && (
        <div
          className="card"
          style={{ marginBottom: 16, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
          onClick={() => setExcludeWorkdayLunch(v => !v)}
        >
          <div
            style={{
              width: 22, height: 22, borderRadius: 6, flexShrink: 0,
              background: excludeWorkdayLunch ? 'var(--clr-accent)' : 'var(--clr-surface-2)',
              border: excludeWorkdayLunch ? 'none' : '1.5px solid var(--clr-separator)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s ease',
            }}
          >
            {excludeWorkdayLunch && <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>✓</span>}
          </div>
          <div>
            <div className="subhead" style={{ fontWeight: 500 }}>Mittagessen an Arbeitstagen ausschließen</div>
            <div className="caption" style={{ color: 'var(--clr-text-3)', marginTop: 2 }}>
              An Arbeitstagen nicht kochen → Mittags-Zutaten weglassen
            </div>
          </div>
        </div>
      )}

      {/* Category groups */}
      {CATEGORY_ORDER.map(cat => {
        const items = grouped[cat];
        if (!items?.length) return null;
        return (
          <div key={cat} className="card" style={{ marginBottom: 12 }}>
            <CardHeader title={CATEGORY_LABEL[cat]} />
            {items.map((item, i) => {
              const key   = `${item.item}||${item.unit}`;
              const done  = checkedKeys.has(key);
              const isLast = i === items.length - 1;
              return (
                <div
                  key={key}
                  onClick={() => toggleChecked(key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 20px',
                    borderBottom: isLast ? undefined : '0.5px solid var(--clr-separator-2)',
                    cursor: 'pointer',
                    WebkitUserSelect: 'none',
                  }}
                >
                  {/* Checkbox */}
                  <div
                    style={{
                      width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                      background: done ? 'var(--clr-accent)' : 'transparent',
                      border: done ? 'none' : '1.5px solid var(--clr-separator)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.2s ease',
                    }}
                  >
                    {done && <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                      className="subhead"
                      style={{
                        color: done ? 'var(--clr-text-3)' : 'var(--clr-text-1)',
                        textDecoration: done ? 'line-through' : 'none',
                        transition: 'color 0.2s ease',
                      }}
                    >
                      {item.item}
                    </span>
                  </div>
                  <span
                    className="footnote"
                    style={{ color: done ? 'var(--clr-text-3)' : 'var(--clr-text-2)', fontWeight: 500, flexShrink: 0 }}
                  >
                    {formatAmount(item.amount, item.unit)}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}

      {totalItems === 0 && (
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <span className="subhead" style={{ color: 'var(--clr-text-3)' }}>
            Kein Wochenplan hinterlegt – zuerst den Plan ausfüllen.
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────

export function PlanPage() {
  const realToday  = useMemo(() => new Date(), []);
  const weekStart  = getWeekStart(realToday);
  const weekDates  = useMemo(() => weekDateStrings(weekStart), [weekStart]);
  const profile    = getProfile();
  const workdays   = profile.workdays ?? [];

  const [activeTab, setActiveTab] = useState<'plan' | 'liste'>('plan');

  // Week plan state – initialized from storage, missing days filled with defaults
  const [weekPlan, setWeekPlan] = useState<Record<string, WeekDayPlan>>(() => {
    const stored   = getWeekPlan();
    const defaults = generateDefaultWeekPlan(weekStart);
    const result: Record<string, WeekDayPlan> = {};
    for (const d of weekDates) {
      result[d] = stored[d] ?? defaults[d];
    }
    return result;
  });

  function handleUpdateMeal(date: string, slot: MealSlotKey, mealId: string) {
    const current = weekPlan[date] ?? { fruehstueck: '', mittagessen: '', abendessen: '' };
    const updated = { ...current, [slot]: mealId };
    setWeekPlan(prev => ({ ...prev, [date]: updated }));
    saveWeekPlanDay(date, updated);
  }

  function handleLoadDefaults() {
    const defaults = generateDefaultWeekPlan(weekStart);
    setWeekPlan(prev => {
      const next = { ...prev };
      for (const d of weekDates) {
        next[d] = defaults[d];
        saveWeekPlanDay(d, defaults[d]);
      }
      return next;
    });
  }

  // Week label for shopping section
  const startD  = new Date(weekStart + 'T12:00:00');
  const endD    = new Date(weekStart + 'T12:00:00');
  endD.setDate(endD.getDate() + 6);
  const weekLabel = `${startD.getDate()}. ${MONTH_SHORT[startD.getMonth()]} – ${endD.getDate()}. ${MONTH_SHORT[endD.getMonth()]}`;

  return (
    <div
      style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch' as const,
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div style={{ padding: '20px 20px 40px' }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 className="large-title" style={{ margin: 0 }}>Plan</h1>
          <p className="subhead" style={{ margin: '4px 0 0', color: 'var(--clr-text-3)' }}>{weekLabel}</p>
        </div>

        {/* Segment control */}
        <div
          style={{
            display: 'flex', gap: 4,
            background: 'var(--clr-surface-2)',
            borderRadius: 'var(--radius-sm)', padding: 4,
            marginBottom: 20,
          }}
        >
          {(['plan', 'liste'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, height: 36,
                borderRadius: 9,
                border: 'none',
                background: activeTab === tab ? 'var(--clr-surface)' : 'transparent',
                color: activeTab === tab ? 'var(--clr-text-1)' : 'var(--clr-text-3)',
                fontSize: 14, fontWeight: activeTab === tab ? 600 : 400,
                fontFamily: 'inherit', cursor: 'pointer',
                boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
                transition: 'background 0.2s ease, color 0.2s ease',
              }}
            >
              {tab === 'plan' ? 'Wochenplan' : 'Einkaufsliste'}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'plan' && (
          <WeekPlanSection
            weekDates={weekDates}
            weekPlan={weekPlan}
            workdays={workdays}
            onUpdateMeal={handleUpdateMeal}
            onLoadDefaults={handleLoadDefaults}
          />
        )}
        {activeTab === 'liste' && (
          <ShoppingSection
            weekDates={weekDates}
            weekPlan={weekPlan}
            workdays={workdays}
            weekLabel={weekLabel}
          />
        )}

      </div>
    </div>
  );
}

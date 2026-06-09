import { useState, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { getWeeklyChecks, saveWeeklyCheck, getExerciseLogsForExercise } from '../store/storage';
import { TRAINING_DAYS } from '../data/training';

// ─── Helpers ──────────────────────────────────────────────────

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** ISO 8601 week key: "2025-W03" */
function isoWeekKey(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const thu = new Date(d);
  thu.setDate(d.getDate() + (4 - (d.getDay() || 7)));
  const jan1 = new Date(thu.getFullYear(), 0, 1);
  const wk = Math.ceil(((thu.getTime() - jan1.getTime()) / 86400000 + 1) / 7);
  return `${thu.getFullYear()}-W${String(wk).padStart(2, '0')}`;
}

function fmtShort(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

function fmtLong(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ─── LineChart ─────────────────────────────────────────────────

interface DataPoint { date: string; value: number }

function LineChart({ data, color, unit, title }: {
  data: DataPoint[]; color: string; unit: string; title: string;
}) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  if (data.length === 0) {
    return <div style={{ color: 'var(--clr-text-3)', fontSize: 14, padding: '8px 0' }}>Noch keine Daten.</div>;
  }
  if (data.length === 1) {
    return (
      <div style={{ color: 'var(--clr-text-3)', fontSize: 14, padding: '8px 0' }}>
        1 Messung ({data[0].value} {unit} · {fmtLong(data[0].date)}) — noch zu wenig für einen Chart.
      </div>
    );
  }

  const W = 320, H = 140;
  const PAD = { t: 24, r: 16, b: 36, l: 46 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;
  const n = data.length;

  const vals = data.map(d => d.value);
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const span = hi - lo || 1;
  const yMin = lo - span * 0.2;
  const yMax = hi + span * 0.2;
  const ySpan = yMax - yMin;

  const px = (i: number) => PAD.l + (i / (n - 1)) * cW;
  const py = (v: number) => PAD.t + (1 - (v - yMin) / ySpan) * cH;

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${px(i)} ${py(d.value)}`).join(' ');
  const areaPath = `${linePath} L${px(n - 1)} ${PAD.t + cH} L${PAD.l} ${PAD.t + cH} Z`;

  const gridLevels = [0.25, 0.5, 0.75].map(f => yMin + f * ySpan);
  const xLabelIdxs = n <= 5
    ? data.map((_, i) => i)
    : [0, 1, 2, 3, 4].map(f => Math.round(f * (n - 1) / 4));

  const gradId = `lg-${title.replace(/\W/g, '')}`;

  function handlePointer(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * W - PAD.l;
    setActiveIdx(Math.max(0, Math.min(n - 1, Math.round((relX / cW) * (n - 1)))));
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color, marginBottom: 4 }}>{title}</div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', display: 'block', touchAction: 'pan-y' }}
        onPointerMove={handlePointer}
        onPointerLeave={() => setActiveIdx(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Y grid + labels */}
        {gridLevels.map((v, i) => (
          <g key={i}>
            <line x1={PAD.l} y1={py(v)} x2={PAD.l + cW} y2={py(v)}
              stroke="var(--clr-separator)" strokeWidth="0.75" />
            <text x={PAD.l - 5} y={py(v) + 4}
              textAnchor="end" fontSize="9.5" fill="var(--clr-text-3)">
              {Number(v.toFixed(1))}
            </text>
          </g>
        ))}

        {/* X baseline */}
        <line x1={PAD.l} y1={PAD.t + cH} x2={PAD.l + cW} y2={PAD.t + cH}
          stroke="var(--clr-separator)" strokeWidth="0.75" />

        {/* Area + line */}
        <path d={areaPath} fill={`url(#${gradId})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {data.map((d, i) => {
          const active = i === activeIdx;
          return (
            <circle key={i} cx={px(i)} cy={py(d.value)}
              r={active ? 6 : 3.5}
              fill={active ? color : 'var(--clr-surface)'}
              stroke={color} strokeWidth={active ? 0 : 2}
            />
          );
        })}

        {/* X-axis date labels */}
        {xLabelIdxs.map(i => (
          <text key={i} x={px(i)} y={H - 5}
            textAnchor="middle" fontSize="9.5" fill="var(--clr-text-3)">
            {fmtShort(data[i].date)}
          </text>
        ))}
      </svg>

      {/* Hover callout */}
      {activeIdx !== null && (
        <div style={{
          position: 'absolute', top: 20, right: 0,
          background: 'var(--clr-surface)', borderRadius: 8,
          padding: '5px 10px', fontSize: 13, fontWeight: 600,
          color, boxShadow: '0 2px 10px rgba(0,0,0,0.14)',
          pointerEvents: 'none', whiteSpace: 'nowrap',
        }}>
          {data[activeIdx].value} {unit} · {fmtShort(data[activeIdx].date)}
        </div>
      )}
    </div>
  );
}

// ─── WochenCheckCard ───────────────────────────────────────────

function WochenCheckCard({ onSaved }: { onSaved: () => void }) {
  const today = toISODate(new Date());

  const [existing] = useState(() => {
    const thisWeek = isoWeekKey(today);
    return getWeeklyChecks().find(c => isoWeekKey(c.date) === thisWeek) ?? null;
  });

  const [weight,  setWeight]  = useState(existing?.weightKg     != null ? String(existing.weightKg)     : '');
  const [waist,   setWaist]   = useState(existing?.waistCm      != null ? String(existing.waistCm)      : '');
  const [fat,     setFat]     = useState(existing?.bodyFatPct   != null ? String(existing.bodyFatPct)   : '');
  const [muscle,  setMuscle]  = useState(existing?.muscleMassKg != null ? String(existing.muscleMassKg) : '');
  const [saved,   setSaved]   = useState(existing != null);

  const canSave = weight !== '' && waist !== '' &&
    !isNaN(parseFloat(weight)) && !isNaN(parseFloat(waist));

  function handleSave() {
    if (!canSave) return;
    saveWeeklyCheck({
      date: today,
      weightKg:     parseFloat(weight),
      waistCm:      parseFloat(waist),
      bodyFatPct:   fat    !== '' ? parseFloat(fat)    : undefined,
      muscleMassKg: muscle !== '' ? parseFloat(muscle) : undefined,
    });
    setSaved(true);
    onSaved();
  }

  const inputStyle: CSSProperties = {
    width: '100%', background: 'var(--clr-surface-2)',
    border: '1px solid var(--clr-separator)', borderRadius: 10,
    padding: '10px 12px', fontSize: 16, color: 'var(--clr-text-1)',
    outline: 'none',
  };

  const fields = [
    { label: 'Gewicht (kg) *',           value: weight, set: setWeight, placeholder: '82.5' },
    { label: 'Bauchumfang (cm) *',        value: waist,  set: setWaist,  placeholder: '88'   },
    { label: 'KFA (%) – optional',        value: fat,    set: setFat,    placeholder: '22'   },
    { label: 'Muskelmasse (kg) – optional', value: muscle, set: setMuscle, placeholder: '65' },
  ];

  return (
    <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div className="headline">Wochen-Check</div>
          <div style={{ fontSize: 13, color: 'var(--clr-text-3)', marginTop: 3 }}>
            {existing
              ? `Eingetragen: ${fmtLong(existing.date)}`
              : 'Noch kein Check diese Woche'}
          </div>
        </div>
        {saved && (
          <svg width="22" height="22" viewBox="0 0 22 22" style={{ flexShrink: 0, marginTop: 2 }}>
            <circle cx="11" cy="11" r="11" fill="#34C759" />
            <path d="M6 11.5L9.5 15L16 8" stroke="white" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {fields.map(({ label, value, set, placeholder }) => (
          <div key={label}>
            <div style={{ fontSize: 12, color: 'var(--clr-text-3)', marginBottom: 6 }}>{label}</div>
            <input
              type="number" inputMode="decimal" placeholder={placeholder}
              value={value}
              onChange={e => { set(e.target.value); setSaved(false); }}
              style={inputStyle}
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={!canSave}
        style={{
          width: '100%', padding: '13px', borderRadius: 12, border: 'none',
          background: canSave ? 'var(--clr-accent)' : 'var(--clr-separator)',
          color: canSave ? 'white' : 'var(--clr-text-3)',
          fontSize: 16, fontWeight: 600, cursor: canSave ? 'pointer' : 'default',
        }}
      >
        Speichern
      </button>
    </div>
  );
}

// ─── BodyMetricsSection ────────────────────────────────────────

function BodyMetricsSection({ tick }: { tick: number }) {
  const checks = useMemo(
    () => [...getWeeklyChecks()].sort((a, b) => a.date.localeCompare(b.date)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tick],
  );

  if (checks.length === 0) {
    return (
      <div className="card" style={{ padding: '20px', marginBottom: 16, textAlign: 'center' }}>
        <div style={{ color: 'var(--clr-text-3)', fontSize: 14 }}>
          Noch keine Messungen – trag oben deinen ersten Check ein.
        </div>
      </div>
    );
  }

  const wData  = checks.map(c => ({ date: c.date, value: c.weightKg }));
  const wcData = checks.map(c => ({ date: c.date, value: c.waistCm  }));
  const recent = [...checks].reverse().slice(0, 8);

  return (
    <>
      <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
        <LineChart data={wData} color="#007AFF" unit="kg" title="Gewicht (kg)" />
      </div>
      <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
        <LineChart data={wcData} color="#FF9500" unit="cm" title="Bauchumfang (cm)" />
      </div>

      <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
        <div className="headline" style={{ marginBottom: 12 }}>Verlauf</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--clr-separator)' }}>
                {['Datum', 'Gewicht', 'Bauch', 'KFA'].map((h, i) => (
                  <th key={h} style={{
                    textAlign: i === 0 ? 'left' : 'right',
                    padding: '4px 6px 8px', fontSize: 12, fontWeight: 500,
                    color: 'var(--clr-text-3)', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((c, i) => (
                <tr key={c.id}
                  style={{ borderBottom: i < recent.length - 1 ? '1px solid var(--clr-separator-2)' : 'none' }}>
                  <td style={{ padding: '8px 6px', color: 'var(--clr-text-2)', whiteSpace: 'nowrap' }}>
                    {fmtLong(c.date)}
                  </td>
                  <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 600 }}>
                    {c.weightKg} kg
                  </td>
                  <td style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 600 }}>
                    {c.waistCm} cm
                  </td>
                  <td style={{ padding: '8px 6px', textAlign: 'right',
                    color: c.bodyFatPct != null ? 'var(--clr-text-2)' : 'var(--clr-text-3)' }}>
                    {c.bodyFatPct != null ? `${c.bodyFatPct} %` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ─── ExerciseProgressSection ───────────────────────────────────

const ALL_EXERCISES = TRAINING_DAYS.flatMap(t => t.exercises);

function ExerciseProgressSection() {
  const [selId, setSelId] = useState(ALL_EXERCISES[0]?.id ?? '');

  const selEx = ALL_EXERCISES.find(e => e.id === selId);
  const isTime = selEx?.isTimeBased ?? false;
  const unit = isTime ? 's' : 'kg';

  const { chartData, sessionLogs } = useMemo(() => {
    const logs = getExerciseLogsForExercise(selId);
    const chartData: DataPoint[] = logs.map(log => ({
      date: log.date,
      value: Math.max(0, ...log.sets.map(s => isTime ? s.reps : s.weightKg)),
    }));
    return { chartData, sessionLogs: logs };
  }, [selId, isTime]);

  if (ALL_EXERCISES.length === 0) return null;

  return (
    <div>
      <div className="headline" style={{ marginBottom: 12 }}>Trainingsfortschritt</div>

      {/* Exercise chip picker – scrolls horizontally on narrow screens */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
        {ALL_EXERCISES.map(ex => (
          <button
            key={ex.id}
            onClick={() => setSelId(ex.id)}
            style={{
              padding: '7px 13px', borderRadius: 100, border: 'none',
              background: selId === ex.id ? 'var(--clr-accent)' : 'var(--clr-surface-2)',
              color: selId === ex.id ? '#fff' : 'var(--clr-text-2)',
              fontSize: 13, fontWeight: selId === ex.id ? 600 : 400,
              cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
            }}
          >
            {ex.name}
          </button>
        ))}
      </div>

      {chartData.length === 0 ? (
        <div className="card" style={{ padding: '20px', textAlign: 'center', marginBottom: 16 }}>
          <div style={{ color: 'var(--clr-text-3)', fontSize: 14 }}>
            Noch keine Einträge für „{selEx?.name}"
          </div>
        </div>
      ) : (
        <>
          <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
            <LineChart
              data={chartData}
              color="#5E5CE6"
              unit={unit}
              title={isTime
                ? `${selEx?.name} (Max. Sekunden)`
                : `${selEx?.name} (Max. Gewicht)`}
            />
          </div>

          <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
            <div className="headline" style={{ marginBottom: 12 }}>Letzte Einheiten</div>
            {[...sessionLogs].reverse().slice(0, 6).map((log, i, arr) => {
              const maxVal = Math.max(0, ...log.sets.map(s => isTime ? s.reps : s.weightKg));
              return (
                <div key={log.id} style={{
                  paddingBottom: i < arr.length - 1 ? 10 : 0,
                  marginBottom:  i < arr.length - 1 ? 10 : 0,
                  borderBottom:  i < arr.length - 1 ? '1px solid var(--clr-separator-2)' : 'none',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{fmtLong(log.date)}</span>
                    <span style={{ fontWeight: 600, fontSize: 14, color: '#5E5CE6' }}>
                      Max: {maxVal} {unit}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--clr-text-3)' }}>
                    {log.sets.map((s, si) => (
                      <span key={si}>
                        {si > 0 && ' · '}
                        {isTime ? `${s.reps} s` : `${s.weightKg} kg × ${s.reps}`}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── VerlaufPage ───────────────────────────────────────────────

export function VerlaufPage() {
  const [tick, setTick] = useState(0);

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div style={{ padding: '20px 20px 40px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 className="large-title" style={{ margin: 0 }}>Verlauf</h1>
          <p className="subhead" style={{ margin: '4px 0 0', color: 'var(--clr-text-3)' }}>
            Deine Trainingsgeschichte
          </p>
        </div>

        <WochenCheckCard onSaved={() => setTick(t => t + 1)} />
        <BodyMetricsSection tick={tick} />
        <ExerciseProgressSection />
      </div>
    </div>
  );
}

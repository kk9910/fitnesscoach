import { useState, useRef } from 'react';
import type { CSSProperties } from 'react';
import { getProfile, setProfile, exportData, importData } from '../store/storage';
import type { Profile } from '../types';

// ─── Weekday toggle data ───────────────────────────────────────

const WEEKDAYS = [
  { label: 'Mo', dow: 1 },
  { label: 'Di', dow: 2 },
  { label: 'Mi', dow: 3 },
  { label: 'Do', dow: 4 },
  { label: 'Fr', dow: 5 },
  { label: 'Sa', dow: 6 },
  { label: 'So', dow: 0 },
];

// ─── ProfileCard ──────────────────────────────────────────────

function ProfileCard() {
  const [initial] = useState(() => getProfile());

  const [startWeight, setStartWeight] = useState(initial.startWeightKg?.toString()  ?? '');
  const [height,      setHeight]      = useState(initial.heightCm?.toString()        ?? '');
  const [kcalMin,     setKcalMin]     = useState(initial.kcalTargetMin?.toString()   ?? '2100');
  const [kcalMax,     setKcalMax]     = useState(initial.kcalTargetMax?.toString()   ?? '2300');
  const [protein,     setProtein]     = useState(initial.proteinTargetG?.toString()  ?? '150');
  const [startDate,   setStartDate]   = useState(initial.programStartDate            ?? '');
  const [workdays,    setWorkdays]    = useState<number[]>(initial.workdays           ?? [3, 4]);
  const [savedOk,     setSavedOk]     = useState(false);

  function toggleWorkday(dow: number) {
    setWorkdays(prev => prev.includes(dow) ? prev.filter(d => d !== dow) : [...prev, dow]);
    setSavedOk(false);
  }

  function handleSave() {
    const profile: Profile = {
      startWeightKg:   startWeight ? parseFloat(startWeight)     : undefined,
      heightCm:        height      ? parseFloat(height)          : undefined,
      kcalTargetMin:   kcalMin     ? parseInt(kcalMin,   10)     : 2100,
      kcalTargetMax:   kcalMax     ? parseInt(kcalMax,   10)     : 2300,
      proteinTargetG:  protein     ? parseInt(protein,   10)     : 150,
      programStartDate: startDate  || undefined,
      workdays,
    };
    setProfile(profile);
    setSavedOk(true);
  }

  const inputStyle: CSSProperties = {
    width: '100%', background: 'var(--clr-surface-2)',
    border: '1px solid var(--clr-separator)', borderRadius: 10,
    padding: '10px 12px', fontSize: 16, color: 'var(--clr-text-1)',
    outline: 'none', boxSizing: 'border-box',
  };

  const fields: { label: string; value: string; set: (v: string) => void; placeholder: string; mode?: string; type?: string }[] = [
    { label: 'Startgewicht (kg)', value: startWeight, set: setStartWeight, placeholder: 'z. B. 88',  mode: 'decimal'  },
    { label: 'Körpergröße (cm)',  value: height,      set: setHeight,      placeholder: 'z. B. 178', mode: 'decimal'  },
    { label: 'kcal-Ziel Min',     value: kcalMin,     set: setKcalMin,     placeholder: '2100',       mode: 'numeric'  },
    { label: 'kcal-Ziel Max',     value: kcalMax,     set: setKcalMax,     placeholder: '2300',       mode: 'numeric'  },
    { label: 'Protein-Ziel (g)',  value: protein,     set: setProtein,     placeholder: '150',        mode: 'numeric'  },
    { label: 'Programmstart',     value: startDate,   set: setStartDate,   placeholder: '',           type: 'date'     },
  ];

  return (
    <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="headline">Mein Profil</div>
        {savedOk && (
          <svg width="22" height="22" viewBox="0 0 22 22">
            <circle cx="11" cy="11" r="11" fill="#34C759" />
            <path d="M6 11.5L9.5 15L16 8" stroke="white" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {fields.map(({ label, value, set, placeholder, mode, type }) => (
          <div key={label}>
            <div style={{ fontSize: 12, color: 'var(--clr-text-3)', marginBottom: 6 }}>{label}</div>
            <input
              type={type ?? 'number'}
              inputMode={mode as React.HTMLAttributes<HTMLInputElement>['inputMode']}
              placeholder={placeholder}
              value={value}
              onChange={e => { set(e.target.value); setSavedOk(false); }}
              style={{ ...inputStyle, colorScheme: type === 'date' ? 'light dark' : undefined }}
            />
          </div>
        ))}
      </div>

      {/* Arbeitstage */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: 'var(--clr-text-3)', marginBottom: 8 }}>
          Arbeitstage (esse mittags auswärts)
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          {WEEKDAYS.map(({ label, dow }) => {
            const active = workdays.includes(dow);
            return (
              <button
                key={dow}
                onClick={() => toggleWorkday(dow)}
                style={{
                  flex: 1, minWidth: 0, height: 38,
                  borderRadius: 8, border: 'none',
                  background: active ? 'var(--clr-accent)' : 'var(--clr-surface-2)',
                  color: active ? '#fff' : 'var(--clr-text-2)',
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleSave}
        style={{
          width: '100%', padding: '13px', borderRadius: 12, border: 'none',
          background: 'var(--clr-accent)', color: 'white',
          fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        Speichern
      </button>
    </div>
  );
}

// ─── DataCard ─────────────────────────────────────────────────

function DataCard() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importError,  setImportError]  = useState<string | null>(null);
  const [importOk,     setImportOk]     = useState(false);
  const [pendingData,  setPendingData]  = useState<string | null>(null);
  const [showConfirm,  setShowConfirm]  = useState(false);

  function handleExport() {
    const json = JSON.stringify(exportData(), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `fc-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      try {
        JSON.parse(text);
        setPendingData(text);
        setShowConfirm(true);
        setImportError(null);
      } catch {
        setImportError('Ungültige Datei – kein gültiges JSON.');
      }
    };
    reader.readAsText(file);
  }

  function handleConfirmImport() {
    if (!pendingData) return;
    try {
      importData(JSON.parse(pendingData));
      setImportOk(true);
      setShowConfirm(false);
      setPendingData(null);
    } catch {
      setImportError('Import fehlgeschlagen – bitte Datei prüfen.');
      setShowConfirm(false);
    }
  }

  const btnBase: CSSProperties = {
    width: '100%', padding: '13px', borderRadius: 12, border: 'none',
    fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  };

  return (
    <>
      <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
        <div className="headline" style={{ marginBottom: 4 }}>Daten & Backup</div>
        <div style={{ fontSize: 13, color: 'var(--clr-text-3)', marginBottom: 16 }}>
          Alle Daten liegen nur lokal auf dem Gerät – kein Cloud-Sync.
        </div>

        {/* Export */}
        <button
          onClick={handleExport}
          style={{ ...btnBase, background: 'var(--clr-accent)', color: 'white', marginBottom: 10 }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 2v9M5 7.5l4 4 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 13.5v1a1.5 1.5 0 001.5 1.5h11a1.5 1.5 0 001.5-1.5v-1" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Alle Daten exportieren (.json)
        </button>

        {/* Import */}
        <button
          onClick={() => { setImportError(null); setImportOk(false); fileRef.current?.click(); }}
          style={{ ...btnBase, background: 'var(--clr-surface-2)', color: 'var(--clr-text-1)', border: '1px solid var(--clr-separator)' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 11.5V2.5M5 6l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 13.5v1a1.5 1.5 0 001.5 1.5h11a1.5 1.5 0 001.5-1.5v-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Backup einlesen
        </button>

        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {importError && (
          <div style={{
            marginTop: 12, padding: '10px 14px', borderRadius: 10,
            background: 'rgba(255,59,48,0.10)', color: '#FF3B30', fontSize: 14,
          }}>
            {importError}
          </div>
        )}

        {importOk && (
          <div style={{
            marginTop: 12, padding: '10px 14px', borderRadius: 10,
            background: 'rgba(52,199,89,0.10)', color: '#34C759', fontSize: 14,
          }}>
            Import erfolgreich.{' '}
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'none', border: 'none', color: '#34C759',
                fontWeight: 700, cursor: 'pointer', fontSize: 14, padding: 0,
                textDecoration: 'underline',
              }}
            >
              App neu laden
            </button>
          </div>
        )}
      </div>

      {/* Confirm overlay */}
      {showConfirm && (
        <div
          onClick={() => { setShowConfirm(false); setPendingData(null); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 24px', touchAction: 'none',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--clr-surface)', borderRadius: 20,
              padding: '24px 24px 20px', width: '100%', maxWidth: 360,
              boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
            }}
          >
            <div className="headline" style={{ marginBottom: 8 }}>Daten überschreiben?</div>
            <div className="subhead" style={{ color: 'var(--clr-text-2)', marginBottom: 24, lineHeight: 1.5 }}>
              Alle aktuellen Trainings-Logs, Wochen-Checks und Profildaten werden durch das Backup ersetzt. Das lässt sich nicht rückgängig machen.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setShowConfirm(false); setPendingData(null); }}
                style={{
                  flex: 1, padding: '13px', borderRadius: 12, border: 'none',
                  background: 'var(--clr-surface-2)', color: 'var(--clr-text-1)',
                  fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Abbrechen
              </button>
              <button
                onClick={handleConfirmImport}
                style={{
                  flex: 1, padding: '13px', borderRadius: 12, border: 'none',
                  background: '#FF3B30', color: 'white',
                  fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Ersetzen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── ProfilPage ────────────────────────────────────────────────

export function ProfilPage() {
  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div style={{ padding: '20px 20px 40px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 className="large-title" style={{ margin: 0 }}>Einstellungen</h1>
          <p className="subhead" style={{ margin: '4px 0 0', color: 'var(--clr-text-3)' }}>
            Lokal auf dem Gerät — kein Cloud-Sync
          </p>
        </div>

        <ProfileCard />
        <DataCard />
      </div>
    </div>
  );
}

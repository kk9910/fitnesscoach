import { ProgressRing } from '../components/ProgressRing';

const WEEKDAY = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
const MONTH   = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

export function HeutePage() {
  const now     = new Date();
  const weekday = WEEKDAY[now.getDay()];
  const date    = `${now.getDate()}. ${MONTH[now.getMonth()]}`;

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
        <div style={{ marginBottom: '28px' }}>
          <h1 className="large-title" style={{ margin: 0 }}>Heute</h1>
          <p
            className="subhead"
            style={{ margin: '4px 0 0', color: 'var(--clr-text-3)' }}
          >
            {weekday}, {date}
          </p>
        </div>

        {/* ── Activity Ring Card ── */}
        <div
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            padding: '20px 24px',
            marginBottom: '16px',
          }}
        >
          <ProgressRing progress={0} size={84} strokeWidth={8} centerLabel="0" centerSub="/ 3" />
          <div>
            <div className="headline" style={{ color: 'var(--clr-text-1)' }}>Bereit für heute?</div>
            <div className="subhead" style={{ marginTop: '4px', color: 'var(--clr-text-3)' }}>
              Noch keine Einheit abgehakt
            </div>
          </div>
        </div>

        {/* ── Training Card (Placeholder) ── */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '0.5px solid var(--clr-separator)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span className="headline">Training</span>
            <span className="footnote" style={{ color: 'var(--clr-accent)' }}>Kraft A</span>
          </div>
          <div style={{ padding: '16px 20px 20px' }}>
            <div
              style={{
                height: '44px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--clr-surface-2)',
                display: 'flex',
                alignItems: 'center',
                paddingInline: '14px',
              }}
            >
              <span className="subhead" style={{ color: 'var(--clr-text-3)' }}>
                Übungen folgen in Schritt 4
              </span>
            </div>
          </div>
        </div>

        {/* ── Meals Card (Placeholder) ── */}
        <div className="card">
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '0.5px solid var(--clr-separator)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span className="headline">Mahlzeiten</span>
            <span className="footnote" style={{ color: 'var(--clr-text-3)' }}>3 geplant</span>
          </div>

          {['Frühstück', 'Mittagessen', 'Abendessen'].map((meal, i) => (
            <div
              key={meal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '13px 20px',
                borderBottom: i < 2 ? '0.5px solid var(--clr-separator-2)' : undefined,
              }}
            >
              {/* Checkbox placeholder */}
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: '1.5px solid var(--clr-separator)',
                  flexShrink: 0,
                }}
              />
              <div>
                <div className="callout" style={{ fontWeight: 500 }}>{meal}</div>
                <div className="footnote" style={{ marginTop: '1px' }}>Folgt in Schritt 4</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

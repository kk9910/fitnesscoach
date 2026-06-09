import type { Tab } from '../App';

// ── SVG Icons (outline → active = heavier stroke + accent color) ──

function RingIcon({ active }: { active: boolean }) {
  const sw = active ? 2.4 : 1.7;
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <circle cx="13" cy="13" r="9.5"  stroke="currentColor" strokeWidth={sw} />
      <circle cx="13" cy="13" r="5"    stroke="currentColor" strokeWidth={sw} />
    </svg>
  );
}

function CalendarIcon({ active }: { active: boolean }) {
  const sw = active ? 2.4 : 1.7;
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <rect x="3" y="5" width="20" height="18" rx="4" stroke="currentColor" strokeWidth={sw} />
      <line x1="3" y1="10.5" x2="23" y2="10.5" stroke="currentColor" strokeWidth={sw} />
      <line x1="8.5"  y1="2.5" x2="8.5"  y2="7.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      <line x1="17.5" y1="2.5" x2="17.5" y2="7.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
}

function ChartIcon({ active }: { active: boolean }) {
  const sw = active ? 2.4 : 1.7;
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <polyline
        points="2.5,20 7.5,13 12,16.5 17.5,8 23.5,13.5"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

const TABS: { id: Tab; label: string; Icon: React.FC<{ active: boolean }> }[] = [
  { id: 'heute',   label: 'Heute',   Icon: RingIcon     },
  { id: 'plan',    label: 'Plan',    Icon: CalendarIcon },
  { id: 'verlauf', label: 'Verlauf', Icon: ChartIcon    },
];

interface TabBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav
      className="glass"
      style={{
        display: 'flex',
        flexShrink: 0,
        borderTop: '0.5px solid var(--clr-glass-border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {TABS.map(({ id, label, Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              padding: '10px 0 8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: active ? 'var(--clr-accent)' : 'var(--clr-text-3)',
              fontSize: '10px',
              fontWeight: active ? 600 : 400,
              fontFamily: 'inherit',
              letterSpacing: '0.02em',
              minHeight: '49px',
              transition: 'color 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <span
              style={{
                display: 'flex',
                transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: active ? 'scale(1.08)' : 'scale(1)',
              }}
            >
              <Icon active={active} />
            </span>
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

interface ProgressRingProps {
  /** 0.0 – 1.0 */
  progress: number;
  size?: number;
  strokeWidth?: number;
  /** number shown in center (e.g. "2") */
  centerLabel?: string;
  /** small text below center label (e.g. "/ 3") */
  centerSub?: string;
}

export function ProgressRing({
  progress,
  size = 88,
  strokeWidth = 9,
  centerLabel,
  centerSub,
}: ProgressRingProps) {
  const c = size / 2;
  const r = c - strokeWidth / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.max(0, Math.min(1, progress)));

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
        {/* Track */}
        <circle
          cx={c} cy={c} r={r}
          fill="none"
          stroke="var(--clr-accent-soft)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={c} cy={c} r={r}
          fill="none"
          stroke="var(--clr-accent)"
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${c} ${c})`}
          style={{
            opacity: progress === 0 ? 0 : 1,
            transition:
              'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
          }}
        />
      </svg>

      {(centerLabel !== undefined || centerSub !== undefined) && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1px',
          }}
        >
          {centerLabel !== undefined && (
            <span style={{ fontSize: size * 0.26, fontWeight: 700, lineHeight: 1, color: 'var(--clr-text-1)' }}>
              {centerLabel}
            </span>
          )}
          {centerSub !== undefined && (
            <span style={{ fontSize: size * 0.14, color: 'var(--clr-text-3)', lineHeight: 1 }}>
              {centerSub}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

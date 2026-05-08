import { ICON_PATHS, type IconName } from '@/icons/paths';

type AtelierIconProps = {
  name: IconName;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
};

// Color: inherits from parent via `currentColor`. Set `color: var(--color-amber)` on the wrapper.
// Size: default 16px. Production sizes: 12 (work card), 13 (phase tag), 16 (thread junction).
// Stroke width: 0.85 kit default; needle shaft overrides to 1.4, needle thread to 0.6.
// IMPORTANT: supplemental shapes here must stay in sync with buildIconSVGInnerHTML in paths.ts.
export function AtelierIcon({ name, size = 16, className, style }: AtelierIconProps) {
  const sharedStroke = {
    stroke: "currentColor" as const,
    fill: "none" as const,
    strokeWidth: 0.85,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  // Per-icon path-render overrides
  const isStitched = name === 'node';
  const isNeedle = name === 'needle';

  return (
    <svg
      viewBox="0 0 22 22"
      width={size}
      height={size}
      aria-hidden="true"
      className={className}
      style={style}
      {...sharedStroke}
    >
      <path
        d={ICON_PATHS[name]}
        strokeDasharray={isStitched ? "1.5 2.5" : undefined}
        strokeWidth={isNeedle ? 1.4 : undefined}
      />

      {/* Shears — V5: finger-loops + center pivot dot */}
      {name === 'shears' && (
        <>
          <circle cx="5" cy="5" r="2.4" {...sharedStroke} />
          <circle cx="17" cy="5" r="2.4" {...sharedStroke} />
          <circle cx={11} cy={11} r={0.7} fill="currentColor" stroke="none" />
        </>
      )}

      {/* Needle — V3: oval eye + dashed thread anchor */}
      {name === 'needle' && (
        <>
          <ellipse cx="11" cy="5" rx="1.5" ry="2" fill="none" stroke="currentColor" strokeWidth={0.85} />
          <path
            d="M 11 3 Q 6 3 5 7"
            fill="none"
            stroke="currentColor"
            strokeWidth={0.6}
            strokeLinecap="round"
            strokeDasharray="1 1.5"
          />
        </>
      )}

      {/* Node — pin-mark nodes (filled, not stroked rings) */}
      {name === 'node' && (
        <>
          <circle cx="11" cy="5" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="5" cy="17" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="17" cy="17" r="1.4" fill="currentColor" stroke="none" />
        </>
      )}

      {/* Grading — V3: filled middle row in 3-row spec sheet */}
      {name === 'grading' && (
        <rect x={5} y={9} width={12} height={5} fill="currentColor" stroke="none" />
      )}
    </svg>
  );
}

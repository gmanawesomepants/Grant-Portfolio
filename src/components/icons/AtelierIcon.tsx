import { ICON_PATHS, type IconName } from '@/icons/paths';

type AtelierIconProps = {
  name: IconName;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
};

// Color: inherits from parent via `currentColor`. Set `color: var(--color-amber)` on the wrapper.
// Size: default 16px. Production sizes: 12 (work card), 13 (phase tag), 14 (thread junction).
// IMPORTANT: supplemental shapes here must stay in sync with buildIconSVGInnerHTML in paths.ts.
export function AtelierIcon({ name, size = 16, className, style }: AtelierIconProps) {
  const sharedStroke = {
    stroke: "currentColor" as const,
    fill: "none" as const,
    strokeWidth: 0.85,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  // Node uses dashed strokes for stitched-edge metaphor; all others use solid strokes
  const isStitched = name === 'node';

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
      />

      {/* Shears — Phase 0 V5: two finger-loops at top + center pivot dot */}
      {name === 'shears' && (
        <>
          <circle cx="5" cy="5" r="2.4" {...sharedStroke} />
          <circle cx="17" cy="5" r="2.4" {...sharedStroke} />
          <circle cx={11} cy={11} r={0.7} fill="currentColor" stroke="none" />
        </>
      )}

      {/* Needle — eye is stroke-only inner circle (works on any background) */}
      {name === 'needle' && (
        <circle cx="11" cy="4.8" r="0.9" stroke="currentColor" fill="none" strokeWidth={0.85} />
      )}

      {/* Node — pin-mark nodes (filled, not stroked rings) */}
      {name === 'node' && (
        <>
          <circle cx="11" cy="5" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="5" cy="17" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="17" cy="17" r="1.4" fill="currentColor" stroke="none" />
        </>
      )}

      {/* Grading — Phase 0 V3: filled middle row in 3-row spec sheet */}
      {name === 'grading' && (
        <rect x={5} y={9} width={12} height={5} fill="currentColor" stroke="none" />
      )}
    </svg>
  );
}

type CrosshairProps = {
  cx: number;
  cy: number;
  variant?: "registration" | "anchor";
};

export function Crosshair({ cx, cy, variant = "registration" }: CrosshairProps) {
  const isAnchor = variant === "anchor";
  const r = isAnchor ? 6 : 3.5;
  const halfCross = isAnchor ? 9 : 6;
  const strokeWidth = isAnchor ? 1 : 0.5;
  const opacity = isAnchor ? 0.95 : 0.6;

  return (
    <g>
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="var(--color-amber)"
        strokeOpacity={opacity}
        strokeWidth={strokeWidth}
        pathLength={1}
      />
      <line
        x1={cx - halfCross} y1={cy} x2={cx + halfCross} y2={cy}
        stroke="var(--color-amber)"
        strokeOpacity={opacity}
        strokeWidth={strokeWidth}
        pathLength={1}
      />
      <line
        x1={cx} y1={cy - halfCross} x2={cx} y2={cy + halfCross}
        stroke="var(--color-amber)"
        strokeOpacity={opacity}
        strokeWidth={strokeWidth}
        pathLength={1}
      />
      {isAnchor && (
        <circle cx={cx} cy={cy} r={1.2} fill="var(--color-amber)" fillOpacity={0.9} />
      )}
    </g>
  );
}

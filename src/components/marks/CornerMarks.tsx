type CornerMarksProps = {
  width: number;
  height: number;
  inset?: number;
};

export function CornerMarks({ width, height, inset = 20 }: CornerMarksProps) {
  const leg = 8;
  return (
    <g stroke="var(--color-amber)" strokeOpacity={0.4} strokeWidth={0.5} fill="none">
      {/* BL corner: opens up-right */}
      <path
        d={`M ${inset} ${height - inset} L ${inset} ${height - inset - leg} L ${inset + leg} ${height - inset - leg}`}
        pathLength={1}
      />
      {/* BR corner: opens up-left */}
      <path
        d={`M ${width - inset - leg} ${height - inset - leg} L ${width - inset} ${height - inset - leg} L ${width - inset} ${height - inset}`}
        pathLength={1}
      />
    </g>
  );
}

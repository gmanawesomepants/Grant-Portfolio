type LedgerRuleProps = { y: number; x1?: number; x2?: number };

export function LedgerRule({ y, x1 = 0, x2 = 360 }: LedgerRuleProps) {
  return (
    <line
      x1={x1} y1={y} x2={x2} y2={y}
      stroke="var(--color-amber)"
      strokeOpacity={0.12}
      strokeWidth={0.3}
      pathLength={1}
    />
  );
}

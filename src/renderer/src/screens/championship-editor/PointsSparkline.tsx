interface PointsSparklineProps {
  /**
   * What each finishing place scores, the winner first.
   */
  values: readonly number[];
}

/**
 * A system's curve in miniature, so two systems are told apart at a glance.
 * Drawn in the current text colour.
 */
export const PointsSparkline = ({ values }: PointsSparklineProps) => {
  const max = Math.max(1, ...values);
  const span = Math.max(1, values.length - 1);
  const points = values.map((value, place) => `${(place / span) * 70},${30 - (value / max) * 26}`).join(' ');

  return (
    <svg viewBox="0 0 70 30" preserveAspectRatio="none" className="h-7 w-16 shrink-0" aria-hidden>
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

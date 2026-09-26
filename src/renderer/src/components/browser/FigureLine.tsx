interface FigureLineProps {
  /**
   * The figures with the unit each is in, already translated. A figure nobody
   * stated is null and left out, rather than shown as a gap.
   */
  figures: readonly { unit: string; value: string | null }[];
}

/**
 * A card's key figures as one line of text, the number bold and its unit beside
 * it, wrapping when the card is narrow.
 */
export const FigureLine = ({ figures }: FigureLineProps) => (
  <p className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground tabular-nums">
    {figures.filter((figure) => figure.value !== null).map((figure) => (
      <span key={figure.unit}>
        <b className="text-[13px] font-semibold text-foreground">{figure.value}</b>
        {' '}
        {figure.unit}
      </span>
    ))}
  </p>
);

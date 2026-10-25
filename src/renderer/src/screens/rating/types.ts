/**
 * One line of the rating chart.
 */
export interface ChartLine {
  /**
   * What tells it from the others.
   */
  key: string;
  /**
   * What it is called, at its end and in the tooltip.
   */
  label: string;
  /**
   * The colour it is drawn in.
   */
  color: string;
  /**
   * Whether it is dashed, as the global rating is.
   */
  dashed?: boolean;
  /**
   * Its value at each point.
   */
  values: readonly number[];
}

/**
 * A mark along the chart's bottom.
 */
export interface ChartTick {
  /**
   * The point it stands at.
   */
  at: number;
  /**
   * What it says.
   */
  label: string;
}

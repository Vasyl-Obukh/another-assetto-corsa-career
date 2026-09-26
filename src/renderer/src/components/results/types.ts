import type { ReactNode } from 'react';

/**
 * What a driver's cell of the season grid says: what the race paid, or where
 * they finished.
 */
export type StandingsView = 'points' | 'positions';

/**
 * One figure of a result strip.
 */
export interface StripFigure {
  /**
   * What it is, in the strip's small capitals.
   */
  label: string;
  /**
   * The figure itself.
   */
  value: ReactNode;
  /**
   * What sits beside the figure, smaller and quieter.
   */
  detail?: ReactNode;
}

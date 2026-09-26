import type { Discipline, LadderPosition } from '../../../../shared/types';

/**
 * One round a championship runs at a circuit.
 */
export interface CircuitRound {
  /**
   * What the championship calls the round.
   */
  name: string;
  /**
   * The layout it runs, by folder name - empty for a single-layout circuit.
   */
  layout: string;
}

/**
 * A championship that races at a circuit, and where.
 */
export interface CircuitChampionship {
  /**
   * The championship's id, for the link to its page.
   */
  id: string;
  /**
   * What it is called.
   */
  name: string;
  /**
   * The discipline it is listed under: its first class's.
   */
  discipline: Discipline;
  /**
   * Every rung its classes enter at, once each, highest first.
   */
  ladders: readonly LadderPosition[];
  /**
   * Its rounds at this circuit, in calendar order.
   */
  rounds: readonly CircuitRound[];
}

/**
 * One picture the track page's stage can show.
 */
export interface StagePhoto {
  /**
   * Identifies the picture among its siblings.
   */
  key: string;
  /**
   * Where to fetch it, best first.
   */
  sources: readonly string[];
  /**
   * Whether it is a layout's small preview standing in for a loading-screen
   * photograph, and so drawn softened rather than blown up sharp.
   */
  soft: boolean;
}

/**
 * Where a circuit is, as its heading states it.
 */
export interface CircuitPlace {
  /**
   * The nation it is in, as a code for its flag, or null when its country names none.
   */
  nation: string | null;
  /**
   * Its country and city as one line, whichever of the two it states, or null for neither.
   */
  place: string | null;
}

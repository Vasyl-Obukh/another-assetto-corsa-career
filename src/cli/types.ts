import type { RaceDefinition } from '../shared/types/index.ts';

/**
 * A race definition and where it was read from.
 */
export interface LoadedRace {
  /**
   * Absolute path to the JSON file.
   */
  file: string;
  /**
   * The parsed definition, unvalidated.
   */
  race: RaceDefinition;
}

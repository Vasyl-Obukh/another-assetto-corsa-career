import type { Track } from '../../../../shared/types';
import type { RecommendedEntry } from '../../../../shared/utils/recommended-tracks';
import type { OutgrownChampionship } from '@/lib/circuit-usage';

/**
 * A track picked for a recommended layout, and the championships it is too
 * small for.
 */
export interface Choice {
  /**
   * The layout and its circuit.
   */
  entry: RecommendedEntry;
  /**
   * The track.
   */
  track: Track;
  /**
   * Every championship racing the layout that it cannot hold.
   */
  short: readonly OutgrownChampionship[];
}

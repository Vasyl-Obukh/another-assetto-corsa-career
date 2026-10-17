// A career's saves: snapshots of its whole state, taken by hand or on the way.

import type { Career } from './career.ts';
import type { SessionType } from './race.ts';

/**
 * What kind of save one is.
 *
 * Only a named save is the player's to write over, rename or delete; an
 * autosave and the quick save are kept by the app.
 */
export type SaveKind = 'named' | 'quick' | 'auto';

/**
 * What an autosave was taken after, which is what names it.
 */
export type SaveMoment = {
  /**
   * A session that landed.
   */
  kind: 'session';
  /**
   * The championship the session belongs to.
   */
  seriesName: string;
  /**
   * The round it belongs to.
   */
  roundName: string;
  /**
   * The session, named as its format names it, or by its kind.
   */
  session: {
    /**
     * Its own name, or null for one named by its kind.
     */
    name: string | null;
    /**
     * Which kind of session it is.
     */
    type: SessionType;
  };
} | {
  /**
   * A new season that opened.
   */
  kind: 'season';
  /**
   * The year it opened.
   */
  year: number;
};

/**
 * One save, as lists show it - everything but the state it holds.
 */
export interface SaveSummary {
  /**
   * The save's id, which names its file: `quicksave`, `autosave-<n>`, or a
   * UUID for a named save.
   */
  id: string;
  /**
   * What kind of save it is.
   */
  kind: SaveKind;
  /**
   * The name the player gave it, or null for an autosave and the quick save.
   */
  name: string | null;
  /**
   * When it was saved, as an ISO timestamp.
   */
  savedAt: string;
  /**
   * The career's clock when it was saved, as an ISO date.
   */
  date: string;
  /**
   * What an autosave was taken after, or null for any other save.
   */
  moment: SaveMoment | null;
}

/**
 * A career's saves, as pushed whenever one is written, renamed or deleted.
 */
export interface CareerSaves {
  /**
   * The career's id.
   */
  career: string;
  /**
   * Its saves, newest first.
   */
  saves: SaveSummary[];
}

/**
 * A save just loaded, and the career it put back.
 */
export interface LoadedSave {
  /**
   * The career, now open as the save held it.
   */
  career: Career;
  /**
   * The save it came from.
   */
  save: SaveSummary;
}

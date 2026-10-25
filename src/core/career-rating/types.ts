import type {
  CareerSeason, Discipline, LaunchRecord, SeasonEntry, SeasonEvent, SessionType,
} from '../../shared/types/index.ts';

/**
 * How one session moves a rating against its field.
 */
export interface SessionMove {
  /**
   * What it does to the rating, whole and already held by the cap.
   */
  change: number;
  /**
   * What it would have taken, when the cap held it.
   */
  uncapped?: number;
  /**
   * The share of the field beaten, from 0 to 1.
   */
  beaten: number;
  /**
   * The share the field's ratings expected to be beaten.
   */
  expectedShare: number;
  /**
   * The place the field's ratings expected, counting from one.
   */
  expected: number;
}

/**
 * A session driven and not yet rated: what rating it needs, gathered before
 * any of them is rated, since each moves the rating the next is rated from.
 */
export interface PendingSession {
  /**
   * The key its line is posted under.
   */
  key: string;
  /**
   * The season it falls in.
   */
  season: CareerSeason;
  /**
   * The season's entry.
   */
  entry: SeasonEntry;
  /**
   * The round.
   */
  event: SeasonEvent;
  /**
   * Which kind of session it is.
   */
  type: Extract<SessionType, 'race' | 'qualify'>;
  /**
   * The session's own name, where its format gives one.
   */
  name?: string;
  /**
   * When it landed, which orders sessions of one day.
   */
  completedAt: string;
  /**
   * The discipline of the class the player raced in.
   */
  discipline: Discipline;
  /**
   * The rung of that class, or null to rate it on the player's own, as a
   * historic event is.
   */
  tier: number | null;
  /**
   * The player's place among their classmates, counting from one.
   */
  place: number;
  /**
   * Each classmate's strength over the player's own Opponents setting.
   */
  offsets: readonly number[];
  /**
   * The launch it was rated off, for its shortening.
   */
  record: LaunchRecord;
}

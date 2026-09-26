import type {
  RacePlace, ResultRecord, SeasonEntry, SessionSummary, SessionType, Standing,
} from '../../../../shared/types';

/**
 * Where an archived session sits in the career, when a championship round
 * produced it.
 */
export interface ArchiveOrigin {
  /**
   * Which season of the career, counting from zero.
   */
  season: number;
  /**
   * The season entry the round belongs to.
   */
  entry: SeasonEntry;
  /**
   * The round, by its id.
   */
  round: string;
  /**
   * Which launch of the weekend it was.
   */
  launch: number;
}

/**
 * One archived session, as a weekend card lists it.
 */
export interface ResultSession {
  /**
   * The archive.
   */
  record: ResultRecord;
  /**
   * The session it holds.
   */
  session: SessionSummary;
  /**
   * Which kind of session it was.
   */
  type: SessionType;
  /**
   * Its name, as the race was named when it ran, or null for one named only
   * by its type.
   */
  name: string | null;
  /**
   * The player's own row of it, or null when it classified nobody.
   */
  player: Standing | null;
  /**
   * What the player took from it, for a scored championship race.
   */
  place: RacePlace | null;
}

/**
 * One weekend of archived sessions: a championship round, or a run of
 * sessions of the same race on the same day.
 */
export interface ResultWeekend {
  /**
   * The weekend's identity.
   */
  key: string;
  /**
   * Where it sits in the career, for a championship round.
   */
  origin: ArchiveOrigin | null;
  /**
   * The race's name with the session's taken off, for anything else.
   */
  title: string;
  /**
   * Its sessions, in the order they ran.
   */
  sessions: ResultSession[];
  /**
   * When its first session ran, as an ISO timestamp.
   */
  from: string;
  /**
   * When its last session ran, as an ISO timestamp.
   */
  to: string;
}

import type {
  QuickRaceArchives, QuickRaceLaunch, RacePlace, ResultRecord, SeasonEntry, SessionSummary, SessionType,
  Standing,
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
   * Which launch of the event it was.
   */
  launch: number;
}

/**
 * Which race event of the player's own an archived session was run for, when
 * that race still lists it.
 */
export interface QuickOrigin {
  /**
   * The race.
   */
  race: QuickRaceArchives;
  /**
   * The launch of it that wrote the archive.
   */
  launch: QuickRaceLaunch;
}

/**
 * One archived session, as an event card lists it.
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
  /**
   * Where the player finished: among their own class wherever the event says
   * which class each car raced in, and overall elsewhere - or null when it
   * classified nobody.
   */
  position: number | null;
}

/**
 * One event of archived sessions: a championship round, a race event of the
 * player's own, or a run of sessions of the same race on the same day.
 */
export interface ResultEvent {
  /**
   * The event's identity.
   */
  key: string;
  /**
   * Where it sits in the career, for a championship round.
   */
  origin: ArchiveOrigin | null;
  /**
   * The race event it was run for, when a race of the player's own still
   * lists it.
   */
  quick: QuickOrigin | null;
  /**
   * The race's name: a race event's own, or the archive's with the session's
   * taken off.
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

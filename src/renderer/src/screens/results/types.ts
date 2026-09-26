/**
 * Which kind of session the Results page shows: all of them, or one kind.
 */
export type SessionFilter = 'all' | 'practice' | 'qualify' | 'race';

/**
 * What the Results page narrows its weekends by.
 */
export interface ResultsCriteria {
  /**
   * Free text, matched against the championship, the round, the race and the
   * track.
   */
  search: string;
  /**
   * Which kind of session to show.
   */
  kind: SessionFilter;
  /**
   * A championship's id, ALL_CHAMPIONSHIPS or NO_CHAMPIONSHIP.
   */
  championship: string;
}

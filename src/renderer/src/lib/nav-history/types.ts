/**
 * One page the window has been on, at one position of its history.
 */
export interface Visit {
  /**
   * The router's key for the history entry, unique to it.
   */
  key: string;
  /**
   * The path that entry shows.
   */
  pathname: string;
  /**
   * What the page there called itself, or null where it named nothing - a
   * list, which its route names well enough.
   */
  name: string | null;
}

/**
 * How the window arrived at a history entry, as the router reports it.
 */
export type VisitAction = 'PUSH' | 'REPLACE' | 'POP';

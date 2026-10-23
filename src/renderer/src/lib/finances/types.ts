import type { LedgerKind, LedgerLine } from '../../../../shared/types';

/**
 * One line of a career's ledger, with what the career held once it landed.
 */
export interface LedgerRow {
  /**
   * The line.
   */
  line: LedgerLine;
  /**
   * The money held once it was posted.
   */
  balance: number;
}

/**
 * Which lines a ledger shows: every one, what paid the career, what racing a
 * round cost it, or what its garage moved.
 */
export type LedgerFilter = 'all' | 'prizes' | 'fees' | 'cars';

/**
 * A stretch of a career's money in figures.
 */
export interface MoneyFigures {
  /**
   * Everything that came in, the opening balance left out.
   */
  earned: number;
  /**
   * Everything that went out, as a negative amount.
   */
  spent: number;
  /**
   * The money held as the stretch opened: what came before its first line, and
   * the opening balance where the stretch holds it.
   */
  opened: number;
  /**
   * How many races paid a prize.
   */
  prizes: number;
  /**
   * How many entry fees were paid.
   */
  fees: number;
}

/**
 * What one kind of line came to over a stretch.
 */
export interface KindTotal {
  /**
   * The kind.
   */
  kind: LedgerKind;
  /**
   * What its lines came to.
   */
  amount: number;
}

/**
 * What one championship or historic event came to over a stretch.
 */
export interface SeriesTotal {
  /**
   * Its id.
   */
  series: string;
  /**
   * Its name.
   */
  name: string;
  /**
   * Which season and edition it was raced in - the latest, where it ran in
   * several.
   */
  season: number;
  /**
   * Which of the season's editions.
   */
  edition: number;
  /**
   * Whether it is a historic event.
   */
  historic: boolean;
  /**
   * What its lines came to.
   */
  amount: number;
}

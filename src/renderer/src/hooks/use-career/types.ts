import type { Career, CareerCalendar, SkippedRound } from '../../../../shared/types';
import type { toDisplayableError } from '@/lib/ipc';

/**
 * The career, its calendar, and the commands that move either.
 */
export interface CareerState {
  /**
   * The career, or null until the first read has started one.
   */
  career: Career | null;
  /**
   * The current season's calendar, or null before one has loaded.
   */
  calendar: CareerCalendar | null;
  /**
   * Whether the first read is still in flight.
   */
  loading: boolean;
  /**
   * Whether a command is in flight, which is what disables the buttons.
   */
  busy: boolean;
  /**
   * What went wrong, until it is dismissed.
   */
  error: ReturnType<typeof toDisplayableError> | null;
  /**
   * Forgets the last error.
   */
  dismissError: () => void;
  /**
   * Enters a championship for this season.
   * @param series Which championship
   * @param entry Which class of it
   * @param car The car and livery to race
   * @returns Resolves once it has been entered
   */
  enrol: (
    series: string,
    entry: string,
    car: { model: string; skin?: string },
  ) => Promise<void>;
  /**
   * Pulls out of a championship.
   * @param series Which championship
   * @param entry Which class of it
   * @returns Resolves once it has been left
   */
  withdraw: (series: string, entry: string) => Promise<void>;
  /**
   * Terminates the contract an edition is raced under, paying its release fee
   * - or taking a paid seat's refund - and leaving it to the field.
   * @param series Which championship
   * @param entry Which class of it
   * @param edition Which of the season's editions
   * @returns Resolves once it has been terminated
   */
  terminate: (series: string, entry: string, edition: number) => Promise<void>;
  /**
   * Sets the player's own step on the AI's strength for every round of an
   * edition the career is in.
   * @param series Which championship
   * @param edition Which of the season's editions of it
   * @param strength The step, zero for none
   * @returns Resolves once it has been kept
   */
  setStrength: (series: string, edition: number, strength: number) => Promise<void>;
  /**
   * Says whether every round of an edition the career is in may race in the
   * wet.
   * @param series Which championship
   * @param edition Which of the season's editions of it
   * @param rain Whether rain is allowed, or null to follow the championship
   * @returns Resolves once it has been kept
   */
  setRain: (series: string, edition: number, rain: boolean | null) => Promise<void>;
  /**
   * Moves the clock forward.
   * @param date The ISO date to advance towards
   * @param skip Whether to go all the way, past rounds of the career's the
   * player confirmed losing, rather than stopping at the first of them
   * @returns Resolves once the clock has moved
   */
  advanceTo: (date: string, skip?: boolean) => Promise<void>;
  /**
   * What moving the clock to a date would cost, for the player to confirm.
   * @param date The ISO date the clock would move to
   * @returns Every round of the career's it would leave unraced
   */
  skipsTo: (date: string) => Promise<SkippedRound[]>;
}

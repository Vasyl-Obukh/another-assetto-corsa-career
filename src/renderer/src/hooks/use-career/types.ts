import type { Career, CareerCalendar } from '../../../../shared/types';
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
   * Moves the clock forward.
   * @param date The ISO date to advance towards
   * @returns Resolves once the clock has moved
   */
  advanceTo: (date: string) => Promise<void>;
}

import type { CmArguments, CmFlag } from '../../../../shared/types';
import type { DisplayableError } from '@/lib/ipc';

/**
 * What Content Manager's Arguments.txt holds, and how to change it.
 */
export interface CmArgumentsState {
  /**
   * The file's path, whether it exists, and which flags are set. Null until the
   * first read comes back.
   */
  arguments: CmArguments | null;
  /**
   * Whether the first read is still in flight.
   */
  loading: boolean;
  /**
   * Whether a write is in flight, in which case the toggles are held.
   */
  busy: boolean;
  /**
   * Why the last call failed, or null when it did not.
   */
  error: DisplayableError | null;
  /**
   * Adds or removes one flag.
   * @param flag The flag to set
   * @param enabled Whether it should be in the file
   */
  toggle(flag: CmFlag, enabled: boolean): void;
  /**
   * Clears the error, so the card stops showing it.
   */
  dismissError(): void;
}

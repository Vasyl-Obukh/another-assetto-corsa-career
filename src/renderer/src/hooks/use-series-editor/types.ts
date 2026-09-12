import type { Championship, SeriesAvailability, SeriesListing } from '../../../../shared/types';
import type { DisplayableError } from '@/lib/ipc';

/**
 * One championship being edited, as the editor screen renders it.
 */
export interface SeriesEditorState {
  /**
   * The championship as the user has it right now, or null while loading or
   * when the library holds no such championship.
   */
  draft: Championship | null;
  /**
   * What the library last told us about it - the origin, the weekend, and the
   * availability of what is actually on disk. Null on the same terms.
   */
  listing: SeriesListing | null;
  /**
   * What is wrong with the draft, which lags it by the debounce. Null until the
   * first answer arrives.
   */
  checked: SeriesAvailability | null;
  /**
   * Whether the draft differs from what was last written.
   */
  dirty: boolean;
  /**
   * Whether it is still loading.
   */
  loading: boolean;
  /**
   * Whether a save is in flight.
   */
  busy: boolean;
  /**
   * Whether a weekend of this championship is part-way through, in which case
   * nothing may be changed.
   */
  locked: boolean;
  /**
   * Why something failed, or null.
   */
  error: DisplayableError | null;
  /**
   * Clears the error.
   */
  dismissError(): void;
  /**
   * Changes the draft. Nothing reaches main until the user saves.
   * @param change Produces the new championship from the current one
   */
  edit(change: (from: Championship) => Championship): void;
  /**
   * Writes the draft.
   * @returns True when it was written
   */
  save(): Promise<boolean>;
  /**
   * Throws the draft away and starts again from what is on disk.
   */
  discard(): void;
}

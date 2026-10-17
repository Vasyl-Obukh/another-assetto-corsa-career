import type { SaveSummary } from '../../shared/types/index.ts';

/**
 * One save as its file holds it.
 * @template T The state the save holds
 */
export interface SaveFile<T> extends SaveSummary {
  /**
   * Which revision of the save format this is.
   */
  version: number;
  /**
   * The slot's state as it stood.
   */
  state: T;
}

/**
 * Where the next autosave goes, and what makes room for it.
 */
export interface AutosaveSlot {
  /**
   * The id the autosave is written under.
   */
  id: string;
  /**
   * The autosaves to delete, oldest beyond the number kept.
   */
  drop: string[];
}

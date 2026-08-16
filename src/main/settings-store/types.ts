import type { Settings } from '../../shared/types/index.ts';

/**
 * The in-memory settings, and the ways to change and observe them.
 */
export interface SettingsStore {
  /**
   * Reads the current settings.
   * @returns The settings as they stand
   */
  get(): Settings;
  /**
   * Merges a patch in and schedules a write.
   * @param patch The fields to replace
   * @returns The merged settings
   */
  patch(patch: Partial<Settings>): Settings;
  /**
   * Forces any pending write to complete. Call before quitting.
   * @returns Resolves once nothing is left to write
   */
  flush(): Promise<void>;
  /**
   * Subscribes to changes.
   * @param listener Called with the settings after every patch
   * @returns A function that removes the listener
   */
  onChange(listener: (settings: Settings) => void): () => void;
}

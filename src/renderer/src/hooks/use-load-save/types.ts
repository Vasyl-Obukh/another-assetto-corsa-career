/**
 * Loading a save, and whether one is being loaded.
 */
export interface LoadSave {
  /**
   * Opens a career as one of its saves holds it, saying what was loaded.
   * @param career The career's id
   * @param save The save's id
   * @returns Whether it loaded
   */
  load(career: string, save: string): Promise<boolean>;
  /**
   * Whether a load is in flight, which holds the buttons.
   */
  loading: boolean;
}

import type { ParseKeys } from 'i18next';

/**
 * One step of first-run setup.
 */
export type SetupStepId = 'paths' | 'scan' | 'yours';

/**
 * A step as the rail beside the wizard lists it.
 */
export interface SetupStep {
  /**
   * Which step it is.
   */
  id: SetupStepId;
  /**
   * The catalogue key for its name.
   */
  title: ParseKeys;
  /**
   * The catalogue key for the line under its name, saying what it covers.
   */
  sub: ParseKeys;
  /**
   * The catalogue key for the line under the step's heading, saying what it
   * asks for.
   */
  hint: ParseKeys;
}

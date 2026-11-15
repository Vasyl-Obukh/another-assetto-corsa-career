import type { SetupStepId } from './types.ts';
import type { Settings } from '../../../../shared/types';

/**
 * The steps that only offer something, which the player may skip.
 */
export type OptionalStep = Extract<SetupStepId, 'sources' | 'tracks'>;

/**
 * Whether a step only offers something.
 * @param step The step
 * @returns True for the steps the player may skip
 */
export const isOptional = (step: SetupStepId): step is OptionalStep => step === 'sources' || step === 'tracks';

/**
 * What one of setup's optional steps changes, written out so two moments can
 * be compared.
 * @param settings The settings
 * @param step The step
 * @returns What it changes, as text
 */
export const optionalState = (settings: Settings, step: OptionalStep): string => JSON.stringify(
  step === 'sources' ? settings.offeredContentSources : settings.trackChoices,
);

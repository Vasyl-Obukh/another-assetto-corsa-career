import { AI_RANGE, MAX_GRID_OFFSET } from '../../constants/index.ts';
import { AppError } from '../../errors/index.ts';

/**
 * Turns a base figure and the offsets on it into what Assetto Corsa is sent.
 * @param base The absolute figure, from settings
 * @param offsets Every offset laid over it
 * @returns The sum, rounded and clamped to the range AC accepts
 */
export const aiFigure = (base: number, ...offsets: number[]): number => Math.min(
  AI_RANGE.max,
  Math.max(AI_RANGE.min, Math.round(offsets.reduce((sum, offset) => sum + offset, base))),
);

/**
 * A step the player takes on the AI's strength, checked before it is kept.
 * @param step The step asked for
 * @returns The step, or undefined for none - which is how none is kept
 * @throws When it is not a whole number, or moves the AI further than
 * MAX_GRID_OFFSET either way, as any offset is held to
 */
export const keptStep = (step: number): number | undefined => {
  if (!Number.isInteger(step) || Math.abs(step) > MAX_GRID_OFFSET) {
    throw new AppError('strength.outOfRange', { value: step, max: MAX_GRID_OFFSET });
  }

  return step === 0 ? undefined : step;
};

/**
 * Anything carrying a strength step - a career's edition or round, or a race's
 * AI field - with that step replaced.
 * @param value What carries the step
 * @param step The step, or undefined for none - which drops the key
 * @returns The same value with its step replaced
 */
export const withStrength = <T extends { strength?: number }>(value: T, step: number | undefined): T => {
  const { strength: unused, ...rest } = value;

  return (step === undefined ? rest : { ...rest, strength: step }) as T;
};

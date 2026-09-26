import { AI_RANGE } from '../../constants/index.ts';

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

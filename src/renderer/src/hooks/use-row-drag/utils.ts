import type { RowEdge } from './types.ts';

/**
 * Which edge of a row the drop bar is drawn on, if any.
 *
 * The edge moveTo actually lands the dragged row on: taking it out first shifts
 * everything after it down one, so a row moved later lands after its target and
 * one moved earlier lands before.
 * @param dragging The index being dragged, or null when nothing is
 * @param over The index the pointer is over, or null
 * @param index The row asking
 * @returns The edge to mark, or null when this row is not a drop target
 */
export const dropEdge = (
  dragging: number | null,
  over: number | null,
  index: number,
): RowEdge | null => {
  if (dragging === null || over !== index || dragging === over) return null;

  return dragging < over ? 'after' : 'before';
};

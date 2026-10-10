import type { SeasonEntry } from '../../../../shared/types';

/**
 * The car and livery a seat raced the edition in: the player's own for theirs,
 * and the one the field drew for every other.
 * @param entry The edition
 * @param seat The seat, by its id
 * @param player Whether it is the player's row rather than a stand-in's
 * @returns The car, or null for a seat the field drew none for
 */
export const seatCar = (
  entry: SeasonEntry,
  seat: string,
  player: boolean,
): { model: string; skin?: string } | null => {
  if (player) return entry.car;
  const drawn = entry.field.find((one) => one.seat === seat);

  return drawn?.model ? { model: drawn.model, skin: drawn.skin } : null;
};

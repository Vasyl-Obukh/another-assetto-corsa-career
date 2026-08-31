// Distance units. Shared because the track scan reads lengths in whichever unit
// a mod author wrote, and the renderer shows them back in whichever unit reads
// best - the same conversion from two layers.

/**
 * Metres per kilometre.
 */
export const M_PER_KM = 1000;

/**
 * Metres per mile, for the handful of mod authors who write in them.
 */
export const M_PER_MILE = 1609.344;

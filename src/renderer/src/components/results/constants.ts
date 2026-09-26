/**
 * How many of the top of the table a compact one always shows, before the
 * player and whoever is either side of them.
 */
export const COMPACT_TOP = 5;

/**
 * How many rows a loading compact table holds below its gap: the player and
 * whoever is either side of them, which is where a career usually stands.
 */
export const COMPACT_AROUND = 3;

/**
 * The podium's places, which a loading podium shows for real.
 */
export const PODIUM_PLACES = [1, 2, 3] as const;

/**
 * How the player's own row of any results table is picked out: a primary tint,
 * and a bar down its left edge. On the first cell, since a row draws no shadow.
 */
export const PLAYER_ROW = 'font-semibold [&>td]:bg-player-row [&>td:first-child]:shadow-[inset_3px_0_0_var(--color-primary)]';

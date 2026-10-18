/**
 * The two steps of New championship, in order.
 */
export const STEPS = ['pick', 'seat'] as const;

/**
 * The browser memory id the championship picker keeps its filters under, apart
 * from the Championships page's own.
 */
export const PICK_MEMORY = 'new-championship';

/**
 * The track the championship's hero is pictured by when its first round names
 * none the install has. A base game circuit, so every install has it.
 */
export const HERO_TRACK = { id: 'ks_barcelona', layout: 'layout_gp' };


// The start screen's fixed pictures. Base game circuits, so every install has
// them; a career with an event of its own is pictured by that event's track.

/**
 * The track the Career tile shows before any career has an event to picture.
 */
export const CAREER_TILE_TRACK = { id: 'ks_brands_hatch', layout: 'gp' };

/**
 * The track the Quick race tile shows before any race has a track.
 */
export const QUICK_TILE_TRACK = { id: 'ks_silverstone', layout: 'gp' };

/**
 * How wide the start screen runs: two tiles of about 420px each, so a card
 * keeps the proportions of its photograph band whatever the window.
 */
export const START_WIDTH = 'max-w-[54rem]';

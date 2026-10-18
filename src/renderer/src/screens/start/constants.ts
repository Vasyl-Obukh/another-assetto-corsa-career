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
 * The track the Championship tile shows before any standalone championship
 * has an event to picture.
 */
export const CHAMPIONSHIP_TILE_TRACK = { id: 'ks_barcelona', layout: 'layout_gp' };

/**
 * The window's shorter side the start screen is designed at - a maximised
 * 1080p window less its title bar - and how far it may scale either way, so
 * 4K reads like 1080p and a laptop like a slightly smaller one.
 */
export const START_SCALE = { design: 1050, min: 0.75, max: 2.2 } as const;

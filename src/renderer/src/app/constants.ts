/**
 * Every destination in the app, so no route string is ever spelled out twice.
 *
 * Hash routes, because production loads the renderer off file:// - a path-based
 * router has nothing to resolve against there.
 */
export const ROUTES = {
  cars: '/cars',
  tracks: '/tracks',
  diagnostics: '/diagnostics',
} as const;

import type { SeriesKind } from './types.ts';

/**
 * The IPC channels each library is read and written through. The same
 * commands over two stores, so a hook or a screen handed a kind needs nothing
 * else to work on either.
 */
export const SERIES_CHANNELS = {
  series: {
    list: 'series:list',
    get: 'series:get',
    validate: 'series:validate',
    save: 'series:save',
    create: 'series:create',
    customise: 'series:customise',
    duplicate: 'series:duplicate',
    revert: 'series:revert',
    remove: 'series:delete',
    importFile: 'series:import',
    exportFile: 'series:export',
    changed: 'series:changed',
  },
  historic: {
    list: 'historic:list',
    get: 'historic:get',
    validate: 'historic:validate',
    save: 'historic:save',
    create: 'historic:create',
    customise: 'historic:customise',
    duplicate: 'historic:duplicate',
    revert: 'historic:revert',
    remove: 'historic:delete',
    importFile: 'historic:import',
    exportFile: 'historic:export',
    changed: 'historic:changed',
  },
} as const satisfies Record<SeriesKind, Record<string, string>>;

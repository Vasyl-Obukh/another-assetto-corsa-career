import type { TrackCriteria } from './types.ts';

/**
 * No filters, default sort - what the browser opens on and what Clear restores.
 */
export const EMPTY_CRITERIA: TrackCriteria = {};

/**
 * How long the search box has to stay still before it costs an IPC call.
 */
export const SEARCH_DEBOUNCE_MS = 250;

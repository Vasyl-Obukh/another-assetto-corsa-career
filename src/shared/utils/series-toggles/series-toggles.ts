// Whether a championship is switched on: the user's own switch where they
// flipped one, and how the library says it starts out everywhere else.
//
// Shared because the championships list filters on it and the settings tab
// that holds the switches shows the same answer. Only deviations are stored,
// so switching one back to how it starts out forgets it rather than pinning it.

import type { SeriesListing, Settings } from '../../types/index.ts';

/**
 * Whether a championship is switched on.
 * @param listing The championship, with how it starts out
 * @param settings The user's switches
 * @returns True when it is on
 */
export const isSeriesActive = (
  listing: Pick<SeriesListing, 'series' | 'activeByDefault'>,
  settings: Pick<Settings, 'seriesActive'>,
): boolean => settings.seriesActive[listing.series.id] ?? listing.activeByDefault;

/**
 * The switches after flipping one championship.
 *
 * Switching it to how it starts out drops its key rather than recording the
 * default, so the settings file only ever holds what the user changed.
 * @param listing The championship, with how it starts out
 * @param seriesActive The user's switches as they stand
 * @param active Whether it should now be on
 * @returns The new switches
 */
export const withSeriesActive = (
  listing: Pick<SeriesListing, 'series' | 'activeByDefault'>,
  seriesActive: Readonly<Record<string, boolean>>,
  active: boolean,
): Record<string, boolean> => {
  const { [listing.series.id]: unused, ...others } = seriesActive;

  return active === listing.activeByDefault ? others : { ...others, [listing.series.id]: active };
};

/**
 * Whether a championship is hidden because it only fills an empty rung and
 * the user asked not to be offered those.
 * @param listing The championship
 * @param settings The user's settings
 * @returns True when it is hidden
 */
export const hiddenAsFiller = (
  listing: Pick<SeriesListing, 'filler'>,
  settings: Pick<Settings, 'showFillerSeries'>,
): boolean => listing.filler && !settings.showFillerSeries;

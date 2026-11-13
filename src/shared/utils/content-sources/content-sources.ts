// Which championships the content source toggles offer. Shared because the
// championships list filters on it and the settings tab that holds the toggles
// shows the same answer, and the renderer may not import core.

import type {
  ContentProvenance, HiddenContentSources, RequirementPool, SeriesListing, SeriesRequirements,
} from '../../types/index.ts';

/**
 * Whether content is still switched on.
 *
 * Base content has no switch, and neither has a mod nobody is credited with
 * or redistributes, so both are always on.
 * @param provenance The pack, mod team and redistributor it comes from
 * @param hidden The sources the user switched off
 * @returns True unless any of the three is switched off
 */
const isOn = (
  provenance: Pick<ContentProvenance, 'pack' | 'maker' | 'distributor'>,
  hidden: HiddenContentSources,
): boolean => (
  (provenance.pack === null || !hidden.packs.includes(provenance.pack))
  && (provenance.maker === null || !hidden.makers.includes(provenance.maker))
  && (provenance.distributor === null || !hidden.distributors.includes(provenance.distributor))
);

/**
 * Whether a spec can still be raced with some sources switched off.
 * @param pool The spec's grid, by where each car comes from
 * @param hidden The sources switched off
 * @returns True while any of its cars is still switched on
 */
export const poolHolds = (pool: RequirementPool, hidden: HiddenContentSources): boolean => (
  pool.cars.some((car) => isOn(car, hidden))
);

/**
 * Works out whether a championship is offered under the user's content sources.
 *
 * Everything it needs outright has to be switched on. A spec only has to keep
 * one car of its grid, so switching a pack off hides a spec championship only
 * when nothing of it is left.
 * @param requires What the championship needs, from its availability
 * @param hidden The sources the user switched off
 * @returns True when it is offered
 */
export const isOffered = (requires: SeriesRequirements, hidden: HiddenContentSources): boolean => (
  requires.packs.every((pack) => !hidden.packs.includes(pack))
  && requires.makers.every((maker) => !hidden.makers.includes(maker))
  && requires.distributors.every((distributor) => !hidden.distributors.includes(distributor))
  && requires.pools.every((pool) => poolHolds(pool, hidden))
);

/**
 * Whether the content sources leave a championship out altogether.
 *
 * Only ever true of a championship the app ships. One the user wrote or
 * adjusted is their document, and hiding it would be the app deciding what to
 * do with a file it did not write - these switches say which of *our*
 * championships to offer.
 * @param listing The championship and what it needs
 * @param hidden The sources the user switched off
 * @returns True when it is not offered
 */
export const hiddenBySources = (
  listing: SeriesListing,
  hidden: HiddenContentSources,
): boolean => (
  listing.origin === 'shipped' && !isOffered(listing.availability.requires, hidden)
);

/**
 * Counts the championships a set of switched-off sources would hide.
 *
 * Asked of one source at a time, it is what switching that one off costs, which
 * is the hint beside its switch.
 * @param listings The championship library
 * @param hidden The sources switched off
 * @returns How many championships are not offered
 */
export const hiddenCount = (listings: readonly SeriesListing[], hidden: HiddenContentSources): number => (
  listings.filter((listing) => hiddenBySources(listing, hidden)).length
);

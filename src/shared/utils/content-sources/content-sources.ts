// Which championships the content source toggles offer. Shared because the
// championships list filters on it and the settings tab that holds the toggles
// shows the same answer, and the renderer may not import core.

import { DLCPack, ModDistributor, ModMaker } from '../../types/index.ts';
import type {
  ContentProvenance, ContentSources, RequirementPool, SeriesListing, SeriesRequirements,
} from '../../types/index.ts';
import { stringEnumValues } from '../coerce/index.ts';

/**
 * Every content source switched on, which is what each source's own count is
 * asked against.
 */
export const ALL_CONTENT_SOURCES: ContentSources = {
  packs: [...stringEnumValues(DLCPack)],
  makers: [...stringEnumValues(ModMaker)],
  distributors: [...stringEnumValues(ModDistributor)],
};

/**
 * Every source switched on but the ones given.
 * @param off The sources to leave off
 * @returns The rest of them, switched on
 */
export const allSourcesBut = (off: Partial<ContentSources>): ContentSources => ({
  packs: ALL_CONTENT_SOURCES.packs.filter((pack) => !off.packs?.includes(pack)),
  makers: ALL_CONTENT_SOURCES.makers.filter((maker) => !off.makers?.includes(maker)),
  distributors: ALL_CONTENT_SOURCES.distributors.filter((distributor) => !off.distributors?.includes(distributor)),
});

/**
 * Whether content is switched on.
 *
 * Base content has no switch, and neither has a mod nobody is credited with
 * or redistributes, so both are always on.
 * @param provenance The pack, mod team and redistributor it comes from
 * @param offered The sources switched on
 * @returns True when each of the three it has is switched on
 */
const isOn = (
  provenance: Pick<ContentProvenance, 'pack' | 'maker' | 'distributor'>,
  offered: ContentSources,
): boolean => (
  (provenance.pack === null || offered.packs.includes(provenance.pack))
  && (provenance.maker === null || offered.makers.includes(provenance.maker))
  && (provenance.distributor === null || offered.distributors.includes(provenance.distributor))
);

/**
 * Whether a spec can be raced with only some sources switched on.
 * @param pool The spec's grid, by where each car comes from
 * @param offered The sources switched on
 * @returns True while any of its cars is switched on
 */
export const poolHolds = (pool: RequirementPool, offered: ContentSources): boolean => (
  pool.cars.some((car) => isOn(car, offered))
);

/**
 * Works out whether a championship is offered under the player's content
 * sources.
 *
 * Everything it needs outright has to be switched on. A spec only has to keep
 * one car of its grid, so a spec championship is offered once any source
 * holding a car of it is switched on.
 * @param requires What the championship needs, from its availability
 * @param offered The sources the player switched on
 * @returns True when it is offered
 */
export const isOffered = (requires: SeriesRequirements, offered: ContentSources): boolean => (
  requires.packs.every((pack) => offered.packs.includes(pack))
  && requires.makers.every((maker) => offered.makers.includes(maker))
  && requires.distributors.every((distributor) => offered.distributors.includes(distributor))
  && requires.pools.every((pool) => poolHolds(pool, offered))
);

/**
 * Whether the content sources leave a championship out altogether.
 *
 * Only ever true of a championship the app ships. One the user wrote or
 * adjusted is their document, and hiding it would be the app deciding what to
 * do with a file it did not write - these switches say which of *our*
 * championships to offer.
 * @param listing The championship and what it needs
 * @param offered The sources the player switched on
 * @returns True when it is not offered
 */
export const hiddenBySources = (
  listing: SeriesListing,
  offered: ContentSources,
): boolean => (
  listing.origin === 'shipped' && !isOffered(listing.availability.requires, offered)
);

/**
 * Counts the championships a set of switched-on sources leaves out.
 *
 * Asked with every source on but one, it is how many championships need that
 * one, which is the line beside its switch.
 * @param listings The championship library
 * @param offered The sources switched on
 * @returns How many championships are not offered
 */
export const hiddenCount = (listings: readonly SeriesListing[], offered: ContentSources): number => (
  listings.filter((listing) => hiddenBySources(listing, offered)).length
);

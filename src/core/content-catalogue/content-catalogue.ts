// Resolving a folder ID to where it came from. Four lookups and no cleverness -
// nothing is guessed from the name, so anything the catalogue does not list is a
// mod we cannot attribute, which is the honest answer rather than a wrong one.

import {
  BASE_CARS,
  BASE_TRACKS,
  DISTRIBUTOR_CARS,
  DISTRIBUTOR_TRACKS,
  DLC_CARS,
  DLC_TRACKS,
  MOD_CARS,
  MOD_TRACKS,
} from './constants.ts';
import type { ContentProvenance, DLCPack, ModMaker } from '../../shared/types/index.ts';
import { ContentSource } from '../../shared/types/index.ts';

// Re-exported for callers, following the pattern in src/core/content/: the
// module file is the module's surface, and index.ts only re-exports it.
export {
  BASE_CARS,
  BASE_TRACKS,
  CONTENT_CATALOGUE_VERSION,
  DISTRIBUTOR_CARS,
  DISTRIBUTOR_TRACKS,
  DLC_CARS,
  DLC_TRACKS,
  MOD_CARS,
  MOD_TRACKS,
} from './constants.ts';

// Membership is asked once per entry on every cold scan, so the base lists are
// read as sets rather than searched as arrays.
const BASE_CAR_IDS = new Set(BASE_CARS);
const BASE_TRACK_IDS = new Set(BASE_TRACKS);

/**
 * Works out the source from what the two official records say.
 * @param isBase Whether the base list carries this ID
 * @param pack The DLC pack this ID belongs to, if any
 * @returns Base, DLC or mod
 */
const sourceOf = (isBase: boolean, pack: DLCPack | undefined): ContentSource => {
  if (isBase) return ContentSource.BASE;
  return pack === undefined ? ContentSource.MOD : ContentSource.DLC;
};

/**
 * Where a car came from.
 * @param id Folder name under content/cars
 * @returns Its source, DLC pack, mod maker and redistributor
 */
export const carProvenance = (id: string): ContentProvenance => {
  const pack = DLC_CARS[id];

  return {
    source: sourceOf(BASE_CAR_IDS.has(id), pack),
    pack: pack ?? null,
    maker: MOD_CARS[id] ?? null,
    distributor: DISTRIBUTOR_CARS[id] ?? null,
  };
};

/**
 * Whether the catalogue names this piece of content at all.
 *
 * Base and DLC pass on the source alone, a named mod on its maker, and an
 * LFM-redistributed car or layout on its distributor. Anything in none of the
 * six records is the anonymous mod the catalogue already declines to attribute,
 * and that is what the library leaves out - it carries no class, no spec and no
 * championship that can reach it, so offering it is offering a folder name.
 *
 * The single seam a user layer widens: adding your own content makes this
 * "catalogued, or one the user named", and nothing above it has to change.
 * @param provenance What carProvenance or trackProvenance resolved
 * @returns True when some record names it
 */
export const isCatalogued = (provenance: ContentProvenance): boolean => (
  provenance.source !== ContentSource.MOD
  || provenance.maker !== null
  || provenance.distributor !== null
);

/**
 * Where a track layout came from.
 *
 * Everything but the redistributor is keyed by the track, since a pack ships a
 * circuit and every layout of it comes along. The redistributor is keyed by the
 * layout, because it adds layouts to circuits it did not ship - LFM's
 * nordschleife-lfm sits inside Kunos' Dream Pack 1 Nordschleife.
 * @param id Folder name under content/tracks
 * @param layout Layout folder name, or an empty string for a single-layout track
 * @returns Its source, DLC pack, mod maker and redistributor
 */
export const trackProvenance = (id: string, layout: string): ContentProvenance => {
  const pack = DLC_TRACKS[id];
  const maker: ModMaker | undefined = MOD_TRACKS[id];

  return {
    source: sourceOf(BASE_TRACK_IDS.has(id), pack),
    pack: pack ?? null,
    maker: maker ?? null,
    distributor: DISTRIBUTOR_TRACKS[layout ? `${id}/${layout}` : id] ?? null,
  };
};

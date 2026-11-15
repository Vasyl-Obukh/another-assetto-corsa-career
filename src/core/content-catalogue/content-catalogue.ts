// Resolving a folder ID to where it came from. Four lookups and no cleverness -
// nothing is guessed from the name, so anything the catalogue does not list is a
// mod we cannot attribute, which is the honest answer rather than a wrong one.

import {
  BASE_CARS,
  BASE_TRACKS,
  DISTRIBUTOR_CARS,
  DLC_CARS,
  DLC_TRACKS,
  MOD_CARS,
} from './constants.ts';
import type { ContentProvenance, DLCPack } from '../../shared/types/index.ts';
import { ContentSource } from '../../shared/types/index.ts';

// Re-exported for callers, following the pattern in src/core/content/: the
// module file is the module's surface, and index.ts only re-exports it.
export {
  BASE_CARS,
  BASE_TRACKS,
  CONTENT_CATALOGUE_VERSION,
  DISTRIBUTOR_CARS,
  DLC_CARS,
  DLC_TRACKS,
  MOD_CARS,
} from './constants.ts';

// Lives in shared so the renderer can badge what the user added, but it is this
// catalogue's question, so it is answered from here too.
export { isCatalogued } from '../../shared/utils/library/index.ts';

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
 * Where a track came from: the base game or a DLC pack, keyed by the folder,
 * since a pack ships a circuit and every layout of it comes along. No mod team
 * or redistributor is credited with a circuit any more: the shipped
 * championships race recommended tracks, whoever made the folder that stands
 * for one - see src/shared/utils/recommended-tracks/.
 * @param id Folder name under content/tracks
 * @returns Its source and DLC pack
 */
export const trackProvenance = (id: string): ContentProvenance => {
  const pack = DLC_TRACKS[id];

  return {
    source: sourceOf(BASE_TRACK_IDS.has(id), pack),
    pack: pack ?? null,
    maker: null,
    distributor: null,
  };
};

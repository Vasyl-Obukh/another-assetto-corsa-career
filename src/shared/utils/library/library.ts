// Whether a car or a track layout belongs in the library: named by the
// provenance catalogue, or added by the user. Shared because main filters the
// browsers on it and the renderer badges what the user added.

import { ContentSource } from '../../types/index.ts';
import type { ContentProvenance } from '../../types/index.ts';

/**
 * Whether the catalogue names this piece of content at all.
 *
 * Base and DLC pass on the source alone, a named mod on its maker, and an
 * LFM-redistributed car or layout on its distributor. Anything in none of the
 * six records is the anonymous mod the catalogue already declines to attribute,
 * and that is what the library leaves out unless the user adds it - it carries no
 * class, no spec and no championship that can reach it, so offering it unasked is
 * offering a folder name.
 * @param provenance What carProvenance or trackProvenance resolved
 * @returns True when some record names it
 */
export const isCatalogued = (provenance: ContentProvenance): boolean => (
  provenance.source !== ContentSource.MOD
  || provenance.maker !== null
  || provenance.distributor !== null
);

/**
 * Whether this is an anonymous mod the user let into the library themselves.
 *
 * False for anything the catalogue names, even when the user's list carries it
 * too, so a row the catalogue gains later simply stops reading as theirs.
 * @param provenance Where the content came from
 * @param id Folder name - a car's, or the circuit's for a track layout
 * @param added The folder IDs the user added, for that kind of content
 * @returns True when only the user's list puts it in the library
 */
export const isUserAdded = (
  provenance: ContentProvenance,
  id: string,
  added: readonly string[],
): boolean => !isCatalogued(provenance) && added.includes(id);

/**
 * Whether a circuit, or a layout of one, is in the library because the user
 * added the circuit.
 *
 * The redistributor is left out of the question: it is recorded per layout, and
 * a circuit card carries whichever layout's it met, so an added circuit holding
 * one LFM layout would otherwise stop reading as the user's once it is added.
 * @param provenance Where the circuit or layout came from
 * @param id Folder name of the circuit
 * @param added The circuit folder IDs the user added
 * @returns True when only the user's list puts the circuit in the library
 */
export const isUserAddedCircuit = (
  provenance: ContentProvenance,
  id: string,
  added: readonly string[],
): boolean => isUserAdded({ ...provenance, distributor: null }, id, added);

/**
 * Whether the browsers and pickers offer this content: catalogued, or one the
 * user named.
 * @param provenance Where the content came from
 * @param id Folder name - a car's, or the circuit's for a track layout
 * @param added The folder IDs the user added, for that kind of content
 * @returns True when it belongs in the library
 */
export const isInLibrary = (
  provenance: ContentProvenance,
  id: string,
  added: readonly string[],
): boolean => isCatalogued(provenance) || added.includes(id);

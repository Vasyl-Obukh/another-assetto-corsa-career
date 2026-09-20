// The content sources the Content sources tab lists, in the order they are
// shown, and the one measurement its links card needs.

import { DLCPack, ModDistributor, ModMaker } from '../../../../shared/types';
import { stringEnumValues } from '../../../../shared/utils/coerce';

/**
 * Every DLC pack, in the catalogue's own order.
 */
export const DLC_PACKS: readonly DLCPack[] = stringEnumValues(DLCPack);

/**
 * Every mod team the catalogue names, in the catalogue's own order.
 */
export const MOD_MAKERS: readonly ModMaker[] = stringEnumValues(ModMaker);

/**
 * Every redistributor the catalogue names, in the catalogue's own order.
 *
 * No switch of its own - a redistributor ships other teams' work, so hiding it
 * would hide content those teams' switches already answer for. It is listed
 * here only so the links card can say where LFM's pack comes from.
 */
export const DISTRIBUTORS: readonly ModDistributor[] = stringEnumValues(ModDistributor);

/**
 * How wide the Where to get it list runs.
 *
 * Not `CONTROL_WIDTH`: that sizes a settings control, and 144px truncates every
 * host to "store.steampo...", which is the one thing the link had to say. Still
 * capped well short of the card, for `FIELD_GRID`'s own reason - a chip at one
 * end and a host at the other stop reading as one row once they drift apart.
 */
export const SOURCE_LINK_WIDTH = 'max-w-2xl';

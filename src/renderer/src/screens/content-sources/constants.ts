// The content sources the Content sources tab offers a switch for, in the
// order they are shown.

import { DLCPack, ModMaker } from '../../../../shared/types';
import { stringEnumValues } from '../../../../shared/utils/coerce';

/**
 * Every DLC pack, in the catalogue's own order.
 */
export const DLC_PACKS: readonly DLCPack[] = stringEnumValues(DLCPack);

/**
 * Every mod team the catalogue names, in the catalogue's own order.
 */
export const MOD_MAKERS: readonly ModMaker[] = stringEnumValues(ModMaker);

import { RECENT_LIMIT } from './constants.ts';
import type { SpecId } from '../../../../shared/types';

// The specs picked lately, newest first, for as long as the window lives -
// module state like browser memory, since nothing renders from it until the
// picker opens again.
let recent: SpecId[] = [];

/**
 * Remembers a spec as picked.
 * @param spec The spec
 */
export const rememberSpec = (spec: SpecId): void => {
  recent = [spec, ...recent.filter((one) => one !== spec)].slice(0, RECENT_LIMIT);
};

/**
 * The specs picked lately, newest first.
 * @returns Their ids
 */
export const recentSpecs = (): readonly SpecId[] => recent;

import type { SaveKind } from '../../../../shared/types';

/**
 * Which saves a list shows: every one, or one kind.
 */
export type SaveFilter = 'all' | SaveKind;

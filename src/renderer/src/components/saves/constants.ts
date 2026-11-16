import { ClockIcon, SaveIcon, ZapIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { SaveFilter } from './types.ts';
import type { SaveKind } from '../../../../shared/types';

/**
 * The filters a list of saves offers, in order.
 */
export const SAVE_FILTERS: readonly SaveFilter[] = ['all', 'named', 'quick', 'auto'];

/**
 * The icon each kind of save wears in its well: a disk for one saved by hand,
 * a bolt for the quick save, a clock for an autosave.
 */
export const SAVE_ICON: Readonly<Record<SaveKind, LucideIcon>> = {
  named: SaveIcon,
  quick: ZapIcon,
  auto: ClockIcon,
};

/**
 * How many rows a list of saves holds while they are read.
 */
export const SAVE_ROWS = 4;

/**
 * How often the header's "saved a few minutes ago" is worked out again, in
 * milliseconds.
 */
export const STATUS_TICK_MS = 30_000;

/**
 * Where the saves lists keep their filter - the Careers page's and the Load
 * dialog's alike, since both list the same saves.
 */
export const SAVE_FILTER_MEMORY = 'saves.filter';

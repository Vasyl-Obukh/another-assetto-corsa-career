import type { SponsorSlot } from '../../../../shared/types';

/**
 * The head band of a sponsor's card, in its slot's pale tone.
 */
export const SPONSOR_HEAD = {
  main: 'bg-sponsor/70',
  partner: 'bg-partner/70',
} as const satisfies Record<SponsorSlot, string>;

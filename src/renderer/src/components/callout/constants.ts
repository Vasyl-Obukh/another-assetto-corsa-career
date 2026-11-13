import type { CalloutTone } from './types.ts';

/**
 * Each tone's fill, and the colour its icon is drawn in.
 */
export const CALLOUT_TONE = {
  primary: 'bg-primary/8 [&>svg]:text-primary',
  contract: 'bg-contract/60 [&>svg]:text-contract-foreground',
} as const satisfies Record<CalloutTone, string>;

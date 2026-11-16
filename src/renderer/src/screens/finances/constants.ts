import {
  BriefcaseIcon, MedalIcon, SparklesIcon, WalletIcon,
} from 'lucide-react';

import type { TileAccent, TileLead } from './types.ts';

/**
 * Each lead tile's icon, in a well of its page's colour, over a wash of the
 * same. The wash is mixed into the card rather than laid over the page, so the
 * tile stays a card.
 */
export const TILE_LEAD = {
  balance: {
    icon: WalletIcon,
    tile: 'border-success/25 bg-[color-mix(in_oklab,var(--color-success)_8%,var(--color-card))]',
    well: 'bg-success/15 text-success',
  },
  contracts: {
    icon: BriefcaseIcon,
    tile: 'border-contract-foreground/20 bg-[color-mix(in_oklab,var(--color-contract)_45%,var(--color-card))]',
    well: 'bg-contract text-contract-foreground',
  },
  sponsors: {
    icon: SparklesIcon,
    tile: 'border-sponsor-foreground/20 bg-[color-mix(in_oklab,var(--color-sponsor)_45%,var(--color-card))]',
    well: 'bg-sponsor text-sponsor-foreground',
  },
  rating: {
    icon: MedalIcon,
    tile: 'border-primary/25 bg-[color-mix(in_oklab,var(--color-primary)_7%,var(--color-card))]',
    well: 'bg-primary/15 text-primary',
  },
} as const satisfies Record<TileLead, TileAccent>;

/**
 * Where the ledger keeps its filter. The season is not kept: it opens on the
 * one under way, which moves on.
 */
export const LEDGER_FILTER_MEMORY = 'finances.filter';

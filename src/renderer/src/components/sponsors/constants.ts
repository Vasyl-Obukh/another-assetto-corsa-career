import {
  CarIcon, CogIcon, CupSodaIcon, DiscIcon, DropletIcon, LandmarkIcon, PlaneIcon, ShirtIcon, SmartphoneIcon, WatchIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { SponsorPerkKind, SponsorTrade } from '../../../../shared/types';

/**
 * A main sponsor's signature perks, which get a row of their own on an offer.
 */
export const SIGNATURES: readonly SponsorPerkKind[] = ['championship', 'climbs', 'carBacking', 'seatBacking', 'carReward'];

/**
 * The perks that help rather than pay, which have no price to show.
 */
export const HELPS: readonly SponsorPerkKind[] = ['repaints', 'teamInterest', 'worksInterest', 'betterTerms', 'invitations'];

/**
 * The icon each trade wears on a sponsor's initials - an icon rather than a
 * chip, so the ten trades spend no hue of the palette. A logo wears none, since
 * in the corner it would cover the end of a wordmark.
 */
export const TRADE_ICON = {
  oil: DropletIcon,
  tyres: DiscIcon,
  tech: SmartphoneIcon,
  drinks: CupSodaIcon,
  watch: WatchIcon,
  finance: LandmarkIcon,
  parts: CogIcon,
  dealer: CarIcon,
  apparel: ShirtIcon,
  travel: PlaneIcon,
} as const satisfies Record<SponsorTrade, LucideIcon>;

/**
 * How many letters of a sponsor's name its mark shows.
 */
export const MARK_LETTERS = 2;

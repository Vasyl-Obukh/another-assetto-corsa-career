// Sponsors' offers for a career, pure and seeded: whether a round raced brings
// one and which slot it is for, and what an offer is - its trade and name, what
// it covers, its target and goal, and its perks and figures. Each figure is
// drawn inside its perk's range for the slot, nearer the top the better the
// rating it is drawn on and the harder its target and goal.

import {
  BASIC_PERKS,
  CAR_BACKING_SHARE,
  CHAMPIONSHIP_PLACE,
  CLEAN_CUTS,
  FORM_CHANCE,
  GOAL_HARDNESS,
  JITTER,
  MAIN_FORMS,
  MAIN_ONLY,
  MATCH_RANGE,
  ON_TARGET_SHARES,
  PERK_COUNT,
  PERK_RANGE,
  PLACE_SHARES,
  QUALIFYING_SHARES,
  QUALITY,
  QUALITY_BASE,
  RACES_STARTED,
  REPLACE_FACTOR,
  RESULT_COUNTS,
  ROUND_TO,
  SPONSOR_BOOK,
  STANDOUT_CHANCE,
  TARGET_HARDNESS,
  TRADE_LEAN,
  TRADES,
} from './constants.ts';
import type { SponsorDrawRequest } from './types.ts';
import type {
  Discipline,
  SponsorGoal,
  SponsorGoalKind,
  SponsorOffer,
  SponsorPerk,
  SponsorPerkKind,
  SponsorSlot,
  SponsorTarget,
  SponsorTargetKind,
} from '../../shared/types/index.ts';
import { bestRung, rungFee } from '../../shared/utils/sponsors/index.ts';
import type { FormBand } from '../../shared/utils/sponsors/index.ts';
import { rungPosition } from '../seat-offers/index.ts';
import { randomFrom, seedFrom, shuffle } from '../seeded-random/index.ts';

export type { SponsorDrawRequest } from './types.ts';
export { OFFER_DAYS } from './constants.ts';

/**
 * How good an offer is, off where its rating stands on its rung.
 */
type Quality = keyof typeof QUALITY_BASE;

/**
 * Picks one item off a seeded generator.
 * @param items What to pick from, which must not be empty
 * @param random The generator
 * @returns The item
 */
const pickOne = <T>(items: readonly T[], random: () => number): T => items[Math.floor(random() * items.length)];

/**
 * A whole number drawn inside a range, both ends included.
 * @param range The fewest and the most
 * @param random The generator
 * @returns The number
 */
const countIn = (range: readonly [number, number], random: () => number): number => (
  range[0] + Math.floor(random() * (range[1] - range[0] + 1))
);

/**
 * Rounds an amount to a figure a sponsor would write.
 * @param amount The amount
 * @returns It, to the nearest hundred under ten thousand and the nearest five
 * hundred above - never less than one step
 */
const roundMoney = (amount: number): number => {
  const step = amount < ROUND_TO.below ? ROUND_TO.small : ROUND_TO.large;

  return Math.max(step, Math.round(amount / step) * step);
};

/**
 * How likely a round raced is to bring an offer, as a percentage: the
 * career's form, and more for a standout result.
 * @param form The career's form after the round
 * @param standout What the round brought
 * @param standout.win Whether it held a class win
 * @param standout.title Whether it settled a class title
 * @param standout.rung Whether it opened a new rung
 * @returns The chance
 */
export const sponsorChance = (
  form: FormBand,
  standout: { win: boolean; title: boolean; rung: boolean },
): number => (
  FORM_CHANCE[form]
  + (standout.win ? STANDOUT_CHANCE.win : 0)
  + (standout.title ? STANDOUT_CHANCE.title : 0)
  + (standout.rung ? STANDOUT_CHANCE.rung : 0)
);

/**
 * Whether a round brings an offer, and for which slot: a free one where there
 * is one - the main sponsor's only to a career in form - else, at half the
 * chance, one to replace a deal.
 * @param salt What the draw is seeded with
 * @param chance The round's chance, as a percentage
 * @param form The career's form after the round
 * @param free Which slots are free
 * @param free.main Whether the main sponsor's is
 * @param free.partner Whether a partner's is
 * @returns The slot, and whether the offer replaces a deal - or null for none
 */
export const sponsorDrawn = (
  salt: string,
  chance: number,
  form: FormBand,
  free: { main: boolean; partner: boolean },
): { slot: SponsorSlot; replace: boolean } | null => {
  const random = randomFrom(seedFrom(`${salt}\u0000sponsor`));
  const roll = random() * 100;
  const main = MAIN_FORMS.includes(form);

  if (free.main && main) return roll < chance ? { slot: 'main', replace: false } : null;
  if (free.partner) return roll < chance ? { slot: 'partner', replace: false } : null;
  if (roll >= chance * REPLACE_FACTOR) return null;

  return { slot: main && random() < 0.5 ? 'main' : 'partner', replace: true };
};

/**
 * A figure inside a perk's range, at the rung's fee and the career's speed.
 * @param kind The perk
 * @param slot The slot it is for
 * @param fee The rung's typical entry fee
 * @param at Where inside the range, 0 to 1
 * @param speed The career's prize speed
 * @returns The amount
 */
const figure = (kind: SponsorPerkKind, slot: SponsorSlot, fee: number, at: number, speed: number): number => {
  const range = PERK_RANGE[kind]?.[slot] ?? [0, 0];

  return roundMoney((range[0] + (range[1] - range[0]) * at) * fee * speed);
};

/**
 * Draws a deal's target.
 * @param kind What it asks
 * @param quality How good the offer is
 * @param random The generator
 * @returns The target
 */
const drawTarget = (kind: SponsorTargetKind, quality: Quality, random: () => number): SponsorTarget => {
  if (kind === 'classPlace') return { kind, share: pickOne(PLACE_SHARES[quality], random) };
  if (kind === 'qualifying') return { kind, share: pickOne(QUALIFYING_SHARES, random) };
  if (kind === 'clean') return { kind, cuts: countIn(CLEAN_CUTS, random) };

  return { kind };
};

/**
 * Draws a deal's goal - an easier one on a basic offer.
 * @param kind What it counts
 * @param quality How good the offer is
 * @param random The generator
 * @returns The goal
 */
const drawGoal = (kind: SponsorGoalKind, quality: Quality, random: () => number): SponsorGoal => {
  if (kind === 'championshipPlace') {
    return quality === 'low' || random() < 0.5
      ? { kind, share: CHAMPIONSHIP_PLACE.share }
      : { kind, count: CHAMPIONSHIP_PLACE.top };
  }
  if (kind === 'onTarget') return { kind, share: quality === 'low' ? ON_TARGET_SHARES[0] : pickOne(ON_TARGET_SHARES, random) };
  if (kind === 'racesStarted') return { kind, count: countIn(RACES_STARTED, random) };
  const result = pickOne(['podium', 'win', 'pole'] as const, random);
  const counts = RESULT_COUNTS[result];

  return { kind, result, count: quality === 'low' ? counts[0] : countIn(counts, random) };
};

/**
 * Draws one sponsor's offer.
 * @param request What it is drawn from
 * @returns The offer, or null when no trade is left to draw
 */
export const drawSponsorOffer = (request: SponsorDrawRequest): SponsorOffer | null => {
  const random = randomFrom(seedFrom(`${request.salt}\u0000offer`));
  const trades = TRADES.filter((trade) => !request.held.includes(trade));
  if (trades.length === 0) return null;
  const trade = pickOne(trades, random);
  const lean = TRADE_LEAN[trade];

  // A discipline trade covers the discipline raced most, now and then another.
  const best = bestRung(request.level);
  const raced: readonly Discipline[] = request.raced.length > 0
    ? request.raced
    : (Object.keys(request.level) as Discipline[]).filter((one) => request.level[one] === best);
  const covers = lean.discipline ? (random() < 0.7 ? raced[0] : pickOne(raced, random)) : null;
  const rung = covers ? request.level[covers] : best;
  const rating = covers ? request.rating[covers] : request.globalRating;
  const position = rungPosition(rating, rung);
  const quality: Quality = position < QUALITY.low ? 'low' : position >= QUALITY.high ? 'high' : 'mid';

  const target = drawTarget(pickOne(lean.targets, random), quality, random);
  const goal = drawGoal(pickOne(lean.goals, random), quality, random);
  const at = Math.min(1, Math.max(0, QUALITY_BASE[quality]
    + TARGET_HARDNESS[target.kind] + GOAL_HARDNESS[goal.kind]
    + (random() * 2 - 1) * JITTER));
  const fee = rungFee(rung);
  const speed = request.prizeSpeed;
  const { slot } = request;

  const perks: SponsorPerk[] = [];
  if (slot === 'main') {
    // Climbing has nowhere to go from the top rung, and covering a
    // championship needs one the career has raced in that discipline.
    const series = request.championships.filter((one) => covers === null || one.discipline === covers);
    const signatures = lean.signatures.filter((kind) => (
      (kind !== 'climbs' || rung > 1) && (kind !== 'championship' || series.length > 0)
    ));
    const signature = signatures[0] ?? 'carBacking';
    if (signature === 'championship') {
      const named = pickOne(series, random);
      perks.push({ kind: 'championship', series: named.series, seriesName: named.name });
    } else if (signature === 'carBacking') {
      perks.push({ kind: 'carBacking', share: CAR_BACKING_SHARE });
    } else {
      perks.push({ kind: signature });
    }
  }
  perks.push({ kind: 'racePay', amount: figure('racePay', slot, fee, at, speed) });

  const pool = (quality === 'low' ? BASIC_PERKS : lean.perks)
    .filter((kind) => slot === 'main' || !MAIN_ONLY.includes(kind));
  const count = Math.min(pool.length, countIn(PERK_COUNT[slot], random) + (quality === 'high' ? 1 : 0));
  for (const kind of shuffle(pool, random).slice(0, count)) {
    if (kind === 'prizeMatch') {
      const range = MATCH_RANGE[slot];
      perks.push({ kind, share: Math.round(range[0] + (range[1] - range[0]) * at) });
    } else {
      perks.push({ kind, amount: figure(kind, slot, fee, at, speed) });
    }
  }
  if (slot === 'main') perks.push({ kind: 'goalBonus', amount: figure('goalBonus', slot, fee, at, speed) });

  const book = SPONSOR_BOOK[trade].filter((one) => !request.names.includes(one.name));
  const who = pickOne(book.length > 0 ? book : SPONSOR_BOOK[trade], random);

  return {
    sponsor: { ...who, trade },
    slot,
    covers,
    perks,
    target,
    goal,
    rung,
  };
};

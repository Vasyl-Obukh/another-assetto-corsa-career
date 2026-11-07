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
  COST_SHARE_RANGE,
  FORM_CHANCE,
  GOAL_HARDNESS,
  JITTER,
  MAIN_FORMS,
  MAIN_ONLY,
  MATCH_RANGE,
  ON_TARGET_SHARES,
  PARTNER_ONLY,
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
  SEAT_BACKING_SHARE,
  SPONSOR_BOOK,
  STANDOUT_CHANCE,
  TARGET_HARDNESS,
  TRADE_LEAN,
  TRADES,
} from './constants.ts';
import type { RewardCar, SponsorDrawRequest, SponsorRenewalRequest } from './types.ts';
import type {
  Discipline,
  SponsorCar,
  SponsorGoal,
  SponsorGoalKind,
  SponsorOffer,
  SponsorPerk,
  SponsorPerkKind,
  SponsorSlot,
  SponsorTarget,
  SponsorTargetKind,
} from '../../shared/types/index.ts';
import {
  bestRung, dealRung, dealScale, rungFee, sponsorFigure,
} from '../../shared/utils/sponsors/index.ts';
import type { FormBand } from '../../shared/utils/sponsors/index.ts';
import { rungPosition } from '../seat-offers/index.ts';
import { randomFrom, seedFrom, shuffle } from '../seeded-random/index.ts';

export type { RewardCar, SponsorDrawRequest, SponsorRenewalRequest } from './types.ts';
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
 * Where an offer's figures fall in their ranges, off how good it is, how hard
 * its target and goal are, and a seeded nudge.
 * @param quality How good the offer is
 * @param target What it asks of every race
 * @param goal What it asks of its year
 * @param random The generator
 * @returns Where, 0 to 1
 */
const figureAt = (
  quality: Quality,
  target: SponsorTargetKind,
  goal: SponsorGoalKind,
  random: () => number,
): number => Math.min(1, Math.max(0, QUALITY_BASE[quality]
  + TARGET_HARDNESS[target] + GOAL_HARDNESS[goal]
  + (random() * 2 - 1) * JITTER));

/**
 * How good an offer is, off where its rating stands on its rung.
 * @param rating The rating it is read on
 * @param rung The rung, 1 being the top
 * @returns The quality
 */
const qualityAt = (rating: number, rung: number): Quality => {
  const position = rungPosition(rating, rung);

  return position < QUALITY.low ? 'low' : position >= QUALITY.high ? 'high' : 'mid';
};

/**
 * One share drawn inside its range.
 * @param range The lowest and the highest
 * @param at Where inside the range, 0 to 1
 * @returns The share, as a whole percentage
 */
const shareIn = (range: readonly [number, number], at: number): number => (
  Math.round(range[0] + (range[1] - range[0]) * at)
);

/**
 * One money or share perk's figures.
 * @param kind The perk
 * @param slot The slot it is for
 * @param fee The rung's typical entry fee
 * @param at Where inside its range, 0 to 1
 * @param speed The career's prize speed
 * @returns The perk, with whichever figure it carries
 */
const drawnPerk = (kind: SponsorPerkKind, slot: SponsorSlot, fee: number, at: number, speed: number): SponsorPerk => {
  if (kind === 'prizeMatch') return { kind, share: shareIn(MATCH_RANGE[slot], at) };
  if (kind === 'feeShare' || kind === 'rentShare') return { kind, share: shareIn(COST_SHARE_RANGE[kind], at) };
  if (PERK_RANGE[kind]) return { kind, amount: figure(kind, slot, fee, at, speed) };

  return { kind };
};

/**
 * The cars a deal's reward may name: those of the discipline it covers, or of
 * the highest rung open for one covering any racing.
 * @param rewards The cars on offer
 * @param covers The discipline it covers, or null for any racing
 * @returns The cars
 */
const rewardPool = (rewards: readonly RewardCar[], covers: Discipline | null): readonly RewardCar[] => {
  if (covers) return rewards.filter((car) => car.discipline === covers);
  const top = Math.min(...rewards.map((car) => car.tier));

  return rewards.filter((car) => car.tier === top);
};

/**
 * Draws the car a reward names, without what it needs to find it again.
 * @param pool The cars it may name, which must not be empty
 * @param random The generator
 * @returns The car
 */
const rewardCar = (pool: readonly RewardCar[], random: () => number): SponsorCar => {
  const {
    model, name, price, skin,
  } = pickOne(pool, random);

  return {
    model, name, price, ...(skin === undefined ? {} : { skin }),
  };
};

/**
 * Draws a main sponsor's signature: one its trade leans to and the career can
 * use. Climbing has nowhere to go from the top rung, covering a championship
 * needs one the career has raced in that discipline, and a reward a car.
 * @param request What the offer is drawn from
 * @param lean The signatures its trade leans to
 * @param covers The discipline it covers, or null for any racing
 * @param rung The rung it reads on
 * @param random The generator
 * @returns The perk
 */
const drawSignature = (
  request: SponsorDrawRequest,
  lean: readonly SponsorPerkKind[],
  covers: Discipline | null,
  rung: number,
  random: () => number,
): SponsorPerk => {
  const series = request.championships.filter((one) => covers === null || one.discipline === covers);
  const cars = request.rewards?.length ? rewardPool(request.rewards, covers) : [];
  const usable = lean.filter((kind) => (
    (kind !== 'climbs' || rung > 1)
    && (kind !== 'championship' || series.length > 0)
    && (kind !== 'carReward' || cars.length > 0)
  ));
  const kind = usable.length > 0 ? pickOne(usable, random) : 'carBacking';

  if (kind === 'championship') {
    const named = pickOne(series, random);

    return { kind, series: named.series, seriesName: named.name };
  }
  if (kind === 'carBacking') return { kind, share: CAR_BACKING_SHARE };
  if (kind === 'seatBacking') return { kind, share: SEAT_BACKING_SHARE };
  if (kind === 'carReward') return { kind, car: rewardCar(cars, random) };

  return { kind };
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
  const rung = dealRung({ covers }, request.level);
  const rating = covers ? request.rating[covers] : request.globalRating;
  const quality = qualityAt(rating, rung);

  const target = drawTarget(pickOne(lean.targets, random), quality, random);
  const goal = drawGoal(pickOne(lean.goals, random), quality, random);
  const at = figureAt(quality, target.kind, goal.kind, random);
  const fee = rungFee(rung);
  const speed = request.prizeSpeed;
  const { slot } = request;

  const perks: SponsorPerk[] = [];
  if (slot === 'main') perks.push(drawSignature(request, lean.signatures, covers, rung, random));
  perks.push({ kind: 'racePay', amount: figure('racePay', slot, fee, at, speed) });

  const pool = (quality === 'low' ? BASIC_PERKS : lean.perks)
    .filter((kind) => !(slot === 'main' ? PARTNER_ONLY : MAIN_ONLY).includes(kind));
  const count = Math.min(pool.length, countIn(PERK_COUNT[slot], random) + (quality === 'high' ? 1 : 0));
  for (const kind of shuffle(pool, random).slice(0, count)) perks.push(drawnPerk(kind, slot, fee, at, speed));
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

/**
 * Draws a sponsor's offer of another year: the deal's perks, target and goal,
 * each figure drawn again at the rating and rung the career holds now and never
 * below what it pays. A changed figure says what it was, and a car reward names
 * a new car where one is left to name.
 * @param request What it is drawn from
 * @returns The offer
 */
export const drawRenewal = (request: SponsorRenewalRequest): SponsorOffer => {
  const { deal } = request;
  const random = randomFrom(seedFrom(`${request.salt}\u0000renewal`));
  const rung = dealRung(deal, request.level);
  const rating = deal.covers ? request.rating[deal.covers] : request.globalRating;
  const at = figureAt(qualityAt(rating, rung), deal.target.kind, deal.goal.kind, random);
  const fee = rungFee(rung);
  const scale = dealScale(deal, request.level);

  const perks = deal.perks.map((perk): SponsorPerk => {
    // What the renewal before this one changed says nothing of this one.
    const { was, wasCar, ...kept } = perk;
    if (perk.kind === 'carReward') {
      const pool = rewardPool(request.rewards ?? [], deal.covers).filter((car) => car.model !== perk.car?.model);
      if (pool.length === 0) return kept;

      return { ...kept, car: rewardCar(pool, random), ...(perk.car ? { wasCar: perk.car.name } : {}) };
    }
    const drawn = drawnPerk(perk.kind, deal.slot, fee, at, request.prizeSpeed);
    if (drawn.amount !== undefined && perk.amount !== undefined) {
      const now = sponsorFigure(perk.amount, scale);

      return drawn.amount > now ? { ...kept, amount: drawn.amount, was: now } : { ...kept, amount: now };
    }
    if (drawn.share !== undefined && perk.share !== undefined && drawn.share > perk.share) {
      return { ...kept, share: drawn.share, was: perk.share };
    }

    return kept;
  });

  return {
    sponsor: deal.sponsor,
    slot: deal.slot,
    covers: deal.covers,
    perks,
    target: deal.target,
    goal: deal.goal,
    rung,
    renews: deal.id,
  };
};

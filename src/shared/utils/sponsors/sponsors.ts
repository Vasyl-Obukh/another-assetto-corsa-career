// A career's sponsors read the way both processes need them: how many slots a
// rung holds, a deal's year, which races a deal covers and whether each met its
// target, how far its goal has got, and the career's form. Shared because main
// pays and ends deals on these answers and the renderer shows the same.

import {
  DEAL_DAYS, FORM_BANDS, FORM_ROUNDS, NO_SEAT_LIFT, PARTNER_SLOTS, PODIUM_PLACES, REPAY_ROUND, REWARD_BONUSES,
  SPONSOR_LIFT, SPONSOR_MAIL_PREFIX, SPONSOR_NEWS_PREFIX, SPONSOR_ROUND_TO, WORKS_BAR_LIFT,
} from './constants.ts';
import type {
  FormBand, GoalStanding, JudgedRace, SeatLift,
} from './types.ts';
import type {
  Career, CostShare, Discipline, LedgerLine, RacePlace, RaceScore, SeasonEntry, SponsorDeal, SponsorGoal,
  SponsorPerk, SponsorPerkKind, SponsorSlot, SponsorTerms,
} from '../../types/index.ts';
import { daysBetween } from '../calendar-days/index.ts';
import { LOWEST_RUNG, rungFee } from '../career-eligibility/index.ts';
import { editionOver } from '../editions/index.ts';
import { playerPlace, playerStanding, teammateSeat } from '../standings/index.ts';

/**
 * The id a sponsor's offer is mailed under, which the deal it signs keeps.
 * @param raceId The round whose draw brought it
 * @returns The id
 */
export const sponsorMailId = (raceId: string): string => `${SPONSOR_MAIL_PREFIX}${raceId}`;

/**
 * The id sponsor news about a deal is mailed under.
 * @param deal The deal, by id
 * @returns The id
 */
export const sponsorNewsId = (deal: string): string => `${SPONSOR_NEWS_PREFIX}${deal}`;

/**
 * The id a sponsor asks to renew a deal under, which the deal it signs keeps.
 * @param deal The deal it renews, by id
 * @returns The id
 */
export const sponsorRenewalId = (deal: string): string => `${SPONSOR_MAIL_PREFIX}renew:${deal}`;

/**
 * The id the news of a deal's goal met is mailed under.
 * @param deal The deal, by id
 * @returns The id
 */
export const goalNewsId = (deal: string): string => `${SPONSOR_NEWS_PREFIX}goal:${deal}`;

/**
 * The id the news of a deal climbing to a rung is mailed under.
 * @param deal The deal, by id
 * @param rung The rung it climbed to
 * @returns The id
 */
export const climbNewsId = (deal: string, rung: number): string => `${SPONSOR_NEWS_PREFIX}climb:${rung}:${deal}`;

/**
 * A career's best rung, in any discipline.
 * @param level The rung each discipline holds, 1 being the top
 * @returns The best of them
 */
export const bestRung = (level: Readonly<Record<Discipline, number>>): number => Math.min(...Object.values(level));

/**
 * How many partner slots a career holds: one at Rookie and one more each rung
 * up. Every rung below the lowest the ladder names holds Rookie's.
 * @param level The rung each discipline holds, 1 being the top
 * @returns The partner slots, beside the main sponsor's
 */
export const partnerSlots = (level: Readonly<Record<Discipline, number>>): number => (
  PARTNER_SLOTS[Math.min(Math.max(1, bestRung(level)), LOWEST_RUNG) - 1]
);

/**
 * The day a deal's year runs out: the same date a year on, the last day of
 * February for one signed on the 29th.
 * @param signed The day it was signed, as an ISO date
 * @returns The ISO date
 */
export const dealUntil = (signed: string): string => {
  const year = Number(signed.slice(0, 4)) + 1;
  const day = signed.slice(5) === '02-29' ? '02-28' : signed.slice(5);

  return `${String(year).padStart(4, '0')}-${day}`;
};

/**
 * The last day a deal covers, exclusive: its year's end, or the day it ended
 * when that came first.
 * @param deal The deal
 * @returns The ISO date
 */
export const dealEnd = (deal: Pick<SponsorDeal, 'ended' | 'until'>): string => (
  deal.ended && deal.ended.on < deal.until ? deal.ended.on : deal.until
);

/**
 * Whether a deal covers a day: after the day it was signed, which is the day
 * of the round that brought its offer, and before it ended.
 * @param deal The deal
 * @param date The ISO date
 * @returns True when it does
 */
export const dealCovers = (deal: Pick<SponsorDeal, 'ended' | 'signed' | 'until'>, date: string): boolean => (
  date > deal.signed && date < dealEnd(deal)
);

/**
 * Every deal a career holds now, a main sponsor first.
 * @param career The career
 * @returns Its deals not yet ended
 */
export const liveDeals = (career: Pick<Career, 'sponsors'>): SponsorDeal[] => (
  career.sponsors
    .filter((deal) => !deal.ended)
    .sort((left, right) => (left.slot === right.slot ? 0 : left.slot === 'main' ? -1 : 1))
);

/**
 * The rung a deal or an offer reads on: the discipline's it covers, or the
 * career's best for one covering any racing.
 * @param terms The deal or offer
 * @param level The rung each discipline holds, 1 being the top
 * @returns The rung
 */
export const dealRung = (
  terms: Pick<SponsorTerms, 'covers'>,
  level: Readonly<Record<Discipline, number>>,
): number => (terms.covers ? level[terms.covers] : bestRung(level));

/**
 * Whether a slot is free for a deal to fill.
 * @param career The career
 * @param slot Which slot
 * @returns True when no deal holds the main sponsor's, or a partner's is left
 */
export const slotFree = (career: Pick<Career, 'sponsors' | 'level'>, slot: SponsorSlot): boolean => {
  const live = liveDeals(career);

  return slot === 'main'
    ? !live.some((deal) => deal.slot === 'main')
    : live.filter((deal) => deal.slot === 'partner').length < partnerSlots(career.level);
};

/**
 * One perk of a deal or an offer.
 * @param terms The deal or offer
 * @param kind The perk
 * @returns It, or undefined when it has none
 */
export const perkOf = (terms: Pick<SponsorTerms, 'perks'>, kind: SponsorPerkKind): SponsorPerk | undefined => (
  terms.perks.find((perk) => perk.kind === kind)
);

/**
 * The discipline a season's entry races in, off its class.
 * @param entry The season's entry
 * @returns The discipline, or null when the class is not found
 */
export const entryDiscipline = (entry: SeasonEntry): Discipline | null => (
  entry.championship.entries.find((one) => one.id === entry.entry)?.ladder.discipline ?? null
);

/**
 * Whether a deal covers a season's entry: any racing, or its discipline.
 * @param terms The deal, or an offer
 * @param entry The season's entry
 * @returns True when its races count
 */
export const coversEntry = (terms: Pick<SponsorTerms, 'covers'>, entry: SeasonEntry): boolean => (
  terms.covers === null || entryDiscipline(entry) === terms.covers
);

/**
 * The deal paying every entry fee of a championship on a day.
 * @param career The career
 * @param series The championship, by id
 * @param date The ISO date of the round
 * @returns The deal, or null when no sponsor covers it
 */
export const coveringDeal = (career: Pick<Career, 'sponsors'>, series: string, date: string): SponsorDeal | null => (
  career.sponsors.find((deal) => (
    dealCovers(deal, date) && deal.perks.some((perk) => perk.kind === 'championship' && perk.series === series)
  )) ?? null
);

/**
 * The deal whose car purchase backing is still to use: one a deal year.
 * @param career The career
 * @returns The deal, or null when none is left to use
 */
export const carBackingDeal = (career: Pick<Career, 'sponsors' | 'ledger'>): SponsorDeal | null => (
  liveDeals(career).find((deal) => (
    perkOf(deal, 'carBacking') && !career.ledger.some((line) => line.key === `sponsor:${deal.id}:car`)
  )) ?? null
);

/**
 * Every deal reaching a discipline.
 * @param career The career
 * @param discipline The discipline
 * @returns The live deals covering it
 */
const dealsIn = (career: Pick<Career, 'sponsors'>, discipline: Discipline): SponsorDeal[] => (
  liveDeals(career).filter((deal) => deal.covers === null || deal.covers === discipline)
);

/**
 * The season's entry a deal's seat backing is in use on: the seat it paid half
 * of, until that season has finished, terminated or not.
 * @param career The career
 * @param deal The deal, by id
 * @returns The entry, or null when the backing is free
 */
export const seatBackedIn = (career: Pick<Career, 'seasons' | 'date'>, deal: string): SeasonEntry | null => (
  career.seasons
    .flatMap((season) => season.entries)
    .find((entry) => entry.contract?.backed?.deal === deal && !editionOver(entry, career.date)) ?? null
);

/**
 * The deal that may back a seat in a class: free to, covering its discipline,
 * and with the class on the career's rung or below - that discipline's rung for
 * a deal covering one.
 * @param career The career
 * @param discipline The class's discipline
 * @param tier The class's rung, 1 being the top
 * @returns The deal, or null when none may
 */
export const seatBackingDeal = (
  career: Pick<Career, 'sponsors' | 'seasons' | 'date' | 'level'>,
  discipline: Discipline,
  tier: number,
): SponsorDeal | null => dealsIn(career, discipline).find((deal) => (
  perkOf(deal, 'seatBacking') && tier >= dealRung(deal, career.level) && !seatBackedIn(career, deal.id)
)) ?? null;

/**
 * Who can pay part of a seat in a class.
 * @param career The career
 * @param discipline The class's discipline
 * @param tier The class's rung, 1 being the top
 * @returns The sponsor and its share, or null when none can
 */
export const seatBacker = (
  career: Pick<Career, 'sponsors' | 'seasons' | 'date' | 'level'>,
  discipline: Discipline,
  tier: number,
): { sponsor: string; share: number } | null => {
  const deal = seatBackingDeal(career, discipline, tier);

  return deal ? { sponsor: deal.sponsor.name, share: perkOf(deal, 'seatBacking')?.share ?? 0 } : null;
};

/**
 * A share of an amount.
 * @param amount The amount
 * @param share The share, as a percentage
 * @returns What it comes to, rounded
 */
export const percentOf = (amount: number, share: number): number => Math.round((amount * share) / 100);

/**
 * What a deal's backing pays of a price.
 * @param deal The deal
 * @param kind Which backing
 * @param price The car's or the seat's price
 * @returns The amount
 */
export const backingOf = (deal: SponsorDeal, kind: 'carBacking' | 'seatBacking', price: number): number => (
  percentOf(price, perkOf(deal, kind)?.share ?? 0)
);

/**
 * What a career's deals take off a round's fee or rent: every share covering
 * it adds, and none takes more than is left to pay.
 * @param career The career
 * @param discipline The discipline the round races in, null for none
 * @param date The round's day
 * @param kind Which cost
 * @param cost What it comes to
 * @returns What each sponsor takes off, none for nothing
 */
export const costShares = (
  career: Pick<Career, 'sponsors'>,
  discipline: Discipline | null,
  date: string,
  kind: 'feeShare' | 'rentShare',
  cost: number,
): CostShare[] => {
  let left = cost;

  return career.sponsors.flatMap((deal): CostShare[] => {
    const share = perkOf(deal, kind)?.share ?? 0;
    const reaches = deal.covers === null || deal.covers === discipline;
    if (share === 0 || left === 0 || !reaches || !dealCovers(deal, date)) return [];
    const amount = Math.min(left, percentOf(cost, share));
    left -= amount;

    return [{ sponsor: deal.sponsor.name, amount, share }];
  });
};

/**
 * What a cost comes to once its shares are taken off.
 * @param cost What it comes to
 * @param shares What is taken off
 * @returns What is left to pay
 */
export const afterShares = (cost: number, shares: readonly CostShare[]): number => (
  cost - shares.reduce((sum, one) => sum + one.amount, 0)
);

/**
 * The deal paying for repaints.
 * @param career The career
 * @returns The deal, or null when the player pays their own
 */
export const repaintDeal = (career: Pick<Career, 'sponsors'>): SponsorDeal | null => (
  liveDeals(career).find((deal) => perkOf(deal, 'repaints')) ?? null
);

/**
 * What a career's deals add to the seats it is offered in a discipline. Every
 * deal holding a perk adds, on what its slot gives.
 * @param career The career
 * @param discipline The class's discipline
 * @returns What they add, nothing at all without any
 */
export const seatLift = (career: Pick<Career, 'sponsors'>, discipline: Discipline): SeatLift => {
  const lift = { ...NO_SEAT_LIFT };
  for (const deal of dealsIn(career, discipline)) {
    const { slot } = deal;
    if (perkOf(deal, 'teamInterest')) lift.interest += SPONSOR_LIFT.teamInterest[slot];
    if (perkOf(deal, 'worksInterest')) {
      lift.works += SPONSOR_LIFT.worksInterest[slot];
      lift.bar += WORKS_BAR_LIFT[slot];
    }
    if (perkOf(deal, 'betterTerms')) {
      lift.salary += SPONSOR_LIFT.salary[slot];
      lift.seatPrice += SPONSOR_LIFT.seatPrice[slot];
      lift.cover = lift.cover || slot === 'main';
    }
  }
  lift.seatPrice = Math.min(1, lift.seatPrice);

  return lift;
};

/**
 * How much likelier a career's deals make a historic invitation in a discipline.
 * @param career The career
 * @param discipline The discipline
 * @returns The rise, as a share - nothing without any
 */
export const invitationLift = (career: Pick<Career, 'sponsors'>, discipline: Discipline): number => (
  dealsIn(career, discipline)
    .filter((deal) => perkOf(deal, 'invitations'))
    .reduce((sum, deal) => sum + SPONSOR_LIFT.invitations[deal.slot], 0)
);

/**
 * What a car reward sells from: three goal bonuses, never more than the car.
 * @param deal The deal
 * @param price The car's price
 * @returns The amount
 */
export const rewardWorth = (deal: Pick<SponsorTerms, 'perks'>, price: number): number => (
  Math.min(price, (perkOf(deal, 'goalBonus')?.amount ?? 0) * REWARD_BONUSES)
);

/**
 * The top of a class a share of it reaches: the top half of eighteen is nine.
 * @param size How many cars the class holds
 * @param share The share, from the top
 * @returns The lowest place inside it, never less than first
 */
export const topOf = (size: number, share: number): number => Math.max(1, Math.floor(size * share));

/**
 * Whether a class place counts as a result: first for a win, the top three for
 * a podium.
 * @param result The result
 * @param place The class place
 * @returns True when it does
 */
export const placeIs = (result: 'win' | 'podium', place: number): boolean => (
  place <= (result === 'win' ? 1 : PODIUM_PLACES)
);

/**
 * Whether one race met a deal's target. A qualifying target reads the place
 * the round's grid gave the player - a round that set none is on target.
 * @param terms The deal
 * @param entry The season's entry
 * @param race The race
 * @param place The player's place in it
 * @param size How many cars raced in their class
 * @returns True when it met the target
 */
const targetMet = (
  terms: Pick<SponsorTerms, 'target'>,
  entry: SeasonEntry,
  race: RaceScore,
  place: RacePlace,
  size: number,
): boolean => {
  const { target } = terms;
  switch (target.kind) {
    case 'classPlace':
      return place.classPosition <= topOf(size, target.share ?? 1);
    case 'qualifying':
      return place.qualifyingPosition === null || place.qualifyingPosition <= topOf(size, target.share ?? 1);
    case 'teammate': {
      const mate = teammateSeat(entry);
      const theirs = mate && race.places.find((one) => one.entry === entry.entry && one.seat === mate.id);

      return !theirs || place.classPosition < theirs.classPosition;
    }
    case 'clean':
      return (place.cuts ?? 0) <= (target.cuts ?? 0);
    default:
      return true;
  }
};

/**
 * Every race a deal covers and the player drove inside its year, oldest
 * first, each judged on its target.
 * @param career The career
 * @param deal The deal
 * @returns The races
 */
export const judgedRaces = (career: Pick<Career, 'seasons'>, deal: SponsorDeal): JudgedRace[] => {
  const judged: JudgedRace[] = [];
  for (const season of career.seasons) {
    for (const entry of season.entries) {
      if (!coversEntry(deal, entry)) continue;
      for (const event of entry.events) {
        if (!dealCovers(deal, event.date)) continue;
        let first = true;
        for (const race of event.score?.races ?? []) {
          const place = playerPlace(entry, race);
          if (!place) continue;
          const size = race.places.filter((one) => one.entry === entry.entry).length;
          const qualifying = deal.target.kind === 'qualifying';
          const met = targetMet(deal, entry, race, place, size);
          judged.push({
            season,
            entry,
            event,
            race,
            place,
            size,
            first,
            onTarget: qualifying ? first && met : met,
            paid: qualifying ? first : true,
          });
          first = false;
        }
      }
    }
  }

  return judged.sort((left, right) => left.event.date.localeCompare(right.event.date));
};

/**
 * How far into its year a deal is.
 * @param deal The deal
 * @param today The ISO date the clock stands at
 * @returns 0 as it is signed to 1 as its year runs out
 */
const yearDone = (deal: SponsorDeal, today: string): number => (
  Math.min(1, Math.max(0, daysBetween(deal.signed, today < deal.until ? today : deal.until) / DEAL_DAYS))
);

/**
 * Where the player stands in a season's entry against the place a goal asks.
 * @param entry The season's entry
 * @param goal The goal
 * @returns Their place and the place asked, or null before they have raced it
 */
const placeAgainst = (entry: SeasonEntry, goal: SponsorGoal): { position: number; needed: number } | null => {
  const drivers = entry.standings.classes.find((one) => one.entry === entry.entry)?.drivers ?? [];
  const row = playerStanding(entry);
  if (!row || row.races === 0) return null;

  return {
    position: row.position,
    needed: goal.count ?? topOf(drivers.filter((one) => !one.substitute).length, goal.share ?? 1),
  };
};

/**
 * How far a deal's goal has got, as things stand.
 *
 * A championship place reads every edition the deal covers that the player
 * raced in its year, on its table as it stands; a count is on course while it
 * keeps pace with the year, and a share while it holds.
 * @param career The career
 * @param deal The deal
 * @returns Where the goal stands
 */
export const goalStanding = (career: Pick<Career, 'seasons' | 'date'>, deal: SponsorDeal): GoalStanding => {
  const { goal } = deal;
  const races = judgedRaces(career, deal);

  if (goal.kind === 'championshipPlace') {
    const entries = [...new Set(races.map((one) => one.entry))];
    let best: { position: number; needed: number } | null = null;
    for (const entry of entries) {
      const place = placeAgainst(entry, goal);
      if (place && (!best || place.position - place.needed < best.position - best.needed)) best = place;
    }
    if (!best) {
      return {
        reached: 0, needed: goal.count ?? 0, met: false, onCourse: null,
      };
    }
    const met = best.position <= best.needed;

    return {
      reached: best.position, needed: best.needed, met, onCourse: met,
    };
  }

  if (goal.kind === 'onTarget') {
    const judged = races.filter((one) => one.paid);
    const hit = judged.filter((one) => one.onTarget).length;
    const share = judged.length === 0 ? 0 : hit / judged.length;
    const needed = goal.share ?? 1;

    return {
      reached: share,
      needed,
      met: judged.length > 0 && share >= needed,
      onCourse: judged.length === 0 ? null : share >= needed,
    };
  }

  const reached = goal.kind === 'racesStarted'
    ? races.length
    : races.filter((one) => (
      goal.result === 'pole'
        ? one.first && one.place.qualifyingPosition === 1
        : placeIs(goal.result === 'win' ? 'win' : 'podium', one.place.classPosition)
    )).length;
  const needed = goal.count ?? 1;
  const met = reached >= needed;

  return {
    reached, needed, met, onCourse: met || reached >= Math.floor(needed * yearDone(deal, career.date)),
  };
};

/**
 * Whether a deal's goal is settled as met. A count is the day it is reached,
 * and a championship place the day a season of it finishes there. A share of
 * races moves until the last, so it settles only as the deal's year runs out -
 * when everything else is read as it stands.
 * @param career The career
 * @param deal The deal
 * @returns True once it is
 */
export const goalSettled = (career: Pick<Career, 'seasons' | 'date'>, deal: SponsorDeal): boolean => {
  const standing = goalStanding(career, deal);
  if (deal.until <= career.date) return standing.met;
  if (deal.goal.kind === 'onTarget') return false;
  if (deal.goal.kind !== 'championshipPlace') return standing.met;

  const finished = [...new Set(judgedRaces(career, deal).map((one) => one.entry))]
    .filter((entry) => editionOver(entry, career.date));

  return finished.some((entry) => {
    const place = placeAgainst(entry, deal.goal);

    return place !== null && place.position <= place.needed;
  });
};

/**
 * Where a career's form stands: how far down its class it finished, on
 * average, over its latest rounds - each round read on its best race.
 * @param career The career
 * @returns The band, or null before it has raced a round
 */
export const formOf = (career: Pick<Career, 'seasons'>): FormBand | null => {
  const rounds: { date: string; at: number }[] = [];
  for (const season of career.seasons) {
    for (const entry of season.entries) {
      for (const event of entry.events) {
        let best: number | null = null;
        for (const race of event.score?.races ?? []) {
          const place = playerPlace(entry, race);
          if (!place) continue;
          const size = race.places.filter((one) => one.entry === entry.entry).length;
          const at = size > 1 ? (place.classPosition - 1) / (size - 1) : 0;
          best = best === null ? at : Math.min(best, at);
        }
        if (best !== null) rounds.push({ date: event.date, at: best });
      }
    }
  }
  if (rounds.length === 0) return null;

  const latest = rounds.sort((left, right) => right.date.localeCompare(left.date)).slice(0, FORM_ROUNDS);
  const average = latest.reduce((sum, one) => sum + one.at, 0) / latest.length;

  return FORM_BANDS.find((one) => average < one.below)?.band ?? 'bottom';
};

/**
 * Every ledger line a deal has paid.
 * @param career The career
 * @param deal The deal, by id
 * @returns Its lines, oldest first
 */
export const dealLines = (career: Pick<Career, 'ledger'>, deal: string): LedgerLine[] => (
  career.ledger.filter((line) => line.sponsor?.deal === deal)
);

/**
 * What a deal has paid so far.
 * @param career The career
 * @param deal The deal, by id
 * @returns The sum of its lines
 */
export const dealPaid = (career: Pick<Career, 'ledger'>, deal: string): number => (
  dealLines(career, deal).reduce((sum, line) => sum + line.amount, 0)
);

/**
 * What a deal's figures are multiplied by now: one, or for a deal that climbs
 * with the player, the rise from the rung it was drawn at to the rung it reads
 * on now.
 * @param deal The deal
 * @param level The rung each discipline holds, 1 being the top
 * @returns The multiplier
 */
export const dealScale = (
  deal: Pick<SponsorTerms, 'perks' | 'rung' | 'covers'>,
  level: Readonly<Record<Discipline, number>>,
): number => {
  const rung = dealRung(deal, level);
  if (!perkOf(deal, 'climbs') || rung >= deal.rung) return 1;

  return rungFee(rung) / rungFee(deal.rung);
};

/**
 * A sponsor's figure as it is paid and shown: scaled for a deal that climbs
 * with the player, to a round figure.
 * @param amount The figure as drawn
 * @param scale What the deal's figures are multiplied by now
 * @returns The amount
 */
export const sponsorFigure = (amount: number, scale: number): number => (
  Math.round((amount * scale) / SPONSOR_ROUND_TO) * SPONSOR_ROUND_TO
);

/**
 * What ending a deal early repays: the share of its signing bonus its year
 * has left.
 * @param deal The deal
 * @param today The ISO date it ends on
 * @returns The amount, rounded
 */
export const signingRepay = (deal: Pick<SponsorTerms, 'perks'> & Pick<SponsorDeal, 'until'>, today: string): number => {
  const signing = perkOf(deal, 'signing')?.amount ?? 0;
  const left = Math.max(0, daysBetween(today, deal.until)) / DEAL_DAYS;

  return Math.round((signing * left) / REPAY_ROUND) * REPAY_ROUND;
};

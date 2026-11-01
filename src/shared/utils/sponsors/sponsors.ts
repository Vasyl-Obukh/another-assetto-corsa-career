// A career's sponsors read the way both processes need them: how many slots a
// rung holds, a deal's year, which races a deal covers and whether each met its
// target, how far its goal has got, and the career's form. Shared because main
// pays and ends deals on these answers and the renderer shows the same.

import {
  DEAL_DAYS, FORM_BANDS, FORM_ROUNDS, PARTNER_SLOTS, PODIUM_PLACES, REPAY_ROUND, RUNG_FEE, SPONSOR_MAIL_PREFIX,
  SPONSOR_NEWS_PREFIX, SPONSOR_ROUND_TO,
} from './constants.ts';
import type { FormBand, GoalStanding, JudgedRace } from './types.ts';
import type {
  Career, Discipline, LedgerLine, RacePlace, RaceScore, SeasonEntry, SponsorDeal, SponsorTerms,
} from '../../types/index.ts';
import { daysBetween } from '../calendar-days/index.ts';
import { LOWEST_RUNG } from '../career-eligibility/index.ts';
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
 * A rung's typical entry fee, which every sponsor's figure scales with.
 * @param rung The rung, 1 being the top
 * @returns The fee
 */
export const rungFee = (rung: number): number => RUNG_FEE[Math.min(Math.max(1, rung), LOWEST_RUNG) - 1];

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
      const drivers = entry.standings.classes.find((one) => one.entry === entry.entry)?.drivers ?? [];
      const row = playerStanding(entry);
      if (!row || row.races === 0) continue;
      const needed = goal.count ?? topOf(drivers.filter((one) => !one.substitute).length, goal.share ?? 1);
      if (!best || row.position - needed < best.position - best.needed) best = { position: row.position, needed };
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
 * with the player, the rise from the rung it was drawn at to their best.
 * @param deal The deal
 * @param level The rung each discipline holds, 1 being the top
 * @returns The multiplier
 */
export const dealScale = (
  deal: Pick<SponsorTerms, 'perks' | 'rung'>,
  level: Readonly<Record<Discipline, number>>,
): number => {
  const best = bestRung(level);
  if (!deal.perks.some((perk) => perk.kind === 'climbs') || best >= deal.rung) return 1;

  return rungFee(best) / rungFee(deal.rung);
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
  const signing = deal.perks.find((perk) => perk.kind === 'signing')?.amount ?? 0;
  const left = Math.max(0, daysBetween(today, deal.until)) / DEAL_DAYS;

  return Math.round((signing * left) / REPAY_ROUND) * REPAY_ROUND;
};

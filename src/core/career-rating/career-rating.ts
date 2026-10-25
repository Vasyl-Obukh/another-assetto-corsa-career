// A career's rating: Elo against a field rated off its rung and how far over
// the player's own setting it raced, each session driven moving its
// discipline's rating and the global one. Pure, so the career store decides
// when and this decides what. Every line is keyed by what it settles, so
// rating again rates nothing twice - and lines are rated in the order their
// sessions landed, since each moves the rating the next is rated from.

import type { PendingSession, SessionMove } from './types.ts';
import { pendingSessions } from './utils.ts';
import {
  DISCIPLINES, MIN_RATING, QUALIFYING_WEIGHT, RATING_K, RATING_MAX_LOSS, RATING_PER_POINT, RATING_SPREAD,
} from '../../shared/constants/index.ts';
import type {
  Career, CareerSeason, RatingLine, SeasonEntry,
} from '../../shared/types/index.ts';
import {
  dropRating, fieldRating, levelOfRating, LOWEST_RUNG, ratingFloor,
} from '../../shared/utils/career-eligibility/index.ts';
import { isHistoric } from '../../shared/utils/historic/index.ts';

/**
 * How likely a driver is to beat another, on their ratings.
 * @param rating The driver's
 * @param other The other's
 * @returns The chance, from 0 to 1
 */
export const expectedToBeat = (rating: number, other: number): number => (
  1 / (1 + 10 ** ((other - rating) / RATING_SPREAD))
);

/**
 * How one session moves a rating: K times its weight and the speed, times the
 * share of the field beaten less the share expected - and never more taken
 * away than a third of what it could give.
 * @param rating The rating it is rated from
 * @param field Each classmate's rating
 * @param place The player's place among them, counting from one
 * @param weight 1 for a race, a quarter for a qualifying
 * @param speed The career's rating speed
 * @returns The change and how it came about
 */
export const rateAgainst = (
  rating: number,
  field: readonly number[],
  place: number,
  weight: number,
  speed: number,
): SessionMove => {
  const chances = field.map((other) => expectedToBeat(rating, other));
  const expectedShare = chances.reduce((sum, chance) => sum + chance, 0) / chances.length;
  const beaten = (field.length + 1 - place) / field.length;
  const raw = RATING_K * weight * speed * (beaten - expectedShare);
  const cap = RATING_MAX_LOSS * weight * speed;
  const held = raw < -cap;
  // Whole points, and never below the floor a rating stops at.
  const change = Math.max(MIN_RATING - rating, Math.round(held ? -cap : raw));

  return {
    change,
    ...(held ? { uncapped: Math.round(raw) } : {}),
    beaten,
    expectedShare,
    expected: Math.round(1 + chances.reduce((sum, chance) => sum + (1 - chance), 0)),
  };
};

/**
 * What every line about one round says of where it came from.
 * @param pending The session
 * @returns The line's fields naming the round
 */
const roundOf = (pending: PendingSession): Pick<
  RatingLine,
  'date' | 'season' | 'series' | 'seriesName' | 'edition' | 'round' | 'roundName' | 'number' | 'historic'
> => {
  const { season, entry, event } = pending;
  const at = entry.championship.rounds.findIndex((one) => one.id === event.round);

  return {
    date: event.date,
    season: season.index,
    series: entry.series,
    seriesName: entry.championship.name,
    edition: entry.edition,
    round: event.round,
    roundName: entry.championship.rounds[at]?.name ?? event.round,
    number: at + 1,
    ...(isHistoric(entry) ? { historic: true } : {}),
  };
};

/**
 * Rates a career for every session it drove and has not been rated for, and
 * opens every rung a rating passes the floor of on the way.
 *
 * Only a career has a ladder: a standalone championship is never rated.
 * @param career The career
 * @returns The career, rated - the same one when nothing was owed
 */
export const rateCareer = (career: Career): Career => {
  if (career.kind !== 'career') return career;
  const pending = pendingSessions(career);
  if (pending.length === 0) return career;

  const rating = { ...career.rating };
  const level = { ...career.level };
  let global = career.globalRating;
  const lines: RatingLine[] = [];
  const speed = career.settings.ratingSpeed;

  for (const one of pending) {
    const { discipline } = one;
    // A historic event is a race on the rung the discipline earned, so a guest
    // seat three rungs up proves only what one on its own would - and, lifting
    // nothing, is never rated against a field its rating has not reached.
    const rung = one.tier ?? level[discipline];
    const field = one.offsets.map((offset) => fieldRating(rung) + offset * RATING_PER_POINT);
    const weight = one.type === 'race' ? 1 : QUALIFYING_WEIGHT;
    const own = rateAgainst(rating[discipline], field, one.place, weight, speed);
    const all = rateAgainst(global, field, one.place, weight, speed);
    rating[discipline] += own.change;
    global += all.change;

    const named = roundOf(one);
    lines.push({
      key: one.key,
      kind: one.type === 'race' ? 'race' : 'qualifying',
      ...named,
      discipline,
      change: own.change,
      globalChange: all.change,
      rating: rating[discipline],
      global,
      ...(one.name === undefined ? {} : { sessionName: one.name }),
      working: {
        place: one.place,
        of: one.offsets.length + 1,
        expected: own.expected,
        beaten: own.beaten,
        expectedShare: own.expectedShare,
        field: Math.round(field.reduce((sum, value) => sum + value, 0) / field.length),
        offsetLow: Math.min(...one.offsets),
        offsetHigh: Math.max(...one.offsets),
        rung,
        weight,
        speed,
        ...(own.uncapped === undefined ? {} : { uncapped: own.uncapped }),
        ...(all.uncapped === undefined ? {} : { globalUncapped: all.uncapped }),
        ...(one.record.scale === undefined ? {} : { scale: one.record.scale }),
      },
    });

    // A rung opens the moment its floor is passed - however many at once.
    const reached = levelOfRating(rating[discipline]);
    if (reached < level[discipline]) {
      level[discipline] = reached;
      lines.push({
        key: `promotion:${one.key}`,
        kind: 'promotion',
        ...named,
        discipline,
        change: 0,
        globalChange: 0,
        rating: rating[discipline],
        global,
        tier: reached,
      });
    }
  }

  return {
    ...career, rating, globalRating: global, level, ratingLog: [...career.ratingLog, ...lines],
  };
};

/**
 * Closes a season's levels: each discipline whose rating ended it under the
 * middle of the rung beneath its own drops, rung by rung, to the first it
 * holds. A season is judged as a season, so nothing drops at any other time,
 * and an entry already made stands.
 * @param career The career, its clock on the season's last day
 * @param season The season closing
 * @returns The career, its levels closed - the same one when nothing dropped
 */
export const closeLevels = (career: Career, season: CareerSeason): Career => {
  if (career.kind !== 'career') return career;

  const level = { ...career.level };
  const lines: RatingLine[] = [];
  for (const discipline of DISCIPLINES) {
    const key = `drop:${season.index}:${discipline}`;
    if (career.ratingLog.some((line) => line.key === key)) continue;

    let held = level[discipline];
    for (let under = dropRating(held); held < LOWEST_RUNG && under !== null; under = dropRating(held)) {
      if (career.rating[discipline] >= under) break;
      held += 1;
    }
    if (held === level[discipline]) continue;

    level[discipline] = held;
    lines.push({
      key,
      kind: 'drop',
      date: season.endDate,
      season: season.index,
      discipline,
      change: 0,
      globalChange: 0,
      rating: career.rating[discipline],
      global: career.globalRating,
      tier: held,
    });
  }

  return lines.length === 0 ? career : { ...career, level, ratingLog: [...career.ratingLog, ...lines] };
};

/**
 * Lifts a discipline to the floor of the rung a championship is entered at,
 * when it is entered above the discipline's own level - which only the rung
 * below the career's best allows. Once, as it is entered; a historic event's
 * seat is a guest's and lifts nothing.
 * @param career The career, before the entry
 * @param season The season it is entered in
 * @param entry The season's entry
 * @returns The career, lifted - the same one when nothing needed lifting
 */
export const liftOnEntering = (career: Career, season: CareerSeason, entry: SeasonEntry): Career => {
  const ladder = entry.championship.entries.find((one) => one.id === entry.entry)?.ladder;
  if (career.kind !== 'career' || !ladder || isHistoric(entry)) return career;
  const { discipline, tier } = ladder;
  if (tier >= career.level[discipline]) return career;

  const key = `lift:${season.index}:${entry.series}:${entry.edition}`;
  const lifted = Math.max(career.rating[discipline], ratingFloor(tier));

  return {
    ...career,
    rating: { ...career.rating, [discipline]: lifted },
    level: { ...career.level, [discipline]: Math.min(levelOfRating(lifted), tier) },
    ratingLog: [...career.ratingLog, {
      key,
      kind: 'lift',
      date: career.date,
      season: season.index,
      discipline,
      change: lifted - career.rating[discipline],
      globalChange: 0,
      rating: lifted,
      global: career.globalRating,
      tier,
      series: entry.series,
      seriesName: entry.championship.name,
      edition: entry.edition,
    }],
  };
};

/**
 * The line a career's rating opens on.
 * @param date The day it starts, as an ISO date
 * @param tier The rung it starts on
 * @returns The line
 */
export const openingRatingLine = (date: string, tier: number): RatingLine => ({
  key: 'opening',
  kind: 'opening',
  date,
  season: 0,
  change: 0,
  globalChange: 0,
  global: ratingFloor(tier),
  tier,
});

/**
 * Notes a change of a career's rating speed, which moves no rating and is
 * kept so a run played at more than one speed says so.
 * @param career The career, before the change
 * @param to The speed it runs at from now on
 * @returns The career, the change noted
 */
export const noteRatingSpeed = (career: Career, to: number): Career => ({
  ...career,
  ratingLog: [...career.ratingLog, {
    key: `speed:${career.ratingLog.length}`,
    kind: 'speed',
    date: career.date,
    season: career.seasons[career.seasons.length - 1]?.index ?? 0,
    change: 0,
    globalChange: 0,
    global: career.globalRating,
    speed: { from: career.settings.ratingSpeed, to },
  }],
});

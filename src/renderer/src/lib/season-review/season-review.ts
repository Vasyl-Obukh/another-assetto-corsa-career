// A championship edition and a whole season, looked back on: the figures, the
// champions and the path through the table that History, the reviews and Home
// read. Pure, and derived on every read from the season's own copy of the
// championship - so a review never changes after the edition is over, and there
// is nothing stored to fall out of step with it.

import type {
  ChampionshipReview, ClassChampions, EditionSummary, ReviewFigures, RoundStanding, TeammateRecord, YearReview,
} from './types.ts';
import type {
  CareerSeason, ChampionshipResults, ChampionshipRun, RacePlace, RaceScore, SeasonEntry,
} from '../../../../shared/types';
import { editionsOf } from '../../../../shared/utils/editions';
import { entryResults } from '../../../../shared/utils/standings';
import type { ClassSeason, DriverRow } from '@/lib/season-results';
import { seasonResults } from '@/lib/season-results';

/**
 * Whether an edition is over: every round run, raced or passed by, and the last
 * of them behind the clock. A round given up by withdrawing is simulated on its
 * own day, so an edition left early is over only once that day has come.
 * @param entry The edition
 * @param today The ISO date the career's clock stands at
 * @returns True once nothing of it is left to run
 */
export const editionOver = (entry: SeasonEntry, today: string): boolean => entry.events.every((event) => (
  event.status !== 'scheduled' && event.date <= today
));

/**
 * The run of a championship after one edition: the next edition of the same
 * season, or the first of the next once the season's last has run.
 * @param entry The edition
 * @param season Which season it ran in
 * @returns The next run
 */
export const nextRun = (entry: SeasonEntry, season: number): ChampionshipRun => (
  entry.edition + 1 < editionsOf(entry.championship)
    ? { season, edition: entry.edition + 1 }
    : { season: season + 1, edition: 0 }
);

/**
 * Whether a place is a race the player drove rather than the qualifying points
 * of one a stand-in raced.
 * @param place The place
 * @returns True for a race driven
 */
const driven = (place: RacePlace): boolean => !place.bonusOnly;

/**
 * The player's own place in one race, never a stand-in's.
 * @param race The race
 * @param seat The player's seat
 * @returns The place, or undefined when the player did not drive it
 */
const ownPlace = (race: RaceScore, seat: string): RacePlace | undefined => race.places.find((place) => (
  place.seat === seat && !place.substitute && driven(place)
));

/**
 * The player's row of a class's table.
 * @param table The class's tables
 * @returns The row, or null when the player holds none
 */
const playerRow = (table: ClassSeason | null): DriverRow | null => table?.drivers.find((row) => row.player) ?? null;

/**
 * What the player made of an edition, as figures.
 * @param entry The edition
 * @param table The player's class's final tables
 * @param me The player's row of them
 * @returns The figures
 */
const figuresOf = (entry: SeasonEntry, table: ClassSeason, me: DriverRow): ReviewFigures => {
  const finishes = me.places.filter(driven).map((place) => place.classPosition);
  const races = entry.events.flatMap((event) => event.score?.races ?? []).length;
  const champion = table.drivers[0];
  const second = table.drivers.find((row) => row !== me);

  return {
    points: me.points,
    gap: Math.max(0, (champion?.points ?? me.points) - me.points),
    lead: me.position === 1 ? me.points - (second?.points ?? 0) : 0,
    wins: me.wins,
    podiums: me.podiums,
    poles: me.places.filter((place) => driven(place) && place.qualifyingPosition === 1).length,
    fastestLaps: me.places.filter((place) => driven(place) && place.fastestLap).length,
    best: me.bestFinish,
    average: finishes.length > 0 ? finishes.reduce((sum, at) => sum + at, 0) / finishes.length : null,
    starts: finishes.length,
    races,
    nonStarts: entry.events.filter((event) => event.status === 'missed').length,
  };
};

/**
 * Where the player stood after each round, and what they took from it.
 * @param entry The edition
 * @param results The edition as the results screens read it
 * @returns One standing per round, in calendar order
 */
const pathOf = (entry: SeasonEntry, results: ChampionshipResults): RoundStanding[] => (
  entry.events.map((event, at): RoundStanding => {
    const races = event.score?.races ?? [];
    const places = races.flatMap((race) => {
      const place = ownPlace(race, entry.playerSeat);

      return place ? [place] : [];
    });
    const bonus = races.flatMap((race) => race.places.filter((place) => (
      place.seat === entry.playerSeat && place.bonusOnly
    )));
    const scored = event.score !== undefined;
    const after = scored ? playerRow(
      seasonResults(results, event.round).classes.find((one) => one.entry === entry.entry) ?? null,
    ) : null;

    return {
      round: event.round,
      number: at + 1,
      position: after?.position ?? null,
      places,
      points: [...places, ...bonus].reduce((sum, place) => sum + place.points, 0),
    };
  })
);

/**
 * How the player fared against the other seat of their team in their class.
 * @param entry The edition
 * @param table The class's final tables
 * @returns The record, or null for a seat without a teammate
 */
const teammateOf = (entry: SeasonEntry, table: ClassSeason): TeammateRecord | null => {
  const seats = entry.championship.entries.find((one) => one.id === entry.entry)?.seats ?? [];
  const team = seats.find((seat) => seat.id === entry.playerSeat)?.team;
  const mate = team ? seats.find((seat) => seat.id !== entry.playerSeat && seat.team === team) : undefined;
  const row = mate ? table.drivers.find((one) => one.seat === mate.id && !one.substitute) : undefined;
  if (!mate || !row) return null;

  const record: TeammateRecord = {
    row, qualifying: { ahead: 0, behind: 0 }, finish: { ahead: 0, behind: 0 },
  };
  entry.events.flatMap((event) => event.score?.races ?? []).forEach((race) => {
    const mine = ownPlace(race, entry.playerSeat);
    const theirs = race.places.find((place) => place.seat === mate.id && !place.substitute && driven(place));
    if (!mine || !theirs) return;

    if (mine.classPosition < theirs.classPosition) record.finish.ahead += 1;
    else record.finish.behind += 1;
    if (mine.qualifyingPosition !== null && theirs.qualifyingPosition !== null) {
      if (mine.qualifyingPosition < theirs.qualifyingPosition) record.qualifying.ahead += 1;
      else record.qualifying.behind += 1;
    }
  });

  return record;
};

/**
 * One edition of a championship, looked back on.
 * @param entry The edition, as the career holds it
 * @param season Which season it ran in, counting from zero
 * @returns Its final tables, its champions and what the player made of it
 */
export const championshipReview = (entry: SeasonEntry, season: number): ChampionshipReview => {
  const results = entryResults(entry, season);
  const final = seasonResults(results);
  const table = final.classes.find((one) => one.entry === entry.entry) ?? null;
  const me = playerRow(table);
  const champions = final.classes.map((one): ClassChampions => ({
    entry: one.entry, name: one.name, driver: one.drivers[0] ?? null, team: one.teams[0] ?? null,
  }));

  return {
    results,
    season: final,
    table,
    me,
    field: table?.drivers.length ?? 0,
    champions,
    figures: table && me ? figuresOf(entry, table, me) : null,
    path: pathOf(entry, results),
    teammate: table ? teammateOf(entry, table) : null,
  };
};

/**
 * One edition as a list reads it, off its review.
 * @param entry The edition, as the career holds it
 * @param review Its review
 * @param today The ISO date the career's clock stands at
 * @returns Its summary
 */
const summaryOf = (entry: SeasonEntry, review: ChampionshipReview, today: string): EditionSummary => {
  const { me } = review;
  const leader = review.table?.drivers[0];
  const scored = review.season.counted > 0;

  return {
    series: entry.series,
    name: entry.championship.name,
    season: review.results.season,
    edition: entry.edition,
    editions: editionsOf(entry.championship),
    entry: entry.entry,
    ladder: entry.championship.entries.find((one) => one.id === entry.entry)?.ladder ?? null,
    position: scored ? me?.position ?? null : null,
    field: review.field,
    points: me?.points ?? 0,
    wins: me?.wins ?? 0,
    champion: scored ? leader?.driver ?? null : null,
    title: scored && leader !== undefined && leader === me,
    run: entry.events.filter((event) => event.status !== 'scheduled').length,
    missed: entry.events.filter((event) => event.status === 'missed').length,
    rounds: entry.events.length,
    over: editionOver(entry, today),
    withdrawn: entry.withdrawn ?? false,
    path: review.path.flatMap((one) => (one.position === null ? [] : [one.position])),
  };
};

/**
 * One edition, as a list reads it.
 * @param entry The edition, as the career holds it
 * @param season Which season it ran in, counting from zero
 * @param today The ISO date the career's clock stands at
 * @returns Its summary
 */
export const editionSummary = (entry: SeasonEntry, season: number, today: string): EditionSummary => (
  summaryOf(entry, championshipReview(entry, season), today)
);

/**
 * One season, looked back on.
 * @param season The season
 * @param today The ISO date the career's clock stands at
 * @returns Every edition it entered, and the season in numbers
 */
export const yearReview = (season: CareerSeason, today: string): YearReview => {
  const ordered = [...season.entries].sort((left, right) => (
    (left.events[0]?.date ?? '').localeCompare(right.events[0]?.date ?? '')
  ));
  const reviews = ordered.map((entry) => ({ entry, review: championshipReview(entry, season.index) }));
  const editions = reviews.map(({ entry, review }) => summaryOf(entry, review, today));
  const figures = reviews.flatMap(({ review }) => (review.figures ? [review.figures] : []));
  const sum = (pick: (figures: ReviewFigures) => number): number => (
    figures.reduce((total, one) => total + pick(one), 0)
  );

  return {
    editions,
    running: editions.filter((one) => !one.over),
    totals: {
      championships: editions.length,
      finished: editions.filter((one) => one.over).length,
      titles: editions.filter((one) => one.over && one.title).length,
      starts: sum((one) => one.starts),
      nonStarts: sum((one) => one.nonStarts),
      wins: sum((one) => one.wins),
      podiums: sum((one) => one.podiums),
      poles: sum((one) => one.poles),
      fastestLaps: sum((one) => one.fastestLaps),
    },
  };
};

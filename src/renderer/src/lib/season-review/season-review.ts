// A championship edition and a whole season, looked back on: the figures, the
// champions and the path through the table that History, the reviews and Home
// read. Pure, and derived on every read from the season's own copy of the
// championship - so a review never changes after the edition is over, and there
// is nothing stored to fall out of step with it.

import type {
  ChampionshipReview,
  ClassChampions,
  EditionSummary,
  HistoricOutcome,
  HistoricReview,
  HistoricRow,
  ReviewFigures,
  RoundStanding,
  TeammateRecord,
  YearReview,
} from './types.ts';
import type {
  CareerSeason, Championship, ChampionshipResults, ChampionshipRun, RacePlace, RaceScore, SeasonEntry,
} from '../../../../shared/types';
import { editionOver, editionsOf } from '../../../../shared/utils/editions';
import { championshipEntries, historicEntries } from '../../../../shared/utils/historic';
import { prizeTable, scaledPrize } from '../../../../shared/utils/prizes';
import { entryResults } from '../../../../shared/utils/standings';
import type { ClassSeason, DriverRow } from '@/lib/season-results';
import { seasonResults } from '@/lib/season-results';

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
  // A historic event is a single event rather than an edition, and has a
  // section of its own.
  const ordered = championshipEntries(season).sort((left, right) => (
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

/**
 * What one class place pays in prize money, by the purse of the class it is
 * in - its own where it has one, the event's otherwise.
 * @param series The championship or historic event
 * @param entry The class entry's id
 * @param classPosition The place within the class, counting from one
 * @param speed The progression speed it is paid at - `prizeSpeed`'s answer
 * @returns The prize, or null for a place that pays nothing
 */
export const prizeFor = (
  series: Championship,
  entry: string | null | undefined,
  classPosition: number,
  speed = 1,
): number | null => {
  const prize = scaledPrize(prizeTable(series, entry, 'positions')[classPosition - 1] ?? 0, speed);

  return prize > 0 ? prize : null;
};

/**
 * What became of one historic event, from the player's side.
 * @param entry The historic event, as the season holds it
 * @returns The outcome
 */
const outcomeOf = (entry: SeasonEntry): HistoricOutcome => {
  const status = entry.events[0]?.status ?? 'scheduled';
  if (status === 'missed') return entry.withdrawn ? 'declined' : 'missed';

  return status;
};

/**
 * One historic event of a season, as a list of them reads it.
 * @param entry The historic event, as the season holds it
 * @param speed The progression speed its prizes are paid at
 * @returns Its row
 */
const historicRow = (entry: SeasonEntry, speed: number): HistoricRow => {
  const event = entry.events[0];
  const round = entry.championship.rounds.find((one) => one.id === event?.round);
  const held = entry.championship.entries.find((one) => one.id === entry.entry);
  const seat = held?.seats.find((one) => one.id === entry.playerSeat);
  const places = (event?.score?.races ?? []).flatMap((race) => {
    const place = ownPlace(race, entry.playerSeat);

    return place ? [place] : [];
  });
  const last = places.at(-1);
  // Per race, as a purse pays.
  const prize = places.reduce((sum, place) => (
    sum + (prizeFor(entry.championship, entry.entry, place.classPosition, speed) ?? 0)
  ), 0);

  return {
    series: entry.series,
    round: event?.round ?? '',
    name: entry.championship.name,
    date: event?.date ?? '',
    track: round?.track ?? { id: '' },
    ladder: held?.ladder ?? null,
    car: entry.car.model,
    team: entry.championship.teams?.find((one) => one.id === seat?.team)?.name ?? null,
    driver: seat?.driver?.name ?? null,
    outcome: outcomeOf(entry),
    started: (event?.sessions.length ?? 0) > 0,
    qualified: last?.qualifyingPosition ?? null,
    finished: last?.classPosition ?? null,
    multiClass: entry.championship.entries.length > 1,
    prize: prize > 0 ? prize : null,
  };
};

/**
 * A season's historic events, looked back on.
 * @param season The season
 * @param speed The progression speed their prizes are paid at - `prizeSpeed`'s
 * answer
 * @returns Every one it drew, and what the player made of them
 */
export const historicReview = (season: CareerSeason, speed = 1): HistoricReview => {
  const rows = historicEntries(season)
    .map((entry) => historicRow(entry, speed))
    .sort((left, right) => left.date.localeCompare(right.date));
  const raced = rows.filter((row) => row.finished !== null);

  return {
    rows,
    raced: raced.length,
    wins: raced.filter((row) => row.finished === 1).length,
    podiums: raced.filter((row) => (row.finished ?? 0) <= 3).length,
    prize: rows.reduce((sum, row) => sum + (row.prize ?? 0), 0),
    notRaced: rows.filter((row) => row.outcome === 'declined' || row.outcome === 'missed').length,
  };
};

// A championship's season, read into what its tables draw: a column per race,
// a row per driver and per team, and how far each moved since the round
// before. Pure, so the standings as they stood after any round are a question
// rather than something stored - which is how the round page shows the
// championship after its own round, and the table says who moved.

import type {
  ClassSeason, DriverRow, RaceColumn, RoundColumn, SeasonResults, TeamRow,
} from './types.ts';
import type {
  Championship, ChampionshipResults, RacePlace, RaceScore, Round,
} from '../../../../shared/types';
import { formatOf } from '../../../../shared/utils/event-format';
import { buildStandings } from '../../../../shared/utils/standings';

/**
 * What identifies a driver's row. A seat, except the player's seat raced by
 * the driver it names, which is a row of its own beside the player's.
 * @param row A standing or a place
 * @returns The row's key
 */
export const standingKey = (row: { seat: string; substitute?: boolean }): string => (
  row.substitute ? `${row.seat}:substitute` : row.seat
);

/**
 * The races a round's event runs, by their place in it.
 * @param series The championship
 * @param round The round
 * @returns Each race's launch index and its name, in the order they run
 */
export const raceSessionsOf = (
  series: Championship,
  round: Round,
): Pick<RaceColumn, 'launch' | 'name'>[] => {
  return (formatOf(series, round)?.sessions ?? []).flatMap((session, launch) => (
    session.type === 'race' ? [{ launch, name: session.name ?? null }] : []
  ));
};

/**
 * Every round of a season as columns: its races, and what each paid so far.
 * @param results The season
 * @returns One per round, in calendar order
 */
export const roundColumns = (results: ChampionshipResults): RoundColumn[] => (
  results.championship.rounds.map((round, at) => {
    const result = results.rounds.find((one) => one.round === round.id);
    const races = raceSessionsOf(results.championship, round).map((race) => ({
      ...race,
      score: result?.score?.races.find((one) => one.launch === race.launch) ?? null,
    }));

    return {
      round,
      number: at + 1,
      date: result?.date ?? '',
      status: result?.status ?? 'scheduled',
      races,
      scored: (result?.score?.races.length ?? 0) > 0,
    };
  })
);

/**
 * The place a row took in one race.
 * @param race The race, or null while it is to come
 * @param entry The class the row is in
 * @param key The row's key
 * @returns The place, or undefined when the row did not race it
 */
export const placeIn = (
  race: RaceScore | null,
  entry: string,
  key: string,
): RacePlace | undefined => race?.places.find((place) => (
  place.entry === entry && standingKey(place) === key
));

/**
 * What a team took from one race, all its cars together.
 * @param race The race, or null while it is to come
 * @param entry The class
 * @param team The team, by its id
 * @returns The points, or null when the race is still to come
 */
export const teamPointsIn = (race: RaceScore | null, entry: string, team: string): number | null => (
  race === null ? null : race.places
    .filter((place) => place.entry === entry && place.team === team)
    .reduce((sum, place) => sum + place.points, 0)
);

/**
 * A season's tables, as they stood after a given round.
 * @param results The season
 * @param upTo The last round to count, by its id; every round scored so far
 * when left out
 * @returns The rounds as columns, and every class's tables
 */
export const seasonResults = (results: ChampionshipResults, upTo?: string): SeasonResults => {
  const rounds = roundColumns(results);
  const cut = upTo === undefined ? rounds.length : rounds.findIndex((one) => one.round.id === upTo) + 1;
  const counted = rounds.slice(0, cut).filter((one) => one.scored);
  const scores = counted.flatMap((column) => {
    const score = results.rounds.find((one) => one.round === column.round.id)?.score;

    return score ? [score] : [];
  });

  const now = buildStandings(results.championship, scores, '');
  const before = scores.length > 1 ? buildStandings(results.championship, scores.slice(0, -1), '') : null;
  const places = scores.flatMap((score) => score.races.flatMap((race) => race.places));

  const classes = now.classes.map((table): ClassSeason => {
    const earlier = before?.classes.find((one) => one.entry === table.entry);
    const mine = table.entry === results.playerEntry;

    const drivers = table.drivers.map((row): DriverRow => {
      const key = standingKey(row);
      const own = places.filter((place) => place.entry === table.entry && standingKey(place) === key);
      const was = earlier?.drivers.find((one) => standingKey(one) === key);

      return {
        ...row,
        key,
        move: was ? was.position - row.position : null,
        player: mine && row.seat === results.playerSeat && !row.substitute,
        qualifyingPoints: own.reduce((sum, place) => sum + place.qualifyingPoints, 0),
        fastestLapPoints: own.reduce((sum, place) => sum + place.fastestLapPoints, 0),
        places: own,
      };
    });

    const teams = table.teams.map((row): TeamRow => {
      const was = earlier?.teams.find((one) => one.team === row.team);

      return {
        ...row,
        move: was ? was.position - row.position : null,
        player: drivers.some((driver) => driver.player && driver.team === row.team),
      };
    });

    return {
      entry: table.entry, name: table.name, drivers, teams,
    };
  });

  return { rounds, counted: scores.length, classes };
};

/**
 * The nation a team races under.
 * @param series The championship
 * @param team The team, by its id, or null for none
 * @returns The nation code, or undefined when the team names none
 */
export const teamNation = (series: Championship, team: string | null | undefined): string | undefined => (
  team ? series.teams?.find((one) => one.id === team)?.nationCode : undefined
);

/**
 * The nation a seat's driver races under: their own, or else their team's.
 * @param series The championship
 * @param seat The seat, by its id
 * @returns The nation code, or undefined when neither names one
 */
export const seatNation = (series: Championship, seat: string): string | undefined => {
  const held = series.entries.flatMap((entry) => entry.seats).find((one) => one.id === seat);

  return held?.driver?.nationCode ?? teamNation(series, held?.team);
};

/**
 * A team's display name.
 * @param series The championship
 * @param team The team, by its id, or null for none
 * @returns The name, or null when the seat names no team
 */
export const teamName = (series: Championship, team: string | null | undefined): string | null => (
  team ? series.teams?.find((one) => one.id === team)?.name ?? team : null
);

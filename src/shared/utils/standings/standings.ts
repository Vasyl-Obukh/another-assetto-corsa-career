// A season's tables, built from the rounds scored so far. Shared because main
// keeps the career's standings current and the renderer rebuilds them as they
// stood after any earlier round - which is what says how far a driver moved.
// The same goes for a season entry read as results: main answers career:results
// with it and the renderer reads an archive's championship through it.

import type {
  Championship,
  ChampionshipResults,
  ClassStandings,
  DriverStanding,
  RacePlace,
  RoundResult,
  RoundScore,
  SeasonEntry,
  SeasonEvent,
  SeasonStandings,
  TeamStanding,
} from '../../types/index.ts';

/**
 * How many places count as a podium.
 */
const PODIUM = 3;

/**
 * Orders a class's driver rows and numbers them.
 * @param rows The rows in any order
 * @param seatOrder Where each seat sits in the championship's own entry list
 * @returns The rows, best placed first, each carrying its position
 */
const placeDrivers = (
  rows: readonly Omit<DriverStanding, 'position'>[],
  seatOrder: ReadonlyMap<string, number>,
): DriverStanding[] => [...rows]
  // Points, then wins, then podiums, then the best finish anyone managed, with
  // the entry list's own order last so the sort is total. Deliberately no
  // countback by round: a season that really settles ties that way says so in
  // its own rules, and guessing is worse than a stable order.
  //
  // The best-finish term must stay ahead of the entry-list one. Two drivers who
  // have both scored nothing give Infinity - Infinity, and it is only because
  // NaN is falsy that the chain falls through to the order that settles it;
  // last in the chain it would be the answer, and the sort would not be total.
  // A seat's own row and its substitute's share the seat, so the substitute's
  // goes second on a full tie.
  .sort((left, right) => (
    right.points - left.points
    || right.wins - left.wins
    || right.podiums - left.podiums
    || (left.bestFinish ?? Infinity) - (right.bestFinish ?? Infinity)
    || (seatOrder.get(left.seat) ?? 0) - (seatOrder.get(right.seat) ?? 0)
    || Number(left.substitute ?? false) - Number(right.substitute ?? false)
  ))
  .map((row, at) => ({ ...row, position: at + 1 }));

/**
 * One driver's row, off the places they took.
 * @param own Their places, in any order
 * @returns Their totals, without a position
 */
const tally = (own: readonly RacePlace[]): Pick<
DriverStanding, 'points' | 'wins' | 'podiums' | 'bestFinish' | 'races'
> => {
  // A bonus-only place pays its points and is no race of theirs.
  const finishes = own.filter((place) => !place.bonusOnly).map((place) => place.classPosition);

  return {
    points: own.reduce((sum, place) => sum + place.points, 0),
    wins: finishes.filter((position) => position === 1).length,
    podiums: finishes.filter((position) => position <= PODIUM).length,
    bestFinish: finishes.length ? Math.min(...finishes) : null,
    races: finishes.length,
  };
};

/**
 * Builds a season's tables from the rounds scored so far.
 *
 * Every seat of every class starts in its table on nothing, so a table is the
 * field rather than only the drivers who have scored: a championship shows who
 * is in it from the first round, and a driver on zero is a fact about them
 * rather than an absence.
 * Every row carries the name the championship's own document gives that seat,
 * the player's included. Which seat is the player's, and what to call them, is
 * the career's and settings' to say where the table is shown - so renaming
 * yourself renames every table rather than the ones written after it.
 *
 * The one exception is the player's seat raced without them. Those places are
 * marked `substitute`, and the driver the seat names gets a row of their own
 * for them - the seat's own row is the player's and counts only what they drove.
 * @param series The championship
 * @param scores Every round of it scored so far, in any order
 * @param updatedAt When this was built, as an ISO timestamp
 * @returns One table per class entry
 */
export const buildStandings = (
  series: Championship,
  scores: readonly RoundScore[],
  updatedAt: string,
): SeasonStandings => {
  const teamName = new Map((series.teams ?? []).map((team) => [team.id, team.name]));
  const places = scores.flatMap((score) => score.races.flatMap((race) => race.places));

  const classes = series.entries.map((entry): ClassStandings => {
    const seatOrder = new Map(entry.seats.map((seat, at) => [seat.id, at]));

    const drivers = entry.seats.flatMap((seat) => {
      const ofSeat = places.filter((place) => place.entry === entry.id && place.seat === seat.id);
      const own = ofSeat.filter((place) => !place.substitute);
      const stood = ofSeat.filter((place) => place.substitute);
      const base = {
        seat: seat.id,
        driver: seat.driver?.name ?? '',
        team: seat.team ?? null,
      };
      const row = { ...base, ...tally(own) };

      return stood.length === 0 ? [row] : [row, { ...base, ...tally(stood), substitute: true }];
    });

    const placed = placeDrivers(drivers, seatOrder);
    const teamIds = [...new Set(placed.map((row) => row.team).filter((id) => id !== null))];

    const teams = teamIds
      .map((id): Omit<TeamStanding, 'position'> => {
        const own = placed.filter((row) => row.team === id);

        return {
          team: id,
          name: teamName.get(id) ?? id,
          points: own.reduce((sum, row) => sum + row.points, 0),
          wins: own.reduce((sum, row) => sum + row.wins, 0),
        };
      })
      .sort((left, right) => right.points - left.points || right.wins - left.wins)
      .map((row, at) => ({ ...row, position: at + 1 }));

    return {
      entry: entry.id, name: entry.name, drivers: placed, teams,
    };
  });

  return { classes, updatedAt };
};

/**
 * One dated round as the results screens read it.
 * @param event The round
 * @returns What it left, a score of null while nothing of it has run
 */
export const roundResult = (event: SeasonEvent): RoundResult => ({
  round: event.round,
  date: event.date,
  status: event.status,
  score: event.score ?? null,
  sessions: event.sessions,
});

/**
 * A season entry as the results screens read a championship.
 * @param entry The career's season in the championship
 * @returns Its rounds and what each left
 */
export const entryResults = (entry: SeasonEntry): ChampionshipResults => ({
  championship: entry.championship,
  rounds: entry.events.map(roundResult),
  playerSeat: entry.playerSeat,
  playerEntry: entry.entry,
});

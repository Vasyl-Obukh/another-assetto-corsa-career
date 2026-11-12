import type {
  Career, ClassEntry, DriverStanding, MailDriver, SeasonEntry, SeasonStandings, Team,
} from '../../shared/types/index.ts';
import { bestLapTimes, lastSessionOf } from '../event/index.ts';
import type { LaunchResult } from '../season-scoring/index.ts';

/**
 * Each car's best valid lap in one session, in event-grid order - mapped back
 * through the launch's own [CAR_n] order, which a knockout segment makes
 * shorter than the event's.
 * @param result What the launch wrote, or undefined when nothing was archived
 * @param gridOrder The [CAR_n] order the launch ran with, as event-grid indices
 * @param size How many cars the event fields
 * @param type Assetto Corsa's number for the session's kind
 * @returns One time in milliseconds per event-grid car, or null
 */
export const lapTimes = (
  result: LaunchResult | undefined,
  gridOrder: readonly number[],
  size: number,
  type: number,
): (number | null)[] => {
  const times: (number | null)[] = Array.from({ length: size }, () => null);
  const session = result ? lastSessionOf(result.raceOut, type) : null;
  if (!session) return times;

  bestLapTimes(session, gridOrder.length).forEach((time, at) => {
    const car = gridOrder[at];
    if (car !== undefined) times[car] = time;
  });

  return times;
};

/**
 * Which season of a career a day falls in.
 * @param career The career
 * @param date The ISO date
 * @returns The season's index - the last one's for a day past every season
 */
export const seasonAt = (career: Career, date: string): number => (
  career.seasons.find((season) => season.startDate <= date && date <= season.endDate)?.index
  ?? career.seasons.at(-1)?.index
  ?? 0
);

/**
 * The class a season's entry raced in.
 * @param entry The season's entry
 * @returns The class entry, or null when its copy has none by that id
 */
export const classOf = (entry: Pick<SeasonEntry, 'championship' | 'entry'>): ClassEntry | null => (
  entry.championship.entries.find((one) => one.id === entry.entry) ?? null
);

/**
 * The team the player races for in an entry: the contract's, or else the one
 * fielding their seat.
 * @param entry The season's entry
 * @returns The team, or null where neither names one
 */
export const teamOf = (entry: Pick<SeasonEntry, 'championship' | 'entry' | 'playerSeat' | 'contract'>): Team | null => {
  const team = entry.contract?.team ?? classOf(entry)?.seats.find((seat) => seat.id === entry.playerSeat)?.team;

  return (team ? entry.championship.teams?.find((one) => one.id === team) : undefined) ?? null;
};

/**
 * A round's name in an entry's copy of its championship.
 * @param entry The season's entry
 * @param round The round's id
 * @returns Its name, or the id where the copy has no such round
 */
export const roundName = (entry: Pick<SeasonEntry, 'championship'>, round: string): string => (
  entry.championship.rounds.find((one) => one.id === round)?.name ?? round
);

/**
 * A seat's driver as a mail names them.
 * @param entry The season's entry
 * @param seat The seat's id
 * @returns Their name and nation - their team's where the seat says none
 */
export const driverOf = (entry: Pick<SeasonEntry, 'championship' | 'entry'>, seat: string): MailDriver | null => {
  const found = classOf(entry)?.seats.find((one) => one.id === seat);
  if (!found?.driver?.name) return null;
  const nation = found.driver.nationCode
    ?? entry.championship.teams?.find((team) => team.id === found.team)?.nationCode;

  return { name: found.driver.name, ...(nation === undefined ? {} : { nation }) };
};

/**
 * A seat's own row of a class's table - a reserve driver's left out.
 * @param standings The standings
 * @param entry The class entry's id
 * @param seat The seat's id
 * @returns The row, or undefined when it has raced nothing
 */
export const rowOf = (standings: SeasonStandings, entry: string, seat: string): DriverStanding | undefined => (
  standings.classes.find((one) => one.entry === entry)?.drivers
    .find((row) => row.seat === seat && !row.substitute && row.races > 0)
);

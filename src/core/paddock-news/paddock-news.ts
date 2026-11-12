// What a career's paddock tells it: an engineer's debrief after every round
// driven, a team's word as a contract runs, a championship's result as an
// edition ends, the categorisation panel as a rung moves, and the market as a
// season opens.
//
// Pure. A debrief is built where a round lands, since only then are the lap
// times to hand; everything else is read off the career as it stands, keyed so
// it is sent once, and only for what happened from the day news starts.

import {
  BOSS_ROLE, HALFWAY_MIN_ROUNDS, LIVE_SEASONS, MARKET_SEATS, RESULT_ROWS,
} from './constants.ts';
import type { DebriefRequest, TeamPeople } from './types.ts';
import {
  classOf, driverOf, lapTimes, roundName, rowOf, seasonAt, teamOf,
} from './utils.ts';
import { TeamBudget } from '../../shared/types/index.ts';
import type {
  Career,
  CareerSeason,
  Championship,
  Contract,
  Debrief,
  DebriefSession,
  KeepStanding,
  LedgerLine,
  Mail,
  MailRun,
  MarketSeat,
  NoticeKind,
  Paddocker,
  PaddockRole,
  ResultRow,
  SeasonEntry,
  Team,
  TeamNotice,
} from '../../shared/types/index.ts';
import { activeContract, keepStanding } from '../../shared/utils/contracts/index.ts';
import { drawName } from '../../shared/utils/driver-names/index.ts';
import { editionOver, editionsOf } from '../../shared/utils/editions/index.ts';
import { isHistoric } from '../../shared/utils/historic/index.ts';
import { buildStandings, playerPlace, teammateSeat } from '../../shared/utils/standings/index.ts';
import { startingGrid } from '../event/index.ts';
import { SESSION_TYPE } from '../race-ini/index.ts';
import { randomFrom, seedFrom } from '../seeded-random/index.ts';

/**
 * One person of a team, drawn off the name books.
 *
 * Seeded on the role, the team, the championship and the career, the role and
 * team leading since `seedFrom` is a running hash - so a team keeps the same
 * engineer and boss season after season, and two careers meet different ones.
 * @param salt The career's id
 * @param championship The championship the team races in
 * @param team The team, or null where the seat names none
 * @param role What they are to the player
 * @returns Who they are
 */
export const paddocker = (
  salt: string,
  championship: Pick<Championship, 'id'>,
  team: Team | null,
  role: PaddockRole,
): Paddocker => {
  const drawn = drawName(team?.nationCode, randomFrom(seedFrom(`${role}:${team?.id ?? ''}:${championship.id}:${salt}`)));

  return {
    role, name: drawn.name, nation: drawn.nation, ...(team ? { teamName: team.name } : {}),
  };
};

/**
 * The engineer and the boss of the team the player races for in an entry -
 * under contract, the team drawn for them on their own, or the team whose seat
 * a historic event gives them.
 * @param salt The career's id
 * @param entry The season's entry
 * @returns The team and its people
 */
export const teamPeople = (
  salt: string,
  entry: Pick<SeasonEntry, 'championship' | 'entry' | 'playerSeat' | 'contract'>,
): TeamPeople => {
  const team = teamOf(entry);

  return {
    team,
    engineer: paddocker(salt, entry.championship, team, 'engineer'),
    boss: paddocker(salt, entry.championship, team, BOSS_ROLE[team?.budget ?? TeamBudget.INDEPENDENT]),
  };
};

/**
 * The run an entry is, as a mail names it.
 * @param entry The season's entry
 * @param season Which season it is in
 * @returns The run, its names copied in
 */
const runOf = (entry: SeasonEntry, season: number): MailRun => ({
  series: entry.series,
  seriesName: entry.championship.name,
  season,
  edition: entry.edition,
  editions: editionsOf(entry.championship),
});

/**
 * Writes the debrief of a round the player drove: each qualifying and race of
 * it, where they started and finished in the class, their best lap and how far
 * it was off the class's best, where the teammate finished and what each race
 * paid in points - then the class's table after it and the next round.
 * @param request The round, as recorded, and what it is read from
 * @returns The debrief, or null when the player drove no qualifying or race
 */
export const debriefOf = ({
  season, entry, event, plan, results,
}: DebriefRequest): Debrief | null => {
  const size = plan.grid.length;
  const state = { raceId: plan.raceId, launchCount: plan.launches.length, completed: [...event.sessions] };
  const mate = teammateSeat(entry);
  const mateCar = mate ? plan.grid.findIndex((row) => row.seat === mate.id) : -1;
  const inClass = (car: number): boolean => plan.grid[car]?.entry === entry.entry;
  const classCars = plan.grid.flatMap((row, car) => (inClass(car) ? [car] : []));

  const sessions = plan.launches.flatMap((launch): DebriefSession[] => {
    const { type } = launch.session;
    if (type !== 'qualify' && type !== 'race') return [];
    const record = event.sessions.find((one) => one.index === launch.index);
    // A knockout segment the player was out of was never theirs to drive.
    if (!record?.classification || record.skipped) return [];

    const order = record.classification.filter(inClass);
    const placeOf = (car: number): number | null => (order.includes(car) ? order.indexOf(car) + 1 : null);
    const result = results.find((one) => one.launch === launch.index);
    const times = lapTimes(result, record.gridOrder, size, SESSION_TYPE[type]);
    // The player is always the event grid's first car.
    const best = times[0] ?? null;
    const classBest = classCars.reduce<number | null>((low, car) => {
      const time = times[car];

      return time == null || (low !== null && low <= time) ? low : time;
    }, null);

    const started = startingGrid(plan, state, launch.index)?.order.filter(inClass);
    const grid = started?.includes(0) ? started.indexOf(0) + 1 : null;
    const scored = event.score?.races.find((one) => one.launch === launch.index);

    return [{
      index: launch.index,
      type,
      name: launch.session.name ?? null,
      grid,
      place: placeOf(0),
      of: classCars.length,
      best,
      gap: best === null || classBest === null ? null : best - classBest,
      mate: mateCar < 0 ? null : placeOf(mateCar),
      ...(type === 'race' ? { points: (scored ? playerPlace(entry, scored)?.points : undefined) ?? 0 } : {}),
    }];
  });
  if (sessions.length === 0) return null;

  const at = entry.events.findIndex((one) => one.raceId === event.raceId);
  const next = entry.events.slice(at + 1).find((one) => one.status === 'scheduled');
  const before = buildStandings(
    entry.championship,
    entry.events.flatMap((one) => (one.raceId !== event.raceId && one.score ? [one.score] : [])),
    '',
  );
  const standingOf = (seat: string) => {
    const now = rowOf(entry.standings, entry.entry, seat);
    const was = rowOf(before, entry.entry, seat);

    return { place: now?.position ?? null, was: was?.position ?? null, points: now?.points ?? 0 };
  };
  const mateDriver = mate ? driverOf(entry, mate.id) : null;

  return {
    ...runOf(entry, season),
    raceId: event.raceId,
    round: event.round,
    roundName: roundName(entry, event.round),
    number: at + 1,
    rounds: entry.events.length,
    entryName: classOf(entry)?.name ?? entry.entry,
    car: entry.car.model,
    ...(isHistoric(entry) ? { historic: true as const } : {}),
    sessions,
    standing: standingOf(entry.playerSeat),
    ...(mate && mateDriver ? { mate: { ...mateDriver, ...standingOf(mate.id) } } : {}),
    ...(next ? { next: { name: roundName(entry, next.round), date: next.date } } : {}),
  };
};

/**
 * The mail a round's debrief is sent in, from the engineer of the team the
 * player raced for.
 * @param salt The career's id
 * @param entry The season's entry
 * @param debrief The debrief
 * @param arrived The day it arrives, as an ISO date
 * @param season Which season it arrives in
 * @returns The mail
 */
export const debriefMail = (
  salt: string,
  entry: SeasonEntry,
  debrief: Debrief,
  arrived: string,
  season: number,
): Mail => ({
  id: `debrief:${debrief.raceId}`,
  kind: 'debrief',
  season,
  arrived,
  opened: false,
  from: teamPeople(salt, entry).engineer,
  debrief,
});

/**
 * What team news says of the contract an entry is raced under: the run, the
 * team, the class, the place that keeps the player on and where they stand.
 * @param entry The season's entry, which must hold a contract
 * @param season Which season the contract runs in
 * @param standing Where the player and their teammate stand
 * @returns The notice, of no kind - a team not keeping the player on
 */
export const teamNotice = (
  entry: SeasonEntry & { contract: Contract },
  season: number,
  standing: KeepStanding,
): TeamNotice => {
  const { contract } = entry;

  return {
    ...runOf(entry, season),
    team: contract.team,
    teamName: contract.teamName,
    ...(contract.nation === undefined ? {} : { nation: contract.nation }),
    entryName: classOf(entry)?.name ?? entry.entry,
    keep: contract.keep ?? standing.size,
    standing,
  };
};

/**
 * Every word from a contract's team that is due: a welcome as it is signed, a
 * halfway word where a place keeps the player on, and each round missed with
 * its fine.
 * @param career The career
 * @param season The season the entry is in
 * @param entry The season's entry
 * @param from The day news starts from
 * @param ledger Every line of the career's ledger, by key
 * @returns The mail, whether or not it has been sent already
 */
const teamNews = (
  career: Career,
  season: CareerSeason,
  entry: SeasonEntry,
  from: string,
  ledger: ReadonlyMap<string, LedgerLine>,
): Mail[] => {
  const { contract } = entry;
  if (!contract || isHistoric(entry)) return [];

  const run = runOf(entry, season.index);
  const { boss, engineer } = teamPeople(career.id, entry);
  const base = teamNotice({ ...entry, contract }, season.index, keepStanding(entry));
  const mate = teammateSeat(entry);
  const mateDriver = mate ? driverOf(entry, mate.id) : null;
  const notice = (
    kind: NoticeKind,
    id: string,
    arrived: string,
    said: Partial<TeamNotice>,
  ): Mail => ({
    id: `${kind}:${id}`,
    kind: 'notice',
    season: seasonAt(career, arrived),
    arrived,
    opened: false,
    from: boss,
    notice: { ...base, kind, ...said },
  });
  const runId = `${run.series}:${run.season}.${run.edition}`;
  const mails: Mail[] = [];

  if (contract.signed >= from) {
    const [opener] = entry.events;
    mails.push(notice('welcome', runId, contract.signed, {
      car: contract.car,
      engineer,
      ...(mateDriver ? { mate: mateDriver } : {}),
      ...(opener ? { opener: { name: roundName(entry, opener.round), date: opener.date } } : {}),
      ...(contract.renews ? { renewal: true as const } : {}),
    }));
  }

  // Halfway, once, where a place is asked and the contract still runs.
  const of = entry.events.length;
  const half = Math.ceil(of / 2);
  const done = entry.events.filter((event) => event.status !== 'scheduled').length;
  const turn = entry.events[half - 1];
  if (
    contract.keep !== undefined && activeContract(entry) && !entry.withdrawn
    && of >= HALFWAY_MIN_ROUNDS && done >= half && done < of && turn && turn.date >= from
    && turn.date >= contract.signed
  ) {
    mails.push(notice('halfway', runId, turn.date, {
      rounds: { done: half, of },
      ...(mateDriver ? { mate: mateDriver } : {}),
    }));
  }

  entry.events.forEach((event, at) => {
    const fine = ledger.get(`fine:${event.raceId}`);
    if (!fine || fine.date < from) return;
    mails.push(notice('missed', event.raceId, fine.date, {
      round: {
        raceId: event.raceId,
        name: roundName(entry, event.round),
        number: at + 1,
      },
      fine: -fine.amount,
      places: (event.score?.races ?? []).map((race) => race.places.find((place) => (
        place.entry === entry.entry && place.seat === entry.playerSeat && place.substitute && !place.bonusOnly
      ))?.classPosition ?? null),
    }));
  });

  return mails;
};

/**
 * An edition's result, once it has run its course: from the team's boss under
 * contract, from the championship's organisers on the player's own.
 * @param career The career
 * @param season The season the entry is in
 * @param entry The season's entry
 * @param from The day news starts from
 * @param ledger Every line of the career's ledger, by key
 * @returns The mail, or null while the edition runs or for one not sent
 */
const resultMail = (
  career: Career,
  season: CareerSeason,
  entry: SeasonEntry,
  from: string,
  ledger: ReadonlyMap<string, LedgerLine>,
): Mail | null => {
  if (isHistoric(entry) || entry.withdrawn || entry.events.length === 0 || !editionOver(entry, career.date)) {
    return null;
  }

  const run = runOf(entry, season.index);
  const key = `${season.index}:${entry.series}:${entry.edition}`;
  const paid = ledger.get(`standings:${key}`);
  const bonus = ledger.get(`bonus:${key}`);
  const arrived = paid?.date ?? entry.events[entry.events.length - 1].date;
  if (arrived < from) return null;

  const table = entry.standings.classes.find((one) => one.entry === entry.entry);
  const drivers = table?.drivers.filter((row) => !row.substitute) ?? [];
  const teamName = (id: string | null): string | undefined => (
    entry.championship.teams?.find((team) => team.id === id)?.name
  );
  const asRow = (row: (typeof drivers)[number]): ResultRow => {
    const driver = driverOf(entry, row.seat);
    // The player races for the team their contract is with.
    const team = row.seat === entry.playerSeat && entry.contract ? entry.contract.teamName : teamName(row.team);

    return {
      position: row.position,
      name: driver?.name ?? row.driver,
      ...(driver?.nation === undefined ? {} : { nation: driver.nation }),
      ...(team === undefined ? {} : { team }),
      points: row.points,
      ...(row.seat === entry.playerSeat ? { player: true as const } : {}),
    };
  };
  const own = rowOf(entry.standings, entry.entry, entry.playerSeat);
  const top = drivers.slice(0, RESULT_ROWS);
  const listed = own && !top.some((row) => row.seat === own.seat) ? [...top, own] : top;
  const mate = teammateSeat(entry);
  const mateRow = mate ? rowOf(entry.standings, entry.entry, mate.id) : undefined;
  const mateDriver = mate ? driverOf(entry, mate.id) : null;
  const people = teamPeople(career.id, entry);
  const teamRow = people.team ? table?.teams.find((one) => one.team === people.team?.id) : undefined;

  return {
    id: `results:${run.series}:${run.season}.${run.edition}`,
    kind: 'results',
    season: seasonAt(career, arrived),
    arrived,
    opened: false,
    from: entry.contract ? people.boss : { role: 'organisers', name: run.seriesName },
    results: {
      ...run,
      entryName: classOf(entry)?.name ?? entry.entry,
      place: own?.position ?? null,
      of: classOf(entry)?.seats.length ?? drivers.length,
      points: own?.points ?? 0,
      wins: own?.wins ?? 0,
      podiums: own?.podiums ?? 0,
      ...(mateDriver ? {
        mate: { ...mateDriver, place: mateRow?.position ?? null, points: mateRow?.points ?? 0 },
      } : {}),
      ...(entry.contract && people.team ? {
        team: { name: people.team.name, place: teamRow?.position ?? null, of: table?.teams.length ?? 0 },
      } : {}),
      top: listed.map(asRow),
      paid: paid?.amount ?? 0,
      ...(paid?.share ? { purse: paid.share.purse } : {}),
      ...(bonus ? { bonus: bonus.amount } : {}),
    },
  };
};

/**
 * Every rung opened, and every rung lost as a season closed, as the
 * categorisation panel writes it.
 * @param career The career
 * @param from The day news starts from
 * @returns The mail, whether or not it has been sent already
 */
const rungNews = (career: Career, from: string): Mail[] => career.ratingLog.flatMap((line): Mail[] => {
  if ((line.kind !== 'promotion' && line.kind !== 'drop') || line.date < from) return [];
  if (!line.discipline || line.tier === undefined || line.rating === undefined) return [];

  return [{
    id: `rung:${line.key}`,
    kind: 'rung',
    season: line.season,
    arrived: line.date,
    opened: false,
    from: { role: 'categorisation' },
    rung: {
      discipline: line.discipline, tier: line.tier, rating: line.rating, dir: line.kind === 'promotion' ? 'up' : 'down',
    },
  }];
});

/**
 * Everything the paddock has to say that the career's state alone decides:
 * team news, championships' results and rungs moved.
 *
 * Read off the whole career every time and keyed by what each is about, so
 * handing the inbox the same mail again sends nothing twice. Nothing before
 * the day news starts, and nothing at all outside a career.
 * @param career The career
 * @returns The mail, whether or not it has been sent already
 */
export const paddockNews = (career: Career): Mail[] => {
  const from = career.newsFrom;
  if (career.kind !== 'career' || from === undefined) return [];
  const ledger = new Map(career.ledger.map((line) => [line.key, line]));

  return [
    ...career.seasons.slice(-LIVE_SEASONS).flatMap((season) => season.entries.flatMap((entry) => {
      const result = resultMail(career, season, entry, from, ledger);

      return [...teamNews(career, season, entry, from, ledger), ...(result ? [result] : [])];
    })),
    ...rungNews(career, from),
  ];
};

/**
 * A season's market news: the seats privateers are selling on the player's
 * rungs, the cheapest first.
 * @param season The season
 * @param seats Every seat for sale
 * @param arrived The day it arrives, as an ISO date
 * @returns The mail, or null with no seat to sell
 */
export const marketMail = (season: CareerSeason, seats: readonly MarketSeat[], arrived: string): Mail | null => (
  seats.length === 0 ? null : {
    id: `market:${season.index}`,
    kind: 'market',
    season: season.index,
    arrived,
    opened: false,
    from: { role: 'paddock' },
    market: { seats: [...seats].sort((left, right) => left.price - right.price).slice(0, MARKET_SEATS) },
  }
);

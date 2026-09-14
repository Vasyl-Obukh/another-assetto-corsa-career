import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { scanContent } from '../../core/content/index.ts';
import { resolvePaths } from '../../core/paths/index.ts';
import { buildRaceIni } from '../../core/race-ini/index.ts';
import { eligibleCars, roundRace, seriesAvailability } from '../../core/series/index.ts';
import { loadSeriesLibrary, seriesById } from '../../core/series-library/index.ts';
import { planWeekend } from '../../core/weekend/index.ts';
import { AppError } from '../../shared/errors/index.ts';
import type {
  Championship, Content, SeriesAvailability, SessionDefinition,
} from '../../shared/types/index.ts';
import { SHIPPED_CATALOGUE } from '../../shared/utils/car-classes/index.ts';
import { OUT_DIR } from '../constants.ts';
import { describeProblems } from '../utils.ts';

/**
 * How long a session runs, in whichever unit it was written in.
 * @param session The session to measure
 * @returns Its length as a printable string
 */
const sessionLength = (session: SessionDefinition): string => (
  session.laps ? `${session.laps} laps` : `${session.minutes ?? 0} min`
);

/**
 * Prints one championship's headline and availability.
 * @param series The championship
 * @param availability What it needs and whether the install has it
 */
const printSeries = (series: Championship, availability: SeriesAvailability): void => {
  const badge = availability.available ? 'available' : 'UNAVAILABLE';
  console.log(`\n${series.name}  (${series.id})  [${badge}]`);

  describeProblems([...availability.problems]).forEach((problem) => {
    console.log(`  ! ${problem}`);
  });
};

/**
 * Prints a championship's class entries, calendar and what it is missing.
 * @param series The championship
 * @param availability What it needs and whether the install has it
 * @param content Installed content, for naming the tracks it does have
 */
const printDetail = (
  series: Championship,
  availability: SeriesAvailability,
  content: Content,
): void => {
  console.log(`  Requires  ${availability.requires.sources.join(', ')}`
    + (availability.requires.packs.length ? ` + ${availability.requires.packs.join(', ')}` : '')
    + (availability.requires.makers.length ? ` + ${availability.requires.makers.join(', ')}` : ''));

  const teams = new Map((series.teams ?? []).map((one) => [one.id, one]));

  series.entries.forEach((entry) => {
    const state = availability.entries.find((one) => one.entry === entry.id);
    const rule = entry.eligibility.kind === 'spec' ? entry.eligibility.spec : 'named cars';
    console.log(`\n  ${entry.name}  tier ${entry.ladder.tier} ${entry.ladder.discipline}`
      + `  ${entry.seats.length} cars  (${rule})`);
    state?.eligible.forEach((eligible) => console.log(`    + ${eligible}`));
    state?.missing.forEach((missing) => {
      const from = missing.provenance.pack ?? missing.provenance.maker ?? missing.provenance.source;
      console.log(`    - ${missing.id}  (${from})`);
    });

    // The entry list is what npm run series is for as much as the calendar is:
    // a seat pinned to a team nobody fields is a validation problem, and a
    // driver that reads oddly is only ever visible here.
    entry.seats.forEach((one, at) => {
      const driver = one.driver?.name ?? '(unnamed)';
      const fielded = teams.get(one.team ?? '')?.name ?? one.team ?? '';
      const level = one.aiLevel ? `  AI ${one.aiLevel}` : '';
      console.log(`    ${String(at + 1).padStart(2)}  ${driver.padEnd(22)} ${fielded}${level}`);
    });
  });

  console.log('\n  Weekend formats');
  series.weekendFormats.forEach((format) => {
    const badge = format.id === series.defaultWeekendFormat ? '  (default)' : '';
    console.log(`\n    ${format.name}  (${format.id})${badge}`);
    format.sessions.forEach((session) => {
      const name = (session.name ?? session.type).padEnd(14);
      const points = session.pointsSystem ? `  pays ${session.pointsSystem}` : '';
      const link = session.inherit
        ? `  ${session.inherit.top ? `top ${session.inherit.top} of` : 'grid from'} ${session.inherit.from}`
        : '';
      console.log(`      day ${session.day ?? 0}  ${name} ${sessionLength(session)}${link}${points}`);
    });
  });

  console.log('\n  Points systems');
  series.pointsSystems.forEach((points) => {
    const badge = points.id === series.defaultPointsSystem ? '  (default)' : '';
    const extras = [
      points.qualifying?.length ? `qualifying ${points.qualifying.join('-')}` : '',
      points.fastestLap ? `fastest lap ${points.fastestLap}` : '',
    ].filter(Boolean).join(', ');
    console.log(`    ${points.name.padEnd(16)} (${points.id})${badge}`);
    console.log(`      ${points.positions.join('-')}${extras ? `  +${extras}` : ''}`);
  });

  if (series.entryFee !== undefined || series.prizes) {
    console.log('\n  Money');
    if (series.entryFee !== undefined) console.log(`    Entry fee      ${series.entryFee}`);
    const { positions, standings } = series.prizes ?? {};
    if (positions) console.log(`    Round prizes   ${positions.join('-')}`);
    if (standings) console.log(`    Season prizes  ${standings.join('-')}`);
  }

  console.log('\n  Calendar');
  series.rounds.forEach((round, index) => {
    const state = availability.rounds.find((one) => one.round === round.id);
    const key = round.track.layout ? `${round.track.id}/${round.track.layout}` : round.track.id;
    const track = content.tracks.find((layout) => layout.key === key);
    const note = state?.track
      ? '  MISSING'
      : (state?.pitboxes ? `  NEEDS ${state.pitboxes.needed} PIT BOXES, HAS ${state.pitboxes.available}` : '');
    // Only a round running something other than the default names its format:
    // the same word down every row would say nothing.
    const format = round.weekendFormat ? `  [${round.weekendFormat}]` : '';
    const fee = round.entryFee !== undefined ? `  fee ${round.entryFee}` : '';
    console.log(`    ${String(index + 1).padStart(2)}  ${round.name.padEnd(22)} ${key.padEnd(38)} ${track?.name ?? ''}${note}${format}${fee}`);
  });
};

/**
 * Picks a car for the player when the command line named none.
 * @param series The championship
 * @param entry Which class entry to race in
 * @param round Which round to race
 * @param content Installed content
 * @returns The first eligible installed car
 * @throws When the class entry can field nothing at that round
 */
const firstEligible = (
  series: Championship,
  entry: string,
  round: string,
  content: Content,
): string => {
  const target = series.entries.find((one) => one.id === entry);
  if (!target) throw new AppError('series.entry.notFound', { series: series.id, entry });

  const override = series.rounds
    .find((one) => one.id === round)?.eligibility
    ?.find((one) => one.entry === entry)?.eligibility;
  const cars = eligibleCars(override ?? target.eligibility, content, SHIPPED_CATALOGUE);
  if (cars.length === 0) throw new AppError('series.entry.noCars', { entry });

  return cars[0].id;
};

/**
 * Prints the shipped championships and whether the install can race them.
 *
 * The core's regression harness for series: a wrong track layout folder name or
 * a car ID typed wrong shows up here rather than at launch, and it needs no
 * Electron to say so.
 * @param args Command arguments - a series id, then a class entry, a round and a car
 * @returns Resolves once everything has been printed
 * @throws When a named series, entry, round or car cannot be raced
 */
export const cmdSeries = async (args: string[]): Promise<void> => {
  const paths = await resolvePaths();
  const content = await scanContent(paths.content);

  // No user directory: the CLI runs outside Electron and has no user data
  // folder to point at, so it sees the shipped half alone. That is what makes
  // it the regression harness for the shipped championships specifically.
  const library = await loadSeriesLibrary();

  const [id, entry, round, car] = args;
  if (!id) {
    library.series.forEach((held) => {
      printSeries(held.series, seriesAvailability(held.series, content));
    });

    return;
  }

  const held = seriesById(library, id);
  if (!held) throw new AppError('series.notFound', { series: id });

  const { series } = held;
  const availability = seriesAvailability(series, content);
  printSeries(series, availability);
  printDetail(series, availability, content);

  if (!entry || !round) return;

  const model = car ?? firstEligible(series, entry, round, content);
  const race = roundRace({
    series, entry, round, car: { model },
  }, content);
  // The whole round as one INI is not what runs - the app plans one launch
  // per session - so the plan is printed beside it rather than left implied.
  const plan = planWeekend(race, content);
  const raceIni = buildRaceIni(plan.launches[0].race, content);

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, 'race.ini'), raceIni);

  console.log(`\n  ${race.name}`);
  console.log(`  Player   ${model}`);
  console.log(`  Grid     ${race.grid?.size} cars`);
  race.grid?.opponents?.forEach((opponent, index) => {
    const bop = opponent.ballast || opponent.restrictor
      ? `  ballast ${opponent.ballast}kg  restrictor ${opponent.restrictor}%`
      : '';
    console.log(`    ${String(index + 2).padStart(2)}  ${(opponent.model ?? '').padEnd(30)} AI ${opponent.aiLevel}%${bop}`);
  });
  console.log(`
  Launches  ${plan.launches.length}, one per session`);
  plan.launches.forEach((launch) => {
    const name = (launch.session.name ?? launch.session.type).padEnd(12);
    console.log(`    ${launch.index + 1}  day ${launch.day}  ${name} ${sessionLength(launch.session)}`);
  });
  console.log(`
  Wrote out/race.ini for launch 1 (${raceIni.length} bytes)
`);
};

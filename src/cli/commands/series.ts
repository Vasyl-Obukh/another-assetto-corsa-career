import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { scanContent } from '../../core/content/index.ts';
import { planEvent } from '../../core/event/index.ts';
import { resolvePaths } from '../../core/paths/index.ts';
import { buildRaceIni } from '../../core/race-ini/index.ts';
import {
  eligibleCars, roundRace, seriesAvailability, seriesForecast,
} from '../../core/series/index.ts';
import { loadSeriesLibrary, seriesById } from '../../core/series-library/index.ts';
import { readWeatherFx } from '../../core/weather/index.ts';
import { defaultWeatherOffer } from '../../core/weather-forecast/index.ts';
import { WeatherType } from '../../shared/constants/index.ts';
import { AppError } from '../../shared/errors/index.ts';
import { ContentSource } from '../../shared/types/index.ts';
import type {
  Championship,
  Content,
  RoundForecast,
  SeriesAvailability,
  SessionDefinition,
  WeatherOffer,
} from '../../shared/types/index.ts';
import { SHIPPED_CATALOGUE } from '../../shared/utils/car-classes/index.ts';
import { trackKeyOf, withRecommendedTracks } from '../../shared/utils/recommended-tracks/index.ts';
import { OUT_DIR } from '../constants.ts';
import { describeProblems } from '../utils.ts';

/**
 * How long a session runs, in whichever unit it was written in.
 * @param session The session to measure
 * @returns Its length as a printable string
 */
const sessionLength = (session: SessionDefinition & { distance?: number }): string => {
  if (session.distance) return `${session.distance} km`;

  return session.laps ? `${session.laps} laps` : `${session.minutes ?? 0} min`;
};

/**
 * Names a weather type the way a forecast line reads it.
 * @param type The type
 * @returns Its enum name in lower case, "light rain" for LIGHT_RAIN
 */
const weatherName = (type: WeatherType): string => WeatherType[type].toLowerCase().replaceAll('_', ' ');

/**
 * Renders a round's forecast as one line per day.
 *
 * Printed under the calendar so a spread across rounds can be read at a glance,
 * which is also how a seed that fails to vary between rounds would show.
 * @param forecast The round's forecast
 * @returns The lines, without indentation
 */
const forecastLines = (forecast: RoundForecast): string[] => {
  const days = new Map<number, string[]>();

  forecast.sessions.forEach((session) => {
    const empty = session.generated ? '(nothing on offer)' : '(preset)';
    const weather = session.steps.length === 0
      ? empty
      : session.steps.map((step) => weatherName(step.weather)).join(' -> ');
    const authored = session.generated ? '' : ' (authored)';
    const line = `${session.name ?? session.type} ${weather}${authored} ${session.ambient}C`;
    days.set(session.day, [...(days.get(session.day) ?? []), line]);
  });

  return [...days].map(([day, sessions]) => `day ${day}  ${sessions.join(' | ')}`);
};

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
 * @param offer What generated weather may be drawn over
 */
const printDetail = (
  series: Championship,
  availability: SeriesAvailability,
  content: Content,
  offer: WeatherOffer,
): void => {
  const forecasts = seriesForecast(series, offer);

  const { requires } = availability;
  const needed: string[] = [...requires.packs, ...requires.makers, ...requires.distributors];
  if (requires.sources.includes(ContentSource.MOD) && !requires.makers.length && !requires.distributors.length) {
    needed.push('uncredited mods');
  }
  const widened = [...requires.widenedBy.packs, ...requires.widenedBy.makers, ...requires.widenedBy.distributors];
  console.log(`  Needs     ${needed.length ? needed.join(', ') : 'base only'}`);
  if (widened.length) console.log(`  Widened   ${widened.join(', ')}`);
  const rounds = requires.rounds.packs;
  if (rounds.length) console.log(`  Rounds    ${rounds.join(', ')} (some rounds only)`);

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
      const level = one.strength ? `  AI ${one.strength > 0 ? '+' : ''}${one.strength}` : '';
      console.log(`    ${String(at + 1).padStart(2)}  ${driver.padEnd(22)} ${fielded}${level}`);
    });
  });

  console.log('\n  Event formats');
  series.eventFormats.forEach((format) => {
    const badge = format.id === series.defaultEventFormat ? '  (default)' : '';
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

  const classPrizes = series.entries.filter((entry) => entry.prizes);
  if (series.entryFee !== undefined || series.prizes || classPrizes.length > 0) {
    console.log('\n  Money');
    if (series.entryFee !== undefined) console.log(`    Entry fee      ${series.entryFee}`);
    const { positions, standings } = series.prizes ?? {};
    if (positions) console.log(`    Round prizes   ${positions.join('-')}`);
    if (standings) console.log(`    Season prizes  ${standings.join('-')}`);
    classPrizes.forEach((entry) => {
      console.log(`    ${entry.name}`);
      // A table the class leaves out pays what the championship's does.
      const round = entry.prizes?.positions ?? positions;
      const season = entry.prizes?.standings ?? standings;
      if (round) console.log(`      Round prizes   ${round.join('-')}`);
      if (season) console.log(`      Season prizes  ${season.join('-')}`);
    });
  }

  console.log('\n  Calendar');
  series.rounds.forEach((round, index) => {
    const state = availability.rounds.find((one) => one.round === round.id);
    const key = trackKeyOf(round.track);
    const track = content.tracks.find((layout) => layout.key === key);
    const note = state?.track
      ? '  MISSING'
      : (state?.pitboxes ? `  NEEDS ${state.pitboxes.needed} PIT BOXES, HAS ${state.pitboxes.available}` : '');
    // Only a round running something other than the default names its format:
    // the same word down every row would say nothing.
    const format = round.eventFormat ? `  [${round.eventFormat}]` : '';
    const fee = round.entryFee !== undefined ? `  fee ${round.entryFee}` : '';
    const climate = round.climate ? `  {${round.climate}}` : '';
    // What each race comes to on this track, which a distance only says here.
    const races = state?.races.length
      ? `  (${state.races.map((race) => `${race.name ?? 'Race'} ${race.laps ?? '?'} laps`).join(', ')})`
      : '';
    console.log(`    ${String(index + 1).padStart(2)}  ${round.name.padEnd(22)} ${key.padEnd(38)} ${track?.name ?? ''}${note}${format}${fee}${climate}${races}`);

    const forecast = forecasts.find((one) => one.round === round.id);
    if (forecast) forecastLines(forecast).forEach((line) => console.log(`          ${line}`));
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
  // Recommended tracks race whatever the install has of them; the CLI has no
  // settings, so no choice of the player's comes into it.
  const placed = (series: Championship): Championship => withRecommendedTracks(series, content.tracks, {});

  const [id, entry, round, car] = args;
  if (!id) {
    library.series.forEach((held) => {
      printSeries(placed(held.series), seriesAvailability(placed(held.series), content));
    });

    return;
  }

  const held = seriesById(library, id);
  if (!held) throw new AppError('series.notFound', { series: id });

  const series = placed(held.series);
  const availability = seriesAvailability(series, content);
  // The CLI has no settings of its own, but the install's RainFX switch is real.
  const { rainFx } = await readWeatherFx(paths.acRoot, paths.documents);
  const offer = defaultWeatherOffer(content, rainFx);
  printSeries(series, availability);
  printDetail(series, availability, content, offer);

  if (!entry || !round) return;

  const model = car ?? firstEligible(series, entry, round, content);
  const race = roundRace({
    series, entry, round, car: { model },
  }, content, SHIPPED_CATALOGUE, offer);
  // The whole round as one INI is not what runs - the app plans one launch
  // per session - so the plan is printed beside it rather than left implied.
  const plan = planEvent(race, content);
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
    const livery = `${opponent.model ?? ''}${opponent.skin ? ` / ${opponent.skin}` : ''}`;
    console.log(`    ${String(index + 2).padStart(2)}  ${livery.padEnd(50)} AI ${opponent.aiLevel}% ${opponent.aiAggression}${bop}`);
  });
  console.log(`
  Launches  ${plan.launches.length}, one per session`);
  plan.launches.forEach((launch) => {
    const name = (launch.session.name ?? launch.session.type).padEnd(12);
    const { conditions = {} } = launch.race;
    const steps = conditions.weatherSteps
      ?.map((step) => (typeof step.weather === 'number' ? weatherName(step.weather) : step.weather))
      .join(' -> ');
    const weather = steps ?? (conditions.weatherType == null ? '' : weatherName(conditions.weatherType));
    const ambient = conditions.ambient === undefined ? '' : ` ${conditions.ambient}C`;
    console.log(`    ${launch.index + 1}  day ${launch.day}  ${name} ${sessionLength(launch.session).padEnd(8)} ${weather}${ambient}`);
  });
  console.log(`
  Wrote out/race.ini for launch 1 (${raceIni.length} bytes)
`);
};

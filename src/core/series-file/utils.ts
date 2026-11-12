// The field-by-field checks behind parseSeries. Each one records what was wrong
// and answers whether to keep going, so a bad file names every fault it has
// rather than the first.

import {
  CLASS_GRIDS,
  CLIMATES,
  GRID_START_PLACES,
  HEMISPHERES,
  QUALIFYING_CLASSES,
  SESSION_TYPES,
  TEAM_BUDGETS,
  TRACK_STATE_NAMES,
  WEATHER_TYPES,
} from './constants.ts';
import type { Reporter } from './types.ts';
import { DISCIPLINES, NATION_CODES } from '../../shared/constants/index.ts';
import { appErrorInfo } from '../../shared/errors/index.ts';
import type { AppErrorInfo } from '../../shared/errors/index.ts';
import { isRecord, memberOf } from '../../shared/utils/coerce/index.ts';

/**
 * Builds the reporter every check writes through.
 *
 * A closure over the file name and the list, so a check reads as the question
 * it is asking rather than as bookkeeping around it.
 * @param file What to call the file in a problem
 * @param problems The list to append to
 * @returns The reporter
 */
export const reporter = (file: string, problems: AppErrorInfo[]): Reporter => ({
  bad(field, value) {
    problems.push(appErrorInfo('seriesFile.field.invalid', {
      file, field, value: typeof value === 'object' ? JSON.stringify(value) : String(value),
    }));

    return false;
  },

  closedSet(value, allowed, field) {
    return memberOf(value, allowed) !== undefined || this.bad(field, value);
  },
});

/**
 * Checks a value that has to be a number when it is there at all.
 * @param value The value
 * @param field Dotted path to it
 * @param report Where to record what is wrong
 * @returns True when it reads
 */
export const readOptionalNumber = (
  value: unknown,
  field: string,
  report: Reporter,
): boolean => value === undefined || typeof value === 'number' || report.bad(field, value);

/**
 * Checks a value that has to be a string when it is there at all.
 * @param value The value
 * @param field Dotted path to it
 * @param report Where to record what is wrong
 * @returns True when it reads
 */
export const readOptionalString = (
  value: unknown,
  field: string,
  report: Reporter,
): boolean => value === undefined || typeof value === 'string' || report.bad(field, value);

/**
 * Checks an AI grid's offsets, wherever a championship carries one.
 *
 * A grid that still states absolute levels - `aiLevel`, `aiLevelMin`,
 * `aiAggression` - is reported rather than quietly ignored, since read as
 * nothing it would race at the difficulty in settings while claiming a field of
 * its own. Such a file was written before strength became the player's, and
 * the answer is to delete it.
 * @param value The grid value
 * @param field Dotted path to it
 * @param report Where to record what is wrong
 * @returns True when it reads
 */
export const readGrid = (value: unknown, field: string, report: Reporter): boolean => {
  if (value === undefined) return true;
  if (!isRecord(value)) return report.bad(field, value);

  return [
    readOptionalNumber(value.strength, `${field}.strength`, report),
    readOptionalNumber(value.aggression, `${field}.aggression`, report),
    ...(['aiLevel', 'aiLevelMin', 'aiAggression'] as const)
      .map((key) => value[key] === undefined || report.bad(`${field}.${key}`, value[key])),
  ].every(Boolean);
};

/**
 * Checks the conditions block a round or a session may carry.
 *
 * Only the two fields that index something: a track state names a preset and a
 * weather type names a CSP one, and both fail silently when they are wrong.
 * @param value The conditions value
 * @param field Dotted path to it
 * @param report Where to record what is wrong
 * @returns True when it reads
 */
export const readConditions = (
  value: unknown,
  field: string,
  report: Reporter,
): boolean => {
  if (value === undefined) return true;
  if (!isRecord(value)) return report.bad(field, value);

  const state = value.trackState === undefined
    || report.closedSet(value.trackState, TRACK_STATE_NAMES, `${field}.trackState`);
  const weather = value.weatherType === undefined
    || report.closedSet(value.weatherType, WEATHER_TYPES, `${field}.weatherType`);

  return state && weather;
};

/**
 * Checks one event format and every session in it.
 * @param value The format value
 * @param field Dotted path to it
 * @param report Where to record what is wrong
 * @returns True when it reads
 */
export const readFormat = (value: unknown, field: string, report: Reporter): boolean => {
  if (!isRecord(value)) return report.bad(field, value);

  const id = typeof value.id === 'string' || report.bad(`${field}.id`, value.id);
  if (!Array.isArray(value.sessions)) return report.bad(`${field}.sessions`, value.sessions);

  // every() rather than a short-circuit, so a format with three bad sessions
  // names three rather than one.
  const sessions = value.sessions.map((session, at) => {
    const where = `${field}.sessions[${at}]`;
    if (!isRecord(session)) return report.bad(where, session);

    const type = report.closedSet(session.type, SESSION_TYPES, `${where}.type`);
    // Any slot number reads, since placePlayer holds it inside the class; a name
    // it does not know would quietly start the player last.
    const start = session.start === undefined
      || typeof session.start === 'number'
      || report.closedSet(session.start, GRID_START_PLACES, `${where}.start`);
    const classes = session.classes === undefined
      || report.closedSet(session.classes, QUALIFYING_CLASSES, `${where}.classes`);
    const classGrid = session.classGrid === undefined
      || report.closedSet(session.classGrid, CLASS_GRIDS, `${where}.classGrid`);

    return readConditions(session.conditions, `${where}.conditions`, report)
      && type && start && classes && classGrid;
  }).every(Boolean);

  return id && sessions;
};

/**
 * Checks one points system's id and the points it pays.
 * @param value The points system value
 * @param field Dotted path to it
 * @param report Where to record what is wrong
 * @returns True when it reads
 */
export const readPoints = (value: unknown, field: string, report: Reporter): boolean => {
  if (!isRecord(value)) return report.bad(field, value);

  const id = typeof value.id === 'string' || report.bad(`${field}.id`, value.id);
  // A finish is scored against these, so a list of anything else would come out
  // as NaN points a phase later rather than as a file that would not read.
  const scored = (Array.isArray(value.positions)
    && value.positions.every((points) => typeof points === 'number'))
    || report.bad(`${field}.positions`, value.positions);
  const qualifying = value.qualifying === undefined
    || (Array.isArray(value.qualifying)
      && value.qualifying.every((points) => typeof points === 'number'))
    || report.bad(`${field}.qualifying`, value.qualifying);

  return scored && qualifying && id;
};

/**
 * Checks the nation a driver or a team races under.
 *
 * Only a code Assetto Corsa has a flag for, since any other races flagless with
 * nothing said. A written-out nationality is refused rather than ignored: it is
 * looked up from the code now, and one left in the file would round-trip
 * straight back out.
 * @param value The driver or the team
 * @param field Dotted path to it
 * @param report Where to record what is wrong
 * @returns True when it reads
 */
const readNation = (value: Record<string, unknown>, field: string, report: Reporter): boolean => {
  const code = value.nationCode === undefined
    || report.closedSet(value.nationCode, NATION_CODES, `${field}.nationCode`);
  const name = value.nationality === undefined || report.bad(`${field}.nationality`, value.nationality);

  return code && name;
};

/**
 * Checks one seat's id and whoever is in it.
 *
 * Shallow, like the rest of this module: a team id and a car folder name index
 * the championship's own lists rather than a catalogue, so validateSeries is
 * where they are resolved.
 * @param value The seat value
 * @param field Dotted path to it
 * @param report Where to record what is wrong
 * @returns True when it reads
 */
export const readSeat = (value: unknown, field: string, report: Reporter): boolean => {
  if (!isRecord(value)) return report.bad(field, value);

  const id = (typeof value.id === 'string' && value.id !== '')
    || report.bad(`${field}.id`, value.id);
  const team = value.team === undefined
    || typeof value.team === 'string'
    || report.bad(`${field}.team`, value.team);
  // A driver with no name would race under a generated one while claiming to
  // hold somebody. Every leaf is checked, not just the ones with a catalogue behind them: a
  // strength of "fast" would reach race.ini as AI_LEVEL=NaN, which Assetto
  // Corsa reads as garbage with nothing said anywhere.
  const driver = value.driver === undefined
    || ((isRecord(value.driver) && typeof value.driver.name === 'string' && value.driver.name !== ''
      && readNation(value.driver, `${field}.driver`, report))
      || report.bad(`${field}.driver`, value.driver));
  const car = value.car === undefined
    || ((isRecord(value.car)
      && readOptionalString(value.car.model, `${field}.car.model`, report)
      && readOptionalString(value.car.skin, `${field}.car.skin`, report))
      || report.bad(`${field}.car`, value.car));
  // Absolute levels are refused for the reason readGrid gives.
  const levels = [
    readOptionalNumber(value.strength, `${field}.strength`, report),
    readOptionalNumber(value.aggression, `${field}.aggression`, report),
    ...(['aiLevel', 'aiAggression'] as const)
      .map((key) => value[key] === undefined || report.bad(`${field}.${key}`, value[key])),
  ].every(Boolean);

  return id && team && driver && car && levels;
};

/**
 * Checks one team's id, name, budget tier and nation.
 * @param value The team value
 * @param field Dotted path to it
 * @param report Where to record what is wrong
 * @returns True when it reads
 */
export const readTeam = (value: unknown, field: string, report: Reporter): boolean => {
  if (!isRecord(value)) return report.bad(field, value);

  const id = (typeof value.id === 'string' && value.id !== '')
    || report.bad(`${field}.id`, value.id);
  const name = typeof value.name === 'string' || report.bad(`${field}.name`, value.name);
  const budget = value.budget === undefined
    || report.closedSet(value.budget, TEAM_BUDGETS, `${field}.budget`);
  const nation = readNation(value, field, report);

  return id && name && budget && nation;
};

/**
 * Checks the prize money a championship, or one of its classes, pays.
 *
 * The same argument readPoints makes: a table of anything but numbers would pay
 * NaN a phase later rather than fail to read now.
 * @param value The prizes value
 * @param field Dotted path to it
 * @param report Where to record what is wrong
 * @returns True when it reads
 */
export const readPrizes = (value: unknown, field: string, report: Reporter): boolean => {
  if (value === undefined) return true;
  if (!isRecord(value)) return report.bad(field, value);

  return (['positions', 'standings'] as const).map((table) => {
    const amounts = value[table];

    return amounts === undefined
      || (Array.isArray(amounts) && amounts.every((amount) => typeof amount === 'number'))
      || report.bad(`${field}.${table}`, amounts);
  }).every(Boolean);
};

/**
 * Checks one class entry's discipline, seats, what it may be driven in and
 * what it pays.
 * @param value The entry value
 * @param field Dotted path to it
 * @param report Where to record what is wrong
 * @returns True when it reads
 */
export const readEntry = (value: unknown, field: string, report: Reporter): boolean => {
  if (!isRecord(value)) return report.bad(field, value);

  const ladder = isRecord(value.ladder)
    ? report.closedSet(value.ladder.discipline, DISCIPLINES, `${field}.ladder.discipline`)
    : report.bad(`${field}.ladder`, value.ladder);

  // Mapped before every(), so an entry with three bad seats names three.
  const seats = Array.isArray(value.seats)
    ? value.seats.map((seat, at) => readSeat(seat, `${field}.seats[${at}]`, report)).every(Boolean)
    : report.bad(`${field}.seats`, value.seats);

  const prizes = readPrizes(value.prizes, `${field}.prizes`, report);
  const fee = readOptionalNumber(value.entryFee, `${field}.entryFee`, report);
  const grid = readGrid(value.grid, `${field}.grid`, report);

  const rule = value.eligibility;
  if (!isRecord(rule)) return report.bad(`${field}.eligibility`, rule) && seats && prizes && fee && grid;

  // Only the shape of a spec is checked here. It may be one the user made, so
  // the set it belongs to is the resolved class catalogue rather than anything
  // closed, and validateSeries is what resolves it. A car list is folder names,
  // which seriesAvailability checks against the install.
  const eligibility = rule.kind === 'spec'
    ? (typeof rule.spec === 'string' && rule.spec !== '') || report.bad(`${field}.eligibility.spec`, rule.spec)
    : Array.isArray(rule.cars) || report.bad(`${field}.eligibility.cars`, rule.cars);

  return ladder && seats && prizes && fee && grid && eligibility;
};

/**
 * Checks one round's track and whatever conditions it carries.
 * @param value The round value
 * @param field Dotted path to it
 * @param report Where to record what is wrong
 * @returns True when it reads
 */
export const readRound = (value: unknown, field: string, report: Reporter): boolean => {
  if (!isRecord(value)) return report.bad(field, value);

  const track = isRecord(value.track) && typeof value.track.id === 'string'
    ? true
    : report.bad(`${field}.track`, value.track);
  const fee = readOptionalNumber(value.entryFee, `${field}.entryFee`, report);
  const grid = readGrid(value.grid, `${field}.grid`, report);
  const climate = value.climate === undefined
    || report.closedSet(value.climate, CLIMATES, `${field}.climate`);
  const hemisphere = value.hemisphere === undefined
    || report.closedSet(value.hemisphere, HEMISPHERES, `${field}.hemisphere`);
  // The shape only: whether each names a session of the round's format, and
  // states one length, is validateSeries' question.
  const lengths = value.sessionLengths === undefined || (Array.isArray(value.sessionLengths)
    ? value.sessionLengths.map((length, at) => {
      const where = `${field}.sessionLengths[${at}]`;
      if (!isRecord(length) || typeof length.session !== 'string') return report.bad(where, length);

      return (['laps', 'minutes', 'distance'] as const)
        .map((unit) => readOptionalNumber(length[unit], `${where}.${unit}`, report))
        .every(Boolean);
    }).every(Boolean)
    : report.bad(`${field}.sessionLengths`, value.sessionLengths));

  return readConditions(value.conditions, `${field}.conditions`, report)
    && track && fee && grid && climate && hemisphere && lengths;
};

/**
 * Checks a championship's request for generated weather.
 * @param value The generated weather value
 * @param field Dotted path to it
 * @param report Where to record what is wrong
 * @returns True when it reads
 */
export const readGeneratedWeather = (value: unknown, field: string, report: Reporter): boolean => {
  if (value === undefined) return true;
  if (!isRecord(value)) return report.bad(field, value);

  const hemisphere = value.hemisphere === undefined
    || report.closedSet(value.hemisphere, HEMISPHERES, `${field}.hemisphere`);

  return report.closedSet(value.climate, CLIMATES, `${field}.climate`) && hemisphere;
};

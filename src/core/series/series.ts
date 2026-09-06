// Reading a championship: whether it is well formed, whether the library can
// race it, and how one of its rounds becomes a race.
//
// The lowering is the load-bearing part, and what it deliberately does not do
// matters as much as what it does: roundRace returns an ordinary
// RaceDefinition, so a championship round runs through planWeekend, buildGrid,
// prepareLaunch and buildRaceIni exactly as a hand-authored weekend does. There
// is no series-aware code anywhere in src/core/weekend, src/core/race-ini or
// src/main/race-store, and there should never be.
//
// Points are carried and not applied. Standings, the calendar and prize money
// are Phase 5; nothing here reads PointsSystem or PrizeMoney.

import { SERIES_FORMAT_VERSION } from './constants.ts';
import type { RoundRaceRequest } from './types.ts';
import {
  availabilityOf,
  bopFor,
  carsOf,
  duplicates,
  eligibilityFor,
  eligibleCars,
  entryGrid,
  entryOf,
  fieldSize,
  findLayout,
  formatOf,
  levelIn,
  missingTrack,
  pickModels,
  requirementsOf,
  roundOf,
  validateFormat,
} from './utils.ts';
import { AppError, appErrorInfo } from '../../shared/errors/index.ts';
import type { AppErrorInfo } from '../../shared/errors/index.ts';
import type {
  CarEntry,
  Championship,
  Content,
  RaceDefinition,
  RoundAvailability,
  SeriesAvailability,
} from '../../shared/types/index.ts';
import { randomFrom, seedFrom } from '../seeded-random/index.ts';

export { SERIES_FORMAT_VERSION } from './constants.ts';
export { eligibleCars } from './utils.ts';

/**
 * Checks a championship against the schema's own rules.
 *
 * Structural only, and deliberately independent of installed content: a
 * championship can be wrong without anything being uninstalled, and the two
 * questions want separate answers. Shaped like validateRace, so the CLI and the
 * UI report both the same way.
 * @param series The championship to check
 * @returns One entry per rule broken, empty when it is well formed
 */
export const validateSeries = (series: Championship): AppErrorInfo[] => {
  const problems: AppErrorInfo[] = [];

  if (series.version !== SERIES_FORMAT_VERSION) {
    problems.push(appErrorInfo('series.version.unsupported', {
      series: series.id, version: series.version, supported: SERIES_FORMAT_VERSION,
    }));
  }
  if (series.entries.length === 0) {
    problems.push(appErrorInfo('series.entries.empty', { series: series.id }));
  }
  if (series.rounds.length === 0) {
    problems.push(appErrorInfo('series.rounds.empty', { series: series.id }));
  }

  duplicates(series.entries.map((entry) => entry.id)).forEach((id) => {
    problems.push(appErrorInfo('series.id.duplicate', { series: series.id, kind: 'class entry', id }));
  });
  duplicates(series.rounds.map((round) => round.id)).forEach((id) => {
    problems.push(appErrorInfo('series.id.duplicate', { series: series.id, kind: 'round', id }));
  });

  series.entries.forEach((entry) => {
    if (entry.entrants < 1) {
      problems.push(appErrorInfo('series.entrants.invalid', {
        entry: entry.id, entrants: entry.entrants,
      }));
    }
    if (entry.ladder.tier < 1) {
      problems.push(appErrorInfo('series.tier.invalid', { entry: entry.id, tier: entry.ladder.tier }));
    }
    if (carsOf(entry.eligibility).length === 0) {
      problems.push(appErrorInfo('series.entry.noCars', { entry: entry.id }));
    }
    // A balanced car nobody can field is a rule with no subject, which is
    // almost always a folder ID typed wrong.
    const fieldable = new Set(carsOf(entry.eligibility));
    entry.bop?.forEach((bop) => {
      if (!fieldable.has(bop.car)) {
        problems.push(appErrorInfo('series.bop.notEligible', { entry: entry.id, car: bop.car }));
      }
    });
  });

  const entryIds = new Set(series.entries.map((entry) => entry.id));
  series.rounds.forEach((round) => {
    round.eligibility?.forEach((override) => {
      if (!entryIds.has(override.entry)) {
        problems.push(appErrorInfo('series.entry.unknown', {
          series: series.id, round: round.id, entry: override.entry,
        }));
      }
    });
  });

  if (series.weekendFormats.length === 0) {
    problems.push(appErrorInfo('series.formats.empty', { series: series.id }));
  }
  duplicates(series.weekendFormats.map((format) => format.id)).forEach((id) => {
    problems.push(appErrorInfo('series.id.duplicate', { series: series.id, kind: 'weekend format', id }));
  });

  const formatIds = new Set(series.weekendFormats.map((format) => format.id));
  if (series.weekendFormats.length > 0 && !formatIds.has(series.defaultWeekendFormat)) {
    problems.push(appErrorInfo('series.format.defaultUnknown', {
      series: series.id, format: series.defaultWeekendFormat,
    }));
  }
  series.rounds.forEach((round) => {
    if (round.weekendFormat !== undefined && !formatIds.has(round.weekendFormat)) {
      problems.push(appErrorInfo('series.format.unknown', {
        series: series.id, round: round.id, format: round.weekendFormat,
      }));
    }
  });

  if (series.pointsSystems.length === 0) {
    problems.push(appErrorInfo('series.points.empty', { series: series.id }));
  }
  duplicates(series.pointsSystems.map((points) => points.id)).forEach((id) => {
    problems.push(appErrorInfo('series.id.duplicate', { series: series.id, kind: 'points system', id }));
  });
  if (series.pointsSystems.length > 0
    && !series.pointsSystems.some((points) => points.id === series.defaultPointsSystem)) {
    problems.push(appErrorInfo('series.points.defaultUnknown', {
      series: series.id, points: series.defaultPointsSystem,
    }));
  }

  // Every format, not only the ones in use: an unused format is still part of
  // the document, and the editor will offer it to a round tomorrow.
  series.weekendFormats.forEach((format) => {
    problems.push(...validateFormat(series, format));
  });

  return problems;
};

/**
 * Checks whether a championship can be raced against the installed content.
 *
 * Every missing car and track is named down to the DLC pack or the mod team
 * through the provenance catalogue, which is a pure ID lookup and so answers
 * perfectly well for content nobody has. Nothing here is worked around: a
 * championship missing something is reported as unavailable rather than quietly
 * running a smaller field, because two users' "same" championship silently
 * differing is how results stop comparing.
 * @param series The championship to check
 * @param content Installed content to check against
 * @returns What it needs and whether it has it
 */
export const seriesAvailability = (
  series: Championship,
  content: Content,
): SeriesAvailability => {
  const problems = validateSeries(series);
  const entries = series.entries.map((entry) => availabilityOf(entry, content));
  const needed = fieldSize(series);

  const rounds: RoundAvailability[] = series.rounds.map((round) => {
    const track = findLayout(content, round.track);
    const overridden = series.entries
      .filter((entry) => round.eligibility?.some((override) => override.entry === entry.id))
      .map((entry) => availabilityOf(entry, content, round));

    return {
      round: round.id,
      track: track ? null : missingTrack(round),
      pitboxes: track?.pitboxes && needed > track.pitboxes
        ? { needed, available: track.pitboxes }
        : null,
      entries: overridden,
    };
  });

  const available = problems.length === 0
    && entries.every((entry) => entry.enough)
    && rounds.every((round) => (
      round.track === null && round.pitboxes === null && round.entries.every((one) => one.enough)
    ));

  return {
    series: series.id,
    available,
    problems,
    entries,
    rounds,
    requires: requirementsOf(series),
  };
};

/**
 * Lowers one round of a championship into a race.
 *
 * The field is composed from every class entry, not just the player's, since a
 * multi-class series is one grid entered several ways. It is seeded on the
 * series, round and class rather than on the clock, so a round the player has
 * already been shown comes back the same next time it is looked at.
 * @param request Which round of which championship, and the player's car
 * @param content Installed content to resolve eligibility against
 * @returns A race definition, ready for validateRace and planWeekend
 * @throws When the round, entry or car cannot be raced
 */
export const roundRace = (request: RoundRaceRequest, content: Content): RaceDefinition => {
  const { series, car } = request;
  const round = roundOf(series, request.round);
  const playerEntry = entryOf(series, request.entry);

  const format = formatOf(series, round);
  if (!format) {
    throw new AppError('series.format.unknown', {
      series: series.id,
      round: round.id,
      format: round.weekendFormat ?? series.defaultWeekendFormat,
    });
  }

  const allowed = eligibleCars(eligibilityFor(playerEntry, round), content);
  if (!allowed.some((eligible) => eligible.id === car.model)) {
    throw new AppError('series.car.notEligible', { car: car.model, entry: playerEntry.name });
  }

  const opponents: CarEntry[] = series.entries.flatMap((entry) => {
    const models = eligibleCars(eligibilityFor(entry, round), content).map((eligible) => eligible.id);
    if (models.length === 0) {
      throw new AppError('series.entry.noCars', { entry: entry.id });
    }

    // The player occupies one of their own class's entrants, so that class
    // fields one fewer car than it has entries.
    const count = entry.id === playerEntry.id ? entry.entrants - 1 : entry.entrants;
    const grid = entryGrid(series, entry);
    const random = randomFrom(seedFrom(`${series.id}:${round.id}:${entry.id}`));

    return pickModels(models, count, random).map((model, index) => ({
      model,
      ...bopFor(entry, model),
      // Spread within the class rather than across the field: one linear ramp
      // over a multi-class grid would make the slower class's drivers weak as
      // well as their cars, which is not what a class difference is.
      aiLevel: levelIn(grid.aiLevel, grid.aiLevelMin, index, count),
      aiAggression: grid.aiAggression,
    }));
  });

  return {
    id: `${series.id}-${round.id}`,
    name: `${series.name} - ${round.name}`,
    track: round.track,
    playerCar: { model: car.model, skin: car.skin, ...bopFor(playerEntry, car.model) },
    grid: { size: opponents.length + 1, opponents },
    sessions: [...format.sessions],
    conditions: round.conditions,
    assists: series.regulations?.assists,
    fixedSetup: series.regulations?.fixedSetup,
    penalties: series.regulations?.penalties,
    jumpStartPenalty: series.regulations?.jumpStartPenalty,
    allowedTyresOut: series.regulations?.allowedTyresOut,
  };
};

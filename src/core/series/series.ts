// Reading a championship: whether it is well formed, whether the library can
// race it, and how one of its rounds becomes a race.
//
// The lowering is the load-bearing part, and what it deliberately does not do
// matters as much as what it does: roundRace returns an ordinary
// RaceDefinition, so a championship round runs through planEvent, buildGrid,
// prepareLaunch and buildRaceIni exactly as a hand-authored event does. There
// is no series-aware code anywhere in src/core/event, src/core/race-ini or
// src/main/race-store, and there should never be.
//
// Points are carried and not applied: scoring a round is src/core/season-scoring's.

import type { RoundRaceRequest } from './types.ts';
import {
  aiSeats,
  availabilityOf,
  bopFor,
  classOffset,
  climateOf,
  duplicates,
  eligibilityFor,
  eligibleCars,
  entryOf,
  fieldSize,
  findLayout,
  missingTrack,
  nationOf,
  pickModels,
  raceLengths,
  regulatedOnly,
  requirementsOf,
  roundOf,
  roundRaceId,
  roundSessions,
  seatDraw,
  seatSkin,
  validateFormat,
  validateLength,
  validateMoney,
  validateOffsets,
  withDistancesInLaps,
} from './utils.ts';
import {
  DEFAULT_OPPONENTS, DEFAULT_SEASON_LENGTH, SEASON_WEEKS, SERIES_FORMAT_VERSION,
} from '../../shared/constants/index.ts';
import { AppError, appErrorInfo } from '../../shared/errors/index.ts';
import type { AppErrorInfo } from '../../shared/errors/index.ts';
import type {
  AiBase,
  CarEntry,
  Championship,
  ClassCatalogue,
  Conditions,
  Content,
  FieldSeat,
  RaceDefinition,
  RoundAvailability,
  RoundForecast,
  SeriesAvailability,
  WeatherOffer,
} from '../../shared/types/index.ts';
import { aiFigure } from '../../shared/utils/ai-figure/index.ts';
import { isKnownSpec, SHIPPED_CATALOGUE } from '../../shared/utils/car-classes/index.ts';
import { carsOf, fieldableCars } from '../../shared/utils/eligibility/index.ts';
import { formatOf } from '../../shared/utils/event-format/index.ts';
import { dryOffer, rainAllowed, withoutRain } from '../../shared/utils/wet-weather/index.ts';
import { nextSkin, skinKey } from '../race-ini/index.ts';
import { randomFrom, seedFrom } from '../seeded-random/index.ts';
import {
  applyForecast, defaultWeatherOffer, forecastRound, offerForecast,
} from '../weather-forecast/index.ts';

// Re-exported so the shipped library and the CLI keep reaching for it here,
// beside the validator that enforces it.
export { SERIES_FORMAT_VERSION } from '../../shared/constants/index.ts';
export {
  baseRaceId, classOffset, climateOf, eligibleCars, hemisphereOf, nationOf, raceWeekdayOf, roundOf, roundRaceId,
  roundSessions, runRaceId, seatDraw,
} from './utils.ts';
export { formatOf } from '../../shared/utils/event-format/index.ts';

/**
 * Checks a championship against the schema's own rules.
 *
 * Structural only, and deliberately independent of installed content: a
 * championship can be wrong without anything being uninstalled, and the two
 * questions want separate answers. Shaped like validateRace, so the CLI and the
 * UI report both the same way.
 *
 * The class catalogue is the one thing outside the document it reads, because
 * a spec may be one the user made - and a championship naming a spec this
 * catalogue lacks is wrong in the same way as one naming a format it lacks.
 * @param series The championship to check
 * @param catalogue The class catalogue specs resolve against
 * @returns One entry per rule broken, empty when it is well formed
 */
export const validateSeries = (
  series: Championship,
  catalogue: ClassCatalogue = SHIPPED_CATALOGUE,
): AppErrorInfo[] => {
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
  // A championship races once a week at most, so a season has room for as many
  // rounds as it has weeks. More than that is something the calendar cannot do,
  // which is worth refusing rather than quietly crowding two rounds into a week.
  const weeks = SEASON_WEEKS[series.seasonLength ?? DEFAULT_SEASON_LENGTH];
  if (series.rounds.length > weeks) {
    problems.push(appErrorInfo('series.season.tooManyRounds', {
      series: series.id, rounds: series.rounds.length, weeks,
    }));
  }

  duplicates(series.entries.map((entry) => entry.id)).forEach((id) => {
    problems.push(appErrorInfo('series.id.duplicate', { series: series.id, kind: 'class entry', id }));
  });
  duplicates(series.rounds.map((round) => round.id)).forEach((id) => {
    problems.push(appErrorInfo('series.id.duplicate', { series: series.id, kind: 'round', id }));
  });

  const teamIds = series.teams?.map((team) => team.id) ?? [];
  duplicates(teamIds).forEach((id) => {
    problems.push(appErrorInfo('series.id.duplicate', { series: series.id, kind: 'team', id }));
  });
  // Seat ids are unique across the whole championship rather than within a
  // class: a seat is what a contract binds to and what standings will file a
  // result under, and neither of those is scoped to one class entry.
  duplicates(series.entries.flatMap((entry) => entry.seats.map((seat) => seat.id))).forEach((id) => {
    problems.push(appErrorInfo('series.id.duplicate', { series: series.id, kind: 'seat', id }));
  });

  const teams = new Set(teamIds);

  series.entries.forEach((entry) => {
    if (entry.seats.length === 0) {
      problems.push(appErrorInfo('series.seats.empty', { entry: entry.id }));
    }
    if (entry.ladder.tier < 1) {
      problems.push(appErrorInfo('series.tier.invalid', { entry: entry.id, tier: entry.ladder.tier }));
    }
    // Its own rule rather than the whole calendar: a round override says what
    // this class swaps to, not what it can run when no round says otherwise.
    if (entry.eligibility.kind === 'spec' && !isKnownSpec(entry.eligibility.spec, catalogue)) {
      problems.push(appErrorInfo('series.spec.unknown', {
        entry: entry.id, spec: entry.eligibility.spec,
      }));
    } else if (carsOf(entry.eligibility, catalogue).length === 0) {
      problems.push(appErrorInfo('series.entry.noCars', { entry: entry.id }));
    }

    // Balance of performance and a pinned seat are both named for the season,
    // so both are checked against every car the class fields at any round. A
    // car nobody can field is a rule with no subject - almost always a folder
    // ID typed wrong.
    const fieldable = fieldableCars(series, entry, catalogue);
    entry.bop?.forEach((bop) => {
      if (!fieldable.has(bop.car)) {
        problems.push(appErrorInfo('series.bop.notEligible', { entry: entry.id, car: bop.car }));
      }
    });
    entry.seats.forEach((seat) => {
      if (seat.team !== undefined && !teams.has(seat.team)) {
        problems.push(appErrorInfo('series.seat.teamUnknown', {
          series: series.id, seat: seat.id, team: seat.team,
        }));
      }
      if (seat.car?.model !== undefined && !fieldable.has(seat.car.model)) {
        problems.push(appErrorInfo('series.seat.carNotEligible', {
          seat: seat.id, car: seat.car.model,
        }));
      }
    });
  });

  problems.push(...validateMoney(series));
  problems.push(...validateOffsets(series));

  const entryIds = new Set(series.entries.map((entry) => entry.id));
  series.rounds.forEach((round) => {
    round.eligibility?.forEach((override) => {
      if (!entryIds.has(override.entry)) {
        problems.push(appErrorInfo('series.entry.unknown', {
          series: series.id, round: round.id, entry: override.entry,
        }));
      }
      if (override.eligibility.kind === 'spec' && !isKnownSpec(override.eligibility.spec, catalogue)) {
        problems.push(appErrorInfo('series.round.specUnknown', {
          round: round.id, entry: override.entry, spec: override.eligibility.spec,
        }));
      }
    });
  });

  if (series.eventFormats.length === 0) {
    problems.push(appErrorInfo('series.formats.empty', { series: series.id }));
  }
  duplicates(series.eventFormats.map((format) => format.id)).forEach((id) => {
    problems.push(appErrorInfo('series.id.duplicate', { series: series.id, kind: 'event format', id }));
  });

  const formatIds = new Set(series.eventFormats.map((format) => format.id));
  if (series.eventFormats.length > 0 && !formatIds.has(series.defaultEventFormat)) {
    problems.push(appErrorInfo('series.format.defaultUnknown', {
      series: series.id, format: series.defaultEventFormat,
    }));
  }
  series.rounds.forEach((round) => {
    if (round.eventFormat !== undefined && !formatIds.has(round.eventFormat)) {
      problems.push(appErrorInfo('series.format.unknown', {
        series: series.id, round: round.id, format: round.eventFormat,
      }));
    }

    // A length is replaced by session id, so it has to name one the round's
    // own format runs - an override for a sprint on a regular event would
    // otherwise sit there saying nothing.
    const format = formatOf(series, round);
    round.sessionLengths?.forEach((length) => {
      const session = format?.sessions.find((one) => one.id === length.session);
      if (format && !session) {
        problems.push(appErrorInfo('series.round.sessionUnknown', {
          series: series.id, round: round.id, session: length.session,
        }));
      }
      // A session may leave its length to AC; an override stating none would
      // strip the format's length off the session and replace it with nothing.
      if (session && [length.laps, length.minutes, length.distance].every((one) => one === undefined)) {
        problems.push(appErrorInfo('series.round.lengthMissing', {
          series: series.id, round: round.id, session: length.session,
        }));
      }
      if (session) {
        problems.push(...validateLength(length, session.type, {
          series: series.id, format: `round ${round.id}`, session: length.session,
        }));
      }
    });
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
  series.eventFormats.forEach((format) => {
    problems.push(...validateFormat(series, format));
  });

  return problems;
};

/**
 * Checks whether a championship can be raced against the installed content.
 *
 * Every missing car and track is named down to the DLC pack or the mod team
 * through the provenance catalogue, which is a pure ID lookup and so answers
 * perfectly well for content nobody has. Cars are never worked around: a
 * championship missing one is reported as unavailable rather than quietly
 * running a smaller field, because two users' "same" championship silently
 * differing is how results stop comparing. A circuit is different - a
 * championship races every real venue of its season wherever it comes from,
 * and a round whose track is missing is simply one the player cannot race,
 * said so on the round itself.
 * @param series The championship to check
 * @param content Installed content to check against
 * @param catalogue The class catalogue specs resolve against
 * @returns What it needs and whether it has it
 */
export const seriesAvailability = (
  series: Championship,
  content: Content,
  catalogue: ClassCatalogue = SHIPPED_CATALOGUE,
): SeriesAvailability => {
  const problems = validateSeries(series, catalogue);
  const entries = series.entries.map((entry) => availabilityOf(entry, content, catalogue));
  const needed = fieldSize(series);

  const rounds: RoundAvailability[] = series.rounds.map((round) => {
    const track = findLayout(content, round.track);
    const overridden = series.entries
      .filter((entry) => round.eligibility?.some((override) => override.entry === entry.id))
      .map((entry) => availabilityOf(entry, content, catalogue, round));
    const format = formatOf(series, round);

    return {
      round: round.id,
      track: track ? null : missingTrack(round),
      pitboxes: track?.pitboxes && needed > track.pitboxes
        ? { needed, available: track.pitboxes }
        : null,
      entries: overridden,
      races: format ? raceLengths(roundSessions(format, round), track?.lengthM ?? null) : [],
    };
  });

  // Cars are the championship's: a grid missing some is a grid missing
  // drivers, so every class - and every round's own cars - must be there. A
  // circuit is one round's: a round without its track, or with too few boxes
  // for the field, is a round the player skips, and the championship stands
  // while at least one round can be raced.
  const available = problems.length === 0
    && entries.every((entry) => entry.enough)
    && rounds.every((round) => round.entries.every((one) => one.enough))
    && rounds.some((round) => round.track === null && round.pitboxes === null
      // A race stated as a distance runs only once the track says how long
      // a lap is.
      && round.races.every((race) => race.laps !== null));

  return {
    series: series.id,
    available,
    problems,
    entries,
    rounds,
    requires: requirementsOf(series, catalogue),
  };
};

/**
 * Every round's forecast, for a championship that generates its weather.
 *
 * The same draw roundRace writes onto the sessions, so what the calendar shows
 * is what the round races in. A round whose format does not resolve has no
 * sessions to forecast and is left out, which validateSeries already reports.
 * @param series The championship
 * @param offer What the install and settings can race in
 * @returns One forecast per round, empty when the weather is not generated
 */
export const seriesForecast = (series: Championship, offer: WeatherOffer): RoundForecast[] => (
  series.rounds.flatMap((round) => {
    const climate = climateOf(series, round);
    const format = formatOf(series, round);

    return climate !== null && format !== null
      ? [forecastRound(series.id, round, format, climate, offer, {}, rainAllowed(series))]
      : [];
  })
);

/**
 * Draws a season's field: every AI seat's car, livery and own offsets, once.
 *
 * What a career freezes when it enters a championship, so a driver keeps their
 * car, their colours and their pace from the opener to the finale. Drawn over
 * the championship's own eligibility rather than any round's, since a season
 * is not one round; a round that runs other cars draws its own for that round.
 * Liveries are handed out the way buildGrid would, pinned ones first, so no two
 * AI cars share colours the library had spare. The player's livery plays no
 * part: they may repaint at any time, and the field never moves for it.
 *
 * Seeded on the seat, the championship and the salt - a career and season, or
 * nothing outside one - so two careers field different drivers and a round
 * raced outside a career fields the same ones every time.
 * @param series The championship
 * @param playerEntry The class the player races in, by its id
 * @param content Installed content to resolve cars and liveries against
 * @param catalogue The class catalogue specs resolve against
 * @param salt What makes this season's draw its own, empty outside a career
 * @returns One frozen seat per AI seat, in entry-list order
 */
export const drawField = (
  series: Championship,
  playerEntry: string,
  content: Content,
  catalogue: ClassCatalogue = SHIPPED_CATALOGUE,
  salt = '',
): FieldSeat[] => {
  const draws = series.entries.flatMap((entry) => {
    const models = eligibleCars(entry.eligibility, content, catalogue).map((one) => one.id);
    const seats = aiSeats(entry, playerEntry);
    const cars = randomFrom(seedFrom(`${entry.id}\u0000${series.id}\u0000${salt}\u0000cars`));
    const drawn = models.length > 0 ? pickModels(models, seats.length, cars) : [];

    return seats.map((seat, index) => {
      const pinned = seat.car?.model;

      return {
        seat,
        model: pinned !== undefined && models.includes(pinned) ? pinned : drawn[index],
        ...seatDraw(series, seat, salt),
      };
    });
  });

  // Every pinned livery is reserved before any is handed out, which is the
  // order buildGrid reserves them in too.
  const used = new Set<string>();
  const pinnedSkins = draws.map(({ seat, model }) => (
    model === undefined ? undefined : seatSkin(content, model, seat.car?.skin)
  ));
  pinnedSkins.forEach((skin, at) => {
    const { model } = draws[at];
    if (skin !== undefined && model !== undefined) used.add(skinKey(model, skin));
  });
  const placed = new Map<string, number>();

  return draws.map(({ seat, model, ...rest }, at) => {
    if (model === undefined) return { seat: seat.id, ...rest };

    const already = placed.get(model) ?? 0;
    placed.set(model, already + 1);
    const skin = pinnedSkins[at] ?? nextSkin(content, model, used, already) ?? undefined;
    if (skin !== undefined) used.add(skinKey(model, skin));

    return {
      seat: seat.id,
      ...rest,
      model,
      ...(skin === undefined ? {} : { skin }),
    };
  });
};

/**
 * Lowers one round of a championship into a race.
 *
 * The field is composed from every class entry, not just the player's, since a
 * multi-class series is one grid entered several ways. Each AI seat races the
 * car, livery and offsets its season froze - `request.field` inside a career,
 * and otherwise drawn here unsalted, which is the same answer every time it is
 * asked. Generated weather is seeded the same way, and written onto the
 * sessions, so the race runs exactly what the round's forecast said.
 *
 * AI strength is resolved here rather than frozen, so the difficulty in
 * settings reaches a season already under way from the next event set up.
 * @param request Which round of which championship, and the player's car
 * @param content Installed content to resolve eligibility against
 * @param catalogue The class catalogue specs resolve against
 * @param offer What the install and settings can race in, for generated weather
 * @param base The player's AI difficulty, which every offset is laid over
 * @returns A race definition, ready for validateRace and planEvent
 * @throws When the round, entry or car cannot be raced
 */
export const roundRace = (
  request: RoundRaceRequest,
  content: Content,
  catalogue: ClassCatalogue = SHIPPED_CATALOGUE,
  offer: WeatherOffer = defaultWeatherOffer(content),
  base: AiBase = DEFAULT_OPPONENTS,
): RaceDefinition => {
  const { series, car } = request;
  const round = roundOf(series, request.round);
  const playerEntry = entryOf(series, request.entry);

  const format = formatOf(series, round);
  if (!format) {
    throw new AppError('series.format.unknown', {
      series: series.id,
      round: round.id,
      format: round.eventFormat ?? series.defaultEventFormat,
    });
  }

  // The player takes the last seat of their class, which is the one the
  // opponent list below leaves out - so they stand in the standings where that
  // seat does, and under its team.
  const playerSeat = playerEntry.seats[playerEntry.seats.length - 1];
  const allowed = eligibleCars(eligibilityFor(playerEntry, round), content, catalogue);
  if (!allowed.some((eligible) => eligible.id === car.model)) {
    throw new AppError('series.car.notEligible', { car: car.model, entry: playerEntry.name });
  }

  const frozen = request.field ?? drawField(series, playerEntry.id, content, catalogue);
  // Keyed on the seat alone, since validateSeries holds seat ids unique across
  // the championship.
  const field = new Map(frozen.map((one) => [one.seat, one]));

  const opponents: CarEntry[] = series.entries.flatMap((entry) => {
    const models = eligibleCars(eligibilityFor(entry, round), content, catalogue)
      .map((eligible) => eligible.id);
    if (models.length === 0) {
      throw new AppError('series.entry.noCars', { entry: entry.id });
    }

    const seats = aiSeats(entry, playerEntry.id);
    const offset = classOffset(series, entry, round);
    // This round's own draw, for a seat whose season car the round does not run.
    const drawn = pickModels(
      models,
      seats.length,
      randomFrom(seedFrom(`${series.id}:${round.id}:${entry.id}`)),
    );

    return seats.map((seat, index) => {
      const own = field.get(seat.id);
      const kept = own?.model !== undefined && models.includes(own.model) ? own.model : undefined;
      const model = kept ?? drawn[index];

      return {
        model,
        skin: kept === undefined ? undefined : seatSkin(content, model, own?.skin),
        driver: seat.driver?.name,
        ...nationOf(series, seat),
        // Carried so the result can be scored. Nothing between here and the
        // launch reads them - see the note on CarEntry.seat.
        seat: seat.id,
        entry: entry.id,
        team: seat.team,
        ...bopFor(entry, model),
        // Offset per class rather than across the field, so a slower class's
        // drivers are as good as anyone's and only their cars are slower.
        aiLevel: aiFigure(base.strength, offset.strength, own?.strength ?? seat.strength ?? 0),
        aiAggression: aiFigure(
          base.aggression,
          offset.aggression,
          own?.aggression ?? seat.aggression ?? 0,
        ),
      };
    });
  });

  // Laps from the track as installed, so a race of 305 km is 305 km on the
  // user's own version of the circuit too.
  const lap = findLayout(content, round.track)?.lengthM ?? null;
  const stated = roundSessions(format, round);
  const sessions = withDistancesInLaps(stated, lap);
  if (!sessions) {
    const race = stated.find((session) => session.distance !== undefined);
    throw new AppError('series.distance.unresolved', {
      series: series.id,
      round: round.id,
      session: race?.name ?? 'race',
      distance: race?.distance ?? 0,
    });
  }

  const climate = climateOf(series, round);
  // Without rain, wet weather runs as the nearest dry on offer: the forecast
  // through the offer, and what the round and its sessions author dried here.
  const rain = request.rain ?? rainAllowed(series);
  const presets = rain ? null : new Map(content.weather.map((preset) => [preset.id, preset.type]));
  const dryTypes = dryOffer(offer).types;
  const dry = (conditions: Conditions | undefined): Conditions | undefined => (
    presets ? withoutRain(conditions, dryTypes, (preset) => presets.get(preset) ?? null) : conditions
  );
  const raced = sessions.map((session) => (
    session.conditions === undefined ? session : { ...session, conditions: dry(session.conditions) }
  ));

  return {
    id: roundRaceId(series.id, round.id),
    name: `${series.name} - ${round.name}`,
    track: round.track,
    playerCar: {
      model: car.model,
      skin: car.skin,
      seat: playerSeat?.id,
      entry: playerEntry.id,
      team: playerSeat?.team,
      ...bopFor(playerEntry, car.model),
    },
    grid: { size: opponents.length + 1, opponents },
    // A draw the career already issued is substituted rather than redrawn, so
    // the weather raced is the weather forecast however long ago it was shown.
    sessions: climate === null
      ? raced
      : applyForecast(raced, request.draw
        ? offerForecast(request.draw, offer, rain)
        : forecastRound(series.id, round, format, climate, offer, {}, rain)),
    conditions: dry(round.conditions),
    assists: regulatedOnly(series.regulations?.assists),
    penalties: series.regulations?.penalties,
    jumpStartPenalty: series.regulations?.jumpStartPenalty,
    allowedTyresOut: series.regulations?.allowedTyresOut,
    // What each launch records as the strength it raced at, since the base and
    // the player's steps may move before the next one - for a class with AI in it.
    classStrength: Object.fromEntries(series.entries
      .filter((entry) => aiSeats(entry, playerEntry.id).length > 0)
      .map((entry) => [entry.id, aiFigure(base.strength, classOffset(series, entry, round).strength)])),
    // The championship lists its classes fastest first, which is how a grid
    // keeping them apart stands them.
    ...(series.entries.length > 1 ? { classOrder: series.entries.map((entry) => entry.id) } : {}),
    aiBase: base.strength,
  };
};

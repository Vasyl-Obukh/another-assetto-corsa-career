// Helpers behind reading a championship: resolving what overrides what, and
// composing the field a round is raced against.

import { DEFAULT_SERIES_GRID } from './constants.ts';
import { DEFAULT_MIN_MODELS, MAX_WEEKEND_DAYS, MIN_REVERSED } from '../../shared/constants/index.ts';
import { AppError, appErrorInfo } from '../../shared/errors/index.ts';
import type { AppErrorInfo } from '../../shared/errors/index.ts';
import { ContentSource } from '../../shared/types/index.ts';
import type {
  BopEntry,
  Car,
  Championship,
  ClassCatalogue,
  ClassEntry,
  Climate,
  Content,
  ContentProvenance,
  DLCPack,
  Eligibility,
  EntryAvailability,
  ModDistributor,
  ModMaker,
  RequirementPool,
  Round,
  RoundAvailability,
  RoundRaceLength,
  RoundSessionLength,
  SeriesGrid,
  SeriesRequirements,
  SeriesSession,
  Track,
  WeekendFormat,
} from '../../shared/types/index.ts';
import { specCars } from '../../shared/utils/car-classes/index.ts';
import { poolHolds } from '../../shared/utils/content-sources/index.ts';
import { carsOf } from '../../shared/utils/eligibility/index.ts';
import { carProvenance, trackProvenance } from '../content-catalogue/index.ts';
import type { RoundSpan } from '../season-calendar/index.ts';
import { shuffle } from '../seeded-random/index.ts';

/**
 * The id the race a round lowers into carries.
 *
 * One function because `roundRace` stamps it and the series store matches it
 * back to find a live weekend's championship - composed differently, the
 * editor's lock would silently stop catching. Each half is URI-encoded around
 * a `/`, so no two pairs compose the same id: joined with a hyphen, series
 * `gt3` round `sprint-r1` and series `gt3-sprint` round `r1` were one string.
 * An id of the usual `[a-z0-9-]` shape encodes to itself.
 * @param series The championship's id
 * @param round The round's id
 * @returns The RaceDefinition id for that round
 */
export const roundRaceId = (series: string, round: string): string => (
  `${encodeURIComponent(series)}/${encodeURIComponent(round)}`
);

/**
 * Finds a class entry by its id.
 * @param series The championship to look in
 * @param id The class entry's id
 * @returns The class entry
 * @throws When the championship has no entry with that id
 */
export const entryOf = (series: Championship, id: string): ClassEntry => {
  const entry = series.entries.find((candidate) => candidate.id === id);
  if (!entry) throw new AppError('series.entry.notFound', { series: series.id, entry: id });

  return entry;
};

/**
 * Finds a round by its id.
 * @param series The championship to look in
 * @param id The round's id
 * @returns The round
 * @throws When the championship has no round with that id
 */
export const roundOf = (series: Championship, id: string): Round => {
  const round = series.rounds.find((candidate) => candidate.id === id);
  if (!round) throw new AppError('series.round.notFound', { series: series.id, round: id });

  return round;
};

/**
 * Reads what a class entry may be driven in at one round.
 *
 * The round's override where it has one, since some fields change car with the
 * track; the class entry's own rule otherwise.
 * @param entry The class entry
 * @param round The round being raced, or undefined for the season-long rule
 * @returns The eligibility that applies
 */
export const eligibilityFor = (entry: ClassEntry, round?: Round): Eligibility => (
  round?.eligibility?.find((override) => override.entry === entry.id)?.eligibility
  ?? entry.eligibility
);

/**
 * How many distinct models an eligibility rule needs installed to be raceable.
 *
 * A car list needs all of them, since a one-make series' cars are the series. A
 * spec needs enough of its grid to be a grid, and never none - a spec nobody
 * races in is not satisfied by owning nothing.
 * @param eligibility The rule to read
 * @param catalogue The class catalogue a spec resolves against
 * @returns The number of installed models required
 */
export const minModelsOf = (eligibility: Eligibility, catalogue: ClassCatalogue): number => (
  eligibility.kind === 'cars'
    ? eligibility.cars.length
    : Math.max(1, Math.min(
      eligibility.minModels ?? DEFAULT_MIN_MODELS,
      specCars(eligibility.spec, catalogue).length,
    ))
);

/**
 * Reads the balance of performance a class entry applies to one car.
 * @param entry The class entry
 * @param car Car folder ID
 * @returns Its ballast and restrictor, both zero when the entry balances nothing
 */
export const bopFor = (entry: ClassEntry, car: string): Required<Omit<BopEntry, 'car'>> => {
  const bop = entry.bop?.find((candidate) => candidate.car === car);

  return { ballast: bop?.ballast ?? 0, restrictor: bop?.restrictor ?? 0 };
};

/**
 * Drops the keys a partial grid left undefined.
 *
 * Needed because a bare spread of a grid holding `aiLevel: undefined` would
 * overwrite the value below it with nothing rather than deferring to it.
 * @param grid The partial figures, or undefined
 * @returns The same figures with every undefined key removed
 */
const definedGrid = (grid: SeriesGrid | undefined): SeriesGrid => {
  if (!grid) return {};

  return Object.fromEntries(Object.entries(grid).filter(([, value]) => value !== undefined));
};

/**
 * Reads the AI strength one class entry races at.
 *
 * The class entry's own figures over the championship's over the defaults,
 * field by field, so a GT3 class a tier below the prototypes can be slower
 * without restating the whole band.
 * @param series The championship
 * @param entry The class entry
 * @returns Every AI figure, with nothing left to default later
 */
export const entryGrid = (series: Championship, entry: ClassEntry): Required<SeriesGrid> => ({
  ...DEFAULT_SERIES_GRID,
  ...definedGrid(series.grid),
  ...definedGrid(entry.grid),
});

/**
 * How many cars a championship puts on the grid.
 * @param series The championship
 * @returns The sum of every class entry's seats
 */
export const fieldSize = (series: Championship): number => series.entries.reduce(
  (total, entry) => total + entry.seats.length,
  0,
);

/**
 * Reads the livery a seat is pinned to, when the library actually has it.
 *
 * A shipped championship names none, and one a user pinned may have been
 * authored against a different release of the same mod - so a livery that is
 * not installed falls back to automatic assignment rather than writing a SKIN
 * key Assetto Corsa cannot resolve.
 * @param content Installed content to check against
 * @param model The car folder ID the seat ended up with
 * @param skin The skin folder ID the seat asks for, if any
 * @returns The skin, or undefined when it is not installed on that car
 */
export const seatSkin = (
  content: Content,
  model: string,
  skin: string | undefined,
): string | undefined => {
  if (skin === undefined) return undefined;
  const car = content.cars.find((candidate) => candidate.id === model);

  return car?.skins.some((candidate) => candidate.id === skin) ? skin : undefined;
};

/**
 * The climate a round's weather is generated from.
 * @param series The championship
 * @param round The round being raced
 * @returns The round's own climate, the championship's otherwise, or null when
 * the championship does not generate its weather
 */
export const climateOf = (series: Championship, round: Round): Climate | null => (
  series.generatedWeather ? round.climate ?? series.generatedWeather.climate : null
);

/**
 * Reads the weekend format a round is run over.
 *
 * Null rather than a fallback to the first format when the id resolves to
 * nothing: an unresolvable id is an authoring mistake, validateSeries reports
 * it as one, and racing whichever format happened to be written first is
 * exactly the silent wrong answer this project prefers to fail on.
 * @param series The championship
 * @param round The round being raced
 * @returns The format the round names, the championship's default otherwise,
 * or null when neither id resolves
 */
export const formatOf = (
  series: Championship,
  round: Round,
): WeekendFormat | null => {
  const wanted = round.weekendFormat ?? series.defaultWeekendFormat;

  return series.weekendFormats.find((format) => format.id === wanted) ?? null;
};

/**
 * How long each round's weekend runs, for dating a season.
 *
 * The adapter between a championship and src/core/season-calendar/, which is
 * deliberately three numbers per round rather than a document: the race is what
 * gets anchored to a Sunday, so a weekend's opening day is found by counting
 * back from it. A round whose format cannot be resolved falls back to a
 * single-day weekend, because validateSeries reports the missing format and a
 * calendar still has to be drawable.
 * @param series The championship
 * @returns One span per round, in calendar order
 */
export const roundSpans = (series: Championship): RoundSpan[] => series.rounds.map((round) => {
  const format = formatOf(series, round);
  const sessions = format?.sessions ?? [];
  const days = sessions.reduce((most, session) => Math.max(most, session.day ?? 0), 0) + 1;
  // The last race of the weekend is the one that ends it, so that is what falls
  // on the Sunday: a sprint weekend's Saturday sprint counts back from it.
  const races = sessions.filter((session) => session.type === 'race');
  const raceDayOffset = races.length
    ? races.reduce((last, session) => Math.max(last, session.day ?? 0), 0)
    : days - 1;

  return { id: round.id, days, raceDayOffset };
});

/**
 * Which of laps, minutes and distance a session or a round's override states.
 * @param length The session or the override
 * @returns The ones it states, with their values
 */
const lengthsOf = (
  length: Pick<RoundSessionLength, 'laps' | 'minutes' | 'distance'>,
): { unit: 'laps' | 'minutes' | 'distance'; value: number }[] => (
  (['laps', 'minutes', 'distance'] as const)
    .filter((unit) => length[unit] !== undefined)
    .map((unit) => ({ unit, value: length[unit] as number }))
);

/**
 * Checks that a length states one unit, of a positive amount, and a distance
 * only on a race.
 * @param length The session or the round's override
 * @param type What kind of session it measures
 * @param where The message's series, format and session
 * @returns One entry per rule broken
 */
export const validateLength = (
  length: Pick<RoundSessionLength, 'laps' | 'minutes' | 'distance'>,
  type: SeriesSession['type'],
  where: { series: string; format: string; session: string },
): AppErrorInfo[] => {
  const problems: AppErrorInfo[] = [];
  const stated = lengthsOf(length);

  // Two lengths would race whichever the lowering happened to read first.
  if (stated.length > 1) problems.push(appErrorInfo('series.length.conflict', where));
  stated
    .filter(({ value }) => !(Number.isFinite(value) && value > 0))
    .forEach(({ unit, value }) => {
      problems.push(appErrorInfo('series.length.invalid', { ...where, length: value, unit }));
    });
  if (length.distance !== undefined && type !== 'race') {
    problems.push(appErrorInfo('series.distance.onNonRace', where));
  }
  // Assetto Corsa reads DURATION_MINUTES for practice and qualifying and
  // RACE_LAPS for a race; a timed race is a server's. Driven: a race sent as
  // three minutes and no laps let the player carry on past the clock while the
  // AI parked in the pits.
  if (length.minutes !== undefined && type === 'race') {
    problems.push(appErrorInfo('series.race.timed', where));
  }

  return problems;
};

/**
 * A round's sessions: its format's, with the lengths the round replaces.
 *
 * An override replaces the session's length outright rather than merging
 * with it, so a race of 305 km given 78 laps is 78 laps and nothing else.
 * @param format The format the round runs
 * @param round The round
 * @returns The sessions it runs, still carrying any distance
 */
export const roundSessions = (format: WeekendFormat, round: Round): SeriesSession[] => (
  format.sessions.map((session) => {
    const own = round.sessionLengths?.find((one) => one.session === session.id);
    if (!own) return session;

    return {
      ...session, laps: own.laps, minutes: own.minutes, distance: own.distance,
    };
  })
);

/**
 * How many laps cover a distance: the fewest that reach it, which is how a
 * grand prix's distance is turned into laps.
 * @param distance The distance in kilometres
 * @param lap The length of a lap in metres
 * @returns The lap count
 */
export const lapsFor = (distance: number, lap: number): number => (
  // Short of an exact multiple by a rounding error is still that multiple.
  Math.max(1, Math.ceil((distance * 1000) / lap - 1e-9))
);

/**
 * Turns every distance among a round's sessions into laps.
 * @param sessions The round's sessions
 * @param lap The track's lap length in metres, or null when it is not known
 * @returns The sessions measured in laps, or null when a distance cannot be
 *   turned into laps for want of the lap length
 */
export const withDistancesInLaps = (
  sessions: readonly SeriesSession[],
  lap: number | null,
): SeriesSession[] | null => {
  if (lap === null && sessions.some((session) => session.distance !== undefined)) return null;

  return sessions.map((session) => {
    if (session.distance === undefined || lap === null) return session;

    const { distance, ...rest } = session;

    return { ...rest, laps: lapsFor(distance, lap) };
  });
};

/**
 * How long each race of a round runs, for the calendar to say.
 * @param sessions The round's sessions
 * @param lap The track's lap length in metres, or null when it is not known
 * @returns One per race measured in laps or distance, in weekend order
 */
export const raceLengths = (
  sessions: readonly SeriesSession[],
  lap: number | null,
): RoundRaceLength[] => sessions
  .filter((session) => session.type === 'race'
    && (session.laps !== undefined || session.distance !== undefined))
  .map((session) => {
    const name = session.name ?? null;
    if (session.distance === undefined) return { name, laps: session.laps ?? null };

    return {
      name,
      laps: lap === null ? null : lapsFor(session.distance, lap),
      distance: session.distance,
    };
  });

/**
 * Fills a class's share of the grid from the models it may use.
 *
 * Round-robin rather than random draw, so a class of twelve over five models
 * gets an even spread instead of five of one and one of another; then shuffled,
 * so the field is not ABCDEABCDE down the entry list. Both steps run off the
 * supplied generator, so the same round composes the same field every time.
 * @param models The installed models the class may use
 * @param count How many cars to field
 * @param random A seeded generator
 * @returns One model per car, in entry-list order
 */
export const pickModels = (
  models: readonly string[],
  count: number,
  random: () => number,
): string[] => {
  const drawn = Array.from({ length: count }, (unused, index) => models[index % models.length]);

  return shuffle(drawn, random);
};

/**
 * The installed cars an eligibility rule allows.
 *
 * Ordered by the catalogue rather than by display name, so composing a field
 * does not change when a mod is renamed.
 * @param eligibility The rule to resolve
 * @param content Installed content to resolve against
 * @param catalogue The class catalogue a spec resolves against
 * @returns The cars, in the order a field should draw from them
 */
export const eligibleCars = (
  eligibility: Eligibility,
  content: Content,
  catalogue: ClassCatalogue,
): Car[] => {
  const installed = new Map(content.cars.map((car) => [car.id, car]));

  return carsOf(eligibility, catalogue)
    .map((id) => installed.get(id))
    // A car with no liveries cannot be raced - buildGrid throws on it - so it
    // counts as missing rather than as an entry nobody can see.
    .filter((car): car is Car => car !== undefined && car.skins.length > 0);
};

/**
 * Finds the IDs that appear more than once in a list.
 * @param ids The IDs to check
 * @returns Each repeated ID, once
 */
export const duplicates = (ids: readonly string[]): string[] => [...new Set(
  ids.filter((id, index) => ids.indexOf(id) !== index),
)];

/**
 * Checks one weekend format's day offsets and sessions.
 *
 * The day-of-week rule is an approximation until Phase 5 gives a round a date:
 * a three-day weekend opens on Friday by convention, so a race on its first day
 * is the "never Friday" rule as far as it can be expressed here.
 * @param series The championship the format belongs to, for the message
 * @param format The weekend format to check
 * @returns One entry per rule broken
 */
export const validateFormat = (
  series: Championship,
  format: WeekendFormat,
): AppErrorInfo[] => {
  const problems: AppErrorInfo[] = [];
  const { sessions } = format;
  // Every message names the format as well as the series: a championship holds
  // several, so "the weekend format of gt3-sprint-series" identifies nothing.
  const where = { series: series.id, format: format.id };

  if (sessions.length === 0) {
    problems.push(appErrorInfo('series.sessions.empty', where));

    return problems;
  }

  const days = sessions.map((session) => session.day ?? 0);
  const span = Math.max(...days) + 1;

  if (span > MAX_WEEKEND_DAYS) {
    problems.push(appErrorInfo('series.days.tooMany', {
      ...where, days: span, max: MAX_WEEKEND_DAYS,
    }));
  }
  for (let day = 0; day < span; day += 1) {
    if (!days.includes(day)) {
      problems.push(appErrorInfo('series.days.gapped', { ...where, day }));
    }
  }

  duplicates(sessions
    .map((session) => session.id)
    .filter((id): id is string => id !== undefined))
    .forEach((id) => {
      problems.push(appErrorInfo('series.id.duplicate', { series: series.id, kind: 'session', id }));
    });

  sessions.forEach((session, index) => {
    const name = session.name ?? session.type;
    if (index > 0 && days[index] < days[index - 1]) {
      problems.push(appErrorInfo('series.days.outOfOrder', { ...where, session: name }));
    }
    if (session.type === 'race' && days[index] === 0 && span === MAX_WEEKEND_DAYS) {
      problems.push(appErrorInfo('series.race.onOpeningDay', where));
    }
    // The grid comes from qualifying or from the ladder, and prepareLaunch
    // writes it - so an authored one is overwritten with nothing said.
    if (session.startingPosition !== undefined) {
      problems.push(appErrorInfo('series.startingPosition.authored', { ...where, session: name }));
    }
    if (session.inherit) {
      const { from, top, reverse } = session.inherit;
      const source = sessions.findIndex((candidate) => candidate.id === from);
      const isRace = session.type === 'race';

      if (source < 0) {
        problems.push(appErrorInfo('series.inherit.unknown', { ...where, session: name, from }));
      } else if (source >= index) {
        problems.push(appErrorInfo('series.inherit.notEarlier', { ...where, session: name, from }));
      } else if (!(sessions[source].type === 'qualify' || (isRace && sessions[source].type === 'race'))) {
        // advanceWeekend classifies qualifying and races and nothing else, and a
        // race's finishing order means nothing to a qualifying session.
        problems.push(appErrorInfo('series.inherit.notQualifying', {
          ...where, session: name, from,
        }));
      }
      if (top !== undefined && top < 1) {
        problems.push(appErrorInfo('series.inherit.topInvalid', { ...where, session: name, top }));
      }
      // Past the size of the field it is clamped rather than refused, the way
      // top is, so a format written for thirty cars still runs on twelve.
      if (reverse !== undefined && (!isRace || reverse < MIN_REVERSED)) {
        problems.push(appErrorInfo('series.inherit.reverseInvalid', {
          ...where, session: name, reverse,
        }));
      }
    }
    problems.push(...validateLength(session, session.type, { ...where, session: name }));
    if (session.pointsSystem !== undefined) {
      // Only a race scores, so a system named anywhere else is a reference
      // nothing will ever follow - worth saying now rather than in Phase 5.
      if (session.type !== 'race') {
        problems.push(appErrorInfo('series.points.onNonRace', { ...where, session: name }));
      }
      if (!series.pointsSystems.some((points) => points.id === session.pointsSystem)) {
        problems.push(appErrorInfo('series.points.unknown', {
          ...where, session: name, points: session.pointsSystem,
        }));
      }
    }
  });

  return problems;
};

/**
 * Whether a figure is an amount of money the schema will accept.
 * @param amount The figure
 * @returns True when it is a real number of zero or more
 */
const isPayable = (amount: number): boolean => Number.isFinite(amount) && amount >= 0;

/**
 * Checks what a championship charges and what it pays out.
 *
 * Bounded from below only. What a series is worth is the author's business, and
 * a table that does not descend is a flat rate rather than a mistake - only a
 * negative one means nothing.
 * @param series The championship to check
 * @returns One entry per rule broken
 */
export const validateMoney = (series: Championship): AppErrorInfo[] => {
  const problems: AppErrorInfo[] = [];
  const where = { series: series.id };

  // A class paying its own names itself, so a bad table is not reported as
  // the championship's.
  const prizes: { table: string; amounts: readonly number[] | undefined }[] = [
    { table: 'round', amounts: series.prizes?.positions },
    { table: 'championship', amounts: series.prizes?.standings },
    ...series.entries.flatMap((entry) => [
      { table: `class ${entry.id} round`, amounts: entry.prizes?.positions },
      { table: `class ${entry.id} championship`, amounts: entry.prizes?.standings },
    ]),
  ];
  prizes.forEach(({ table, amounts }) => {
    amounts?.forEach((amount, index) => {
      if (!isPayable(amount)) {
        problems.push(appErrorInfo('series.prizes.invalid', {
          ...where, table, position: index + 1, amount,
        }));
      }
    });
  });

  // Each fee names where it lives: a negative one on round five of twenty is
  // otherwise reported as a number with nowhere to go and look for it.
  const fees = [
    { scope: 'the championship', fee: series.entryFee },
    ...series.rounds.map((round) => ({ scope: `round ${round.id}`, fee: round.entryFee })),
  ];
  fees.forEach(({ scope, fee }) => {
    if (fee !== undefined && !isPayable(fee)) {
      problems.push(appErrorInfo('series.entryFee.invalid', { ...where, scope, amount: fee }));
    }
  });

  return problems;
};

/**
 * Checks one class entry against the installed content.
 * @param entry The class entry
 * @param content Installed content to check against
 * @param catalogue The class catalogue a spec resolves against
 * @param round The round being checked, when its eligibility overrides the entry's
 * @returns What it can field and whether that is enough
 */
export const availabilityOf = (
  entry: ClassEntry,
  content: Content,
  catalogue: ClassCatalogue,
  round?: Round,
): EntryAvailability => {
  const eligibility = eligibilityFor(entry, round);
  const installed = eligibleCars(eligibility, content, catalogue);
  const have = new Set(installed.map((car) => car.id));

  return {
    entry: entry.id,
    eligible: installed.map((car) => car.id),
    // A spec is satisfied by whichever of its grid the user owns, so nothing it
    // does not name is "missing"; a car list names the series itself, so every
    // absence is.
    missing: eligibility.kind === 'cars'
      ? eligibility.cars
        .filter((car) => !have.has(car))
        .map((car) => ({ id: car, provenance: carProvenance(car) }))
      : [],
    enough: installed.length >= minModelsOf(eligibility, catalogue),
  };
};

/**
 * Finds the installed layout a round runs on.
 * @param content Installed content
 * @param track The track and layout the round names
 * @returns The layout, or undefined when it is not installed
 */
export const findLayout = (content: Content, track: Round['track']): Track | undefined => content.tracks
  .find((layout) => layout.id === track.id && layout.layout === (track.layout ?? ''));

/**
 * Describes the layout a round needs but the library does not have.
 * @param round The round
 * @returns The missing layout, named through the provenance catalogue
 */
export const missingTrack = (round: Round): RoundAvailability['track'] => {
  const layout = round.track.layout ?? '';

  return {
    key: layout ? `${round.track.id}/${layout}` : round.track.id,
    id: round.track.id,
    layout,
    provenance: trackProvenance(round.track.id, layout),
  };
};

/**
 * Works out what owning a championship's content amounts to.
 * @param series The championship
 * @param catalogue The class catalogue a spec resolves against
 * @returns The sources, packs and mod makers its cars need, where its rounds'
 * circuits come from, and what only widens its field
 */
export const requirementsOf = (series: Championship, catalogue: ClassCatalogue): SeriesRequirements => {
  // Assetto Corsa itself, which is all a championship of base cars needs now
  // that a round's circuit is never needed.
  const sources = new Set<ContentSource>([ContentSource.BASE]);
  const packs = new Set<DLCPack>();
  const makers = new Set<ModMaker>();
  const reachedPacks = new Set<DLCPack>();
  const reachedMakers = new Set<ModMaker>();
  const roundPacks = new Set<DLCPack>();
  const roundMakers = new Set<ModMaker>();
  const roundDistributors = new Set<ModDistributor>();
  const pools: RequirementPool[] = [];

  const need = (provenance: ContentProvenance): void => {
    sources.add(provenance.source);
    if (provenance.pack) packs.add(provenance.pack);
    if (provenance.maker) makers.add(provenance.maker);
  };

  // A car list needs every car it names; a spec needs only enough of its grid,
  // so its cars are pooled and what they reach is recorded apart.
  const rule = (eligibility: Eligibility): void => {
    if (eligibility.kind === 'cars') {
      eligibility.cars.forEach((car) => need(carProvenance(car)));
      return;
    }

    const cars = specCars(eligibility.spec, catalogue).map((car) => {
      const { pack, maker } = carProvenance(car);
      if (pack) reachedPacks.add(pack);
      if (maker) reachedMakers.add(maker);
      return { pack, maker };
    });
    pools.push({ minModels: minModelsOf(eligibility, catalogue), cars });
  };

  series.entries.forEach((entry) => rule(entry.eligibility));
  // A circuit is never needed: missing one costs that round and no other, so
  // where it comes from is recorded for the rounds alone.
  series.rounds.forEach((round) => {
    const { pack, maker, distributor } = trackProvenance(round.track.id, round.track.layout ?? '');
    if (pack) roundPacks.add(pack);
    if (maker) roundMakers.add(maker);
    if (distributor) roundDistributors.add(distributor);
    round.eligibility?.forEach((override) => rule(override.eligibility));
  });

  // A source a spec cannot keep its floor without is needed after all - a mod
  // chassis in twenty liveries is a spec only that mod can fill.
  pools.forEach((pool) => pool.cars.forEach(({ pack, maker }) => {
    if (pack && !poolHolds(pool, { packs: [pack], makers: [] })) {
      packs.add(pack);
      sources.add(ContentSource.DLC);
    }
    if (maker && !poolHolds(pool, { packs: [], makers: [maker] })) {
      makers.add(maker);
      sources.add(ContentSource.MOD);
    }
  }));

  return {
    sources: [...sources],
    packs: [...packs],
    makers: [...makers],
    pools,
    rounds: {
      packs: [...roundPacks],
      makers: [...roundMakers],
      distributors: [...roundDistributors],
    },
    widenedBy: {
      packs: [...reachedPacks].filter((pack) => !packs.has(pack)),
      makers: [...reachedMakers].filter((maker) => !makers.has(maker)),
    },
  };
};

/**
 * Spreads one class's AI levels between its fastest and slowest.
 * @param top Skill of the fastest car in the class
 * @param bottom Skill of the slowest
 * @param index Position in the class, counting from zero
 * @param count How many cars the class fields
 * @returns The AI level for this car
 */
export const levelIn = (top: number, bottom: number, index: number, count: number): number => (
  count <= 1 ? top : Math.round(top - ((top - bottom) * index) / (count - 1))
);

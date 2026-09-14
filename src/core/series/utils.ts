// Helpers behind reading a championship: resolving what overrides what, and
// composing the field a round is raced against.

import { DEFAULT_SERIES_GRID } from './constants.ts';
import { DEFAULT_MIN_MODELS, MAX_WEEKEND_DAYS } from '../../shared/constants/index.ts';
import { AppError, appErrorInfo } from '../../shared/errors/index.ts';
import type { AppErrorInfo } from '../../shared/errors/index.ts';
import { ContentSource } from '../../shared/types/index.ts';
import type {
  BopEntry,
  Car,
  Championship,
  ClassCatalogue,
  ClassEntry,
  Content,
  DLCPack,
  Eligibility,
  EntryAvailability,
  ModMaker,
  Round,
  RoundAvailability,
  SeriesGrid,
  SeriesRequirements,
  Track,
  WeekendFormat,
} from '../../shared/types/index.ts';
import { specCars } from '../../shared/utils/car-classes/index.ts';
import { carsOf, fieldableCars } from '../../shared/utils/eligibility/index.ts';
import { carProvenance, trackProvenance } from '../content-catalogue/index.ts';
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
      const { from, top } = session.inherit;
      const source = sessions.findIndex((candidate) => candidate.id === from);

      if (source < 0) {
        problems.push(appErrorInfo('series.inherit.unknown', { ...where, session: name, from }));
      } else if (source >= index) {
        problems.push(appErrorInfo('series.inherit.notEarlier', { ...where, session: name, from }));
      } else if (sessions[source].type !== 'qualify') {
        // Only a qualifying leaves a classification behind for the next session
        // to follow; advanceWeekend records one for nothing else.
        problems.push(appErrorInfo('series.inherit.notQualifying', {
          ...where, session: name, from,
        }));
      }
      if (top !== undefined && top < 1) {
        problems.push(appErrorInfo('series.inherit.topInvalid', { ...where, session: name, top }));
      }
    }
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

  const prizes: { table: string; amounts: readonly number[] | undefined }[] = [
    { table: 'round', amounts: series.prizes?.positions },
    { table: 'championship', amounts: series.prizes?.standings },
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
 * @returns The sources, packs and mod makers it reaches
 */
export const requirementsOf = (series: Championship, catalogue: ClassCatalogue): SeriesRequirements => {
  const sources = new Set<ContentSource>();
  const packs = new Set<DLCPack>();
  const makers = new Set<ModMaker>();

  const record = (provenance: ReturnType<typeof carProvenance>): void => {
    sources.add(provenance.source);
    if (provenance.pack) packs.add(provenance.pack);
    if (provenance.maker) makers.add(provenance.maker);
  };

  series.entries.forEach((entry) => {
    fieldableCars(series, entry, catalogue).forEach((car) => record(carProvenance(car)));
  });
  series.rounds.forEach((round) => {
    record(trackProvenance(round.track.id, round.track.layout ?? ''));
  });

  return { sources: [...sources], packs: [...packs], makers: [...makers] };
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

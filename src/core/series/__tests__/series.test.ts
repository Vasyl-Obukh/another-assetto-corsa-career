import { describe, expect, it } from '@jest/globals';

import {
  DEFAULT_OPPONENTS, DRIVER_AGGRESSION_SPREAD, DRIVER_STRENGTH_SPREAD, WeatherType,
} from '../../../shared/constants/index.ts';
import { Climate, SeasonLength } from '../../../shared/types/index.ts';
import type {
  Championship, ClassEntry, Content, FieldSeat, Round, Seat, WeatherOffer,
} from '../../../shared/types/index.ts';
import { resolveCatalogue, SHIPPED_CATALOGUE } from '../../../shared/utils/car-classes/index.ts';
import { defaultWeatherOffer, drawRound, offerForecast } from '../../weather-forecast/index.ts';
import {
  drawField, formatOf, roundRace, seriesAvailability, seriesForecast, validateSeries,
} from '../series.ts';
import { makeContent, makeSeries } from './fixtures.ts';

/**
 * A static offer holding one dry and one wet weather, so a forecast is one
 * step per session and never depends on what the fixture content declares.
 */
const OFFER: WeatherOffer = { types: [WeatherType.CLEAR, WeatherType.RAIN], dynamic: false };

/**
 * A championship that generates its weather from an oceanic climate.
 * @returns The championship
 */
const generated = (): Championship => makeSeries({ generatedWeather: { climate: Climate.OCEANIC } });

/**
 * The codes validating a championship produced.
 * @param overrides What to change about a clean championship
 * @returns One code per problem
 */
const codesFor = (overrides: Partial<Championship> = {}): string[] => (
  validateSeries(makeSeries(overrides)).map((problem) => problem.code)
);

/**
 * A championship whose only class fields the given seats.
 * @param seats The seats to field
 * @param entry What else to change about the class entry
 * @returns The championship
 */
const withSeats = (seats: Seat[], entry: Partial<ClassEntry> = {}): Championship => {
  const base = makeSeries();

  return { ...base, entries: [{ ...base.entries[0], seats, ...entry }] };
};

/**
 * A championship whose only class races in a spec the user made.
 */
const USER_SPEC_SERIES = withSeats(
  [{ id: 'one' }, { id: 'two' }],
  { eligibility: { kind: 'spec', spec: 'user-spec' } },
);

/**
 * The layer of a user who made that spec and put the test car in it.
 */
const USER_CATALOGUE_LAYER = {
  version: 1,
  classes: [{ id: 'user-class', name: 'Hillclimb' }],
  specs: [{ id: 'user-spec', name: 'Hillclimb (2020s)', class: 'user-class' }],
  cars: { test_car: ['user-spec'] },
};

/**
 * The catalogue that layer resolves to.
 */
const USER_CATALOGUE = resolveCatalogue(USER_CATALOGUE_LAYER);

/**
 * A championship whose race is 10 km, with the given rounds.
 * @param rounds Its calendar
 * @returns The championship
 */
const byDistance = (rounds: readonly Round[] = makeSeries().rounds): Championship => makeSeries({
  rounds,
  eventFormats: [{
    id: 'standard',
    name: 'Standard',
    sessions: [
      { type: 'qualify', name: 'Qualifying', minutes: 10 },
      {
        id: 'race', type: 'race', name: 'Race', distance: 10, day: 0,
      },
    ],
  }],
});

/**
 * The fixture content, with Magione saying how long a lap of it is.
 * @param lengthM The lap length in metres
 * @returns The content
 */
const withLapOf = (lengthM: number): Content => {
  const content = makeContent();

  return {
    ...content,
    tracks: content.tracks.map((track) => (track.id === 'magione' ? { ...track, lengthM } : track)),
  };
};

describe('core/series', () => {
  describe('validateSeries', () => {
    /**
     * The codes validating a round with the given overrides produced.
     * @param sessionLengths The lengths the round replaces
     * @returns One code per problem
     */
    const lengthCodes = (sessionLengths: Round['sessionLengths']): string[] => {
      const series = byDistance();

      return validateSeries({ ...series, rounds: [{ ...series.rounds[0], sessionLengths }] })
        .map((problem) => problem.code);
    };

    it('reports an AI offset further than a championship may move the field', () => {
      expect(codesFor({ grid: { strength: 50 } })).toEqual(['series.grid.offsetOutOfRange']);
    });

    it('passes a round replacing its race\'s distance with a lap count', () => {
      expect(lengthCodes([{ session: 'race', laps: 12 }])).toEqual([]);
    });

    it('refuses a length for a session its format does not run', () => {
      expect(lengthCodes([{ session: 'sprint', laps: 12 }])).toEqual(['series.round.sessionUnknown']);
    });

    // Found in review: an override stating nothing stripped the format's length
    // off the race and left it running AC's default.
    it('refuses an override that states no length', () => {
      expect(lengthCodes([{ session: 'race' }])).toEqual(['series.round.lengthMissing']);
    });

    it('holds an override to the rules a format\'s own length follows', () => {
      expect(lengthCodes([{ session: 'race', laps: 12, distance: 10 }])).toEqual(['series.length.conflict']);
    });
  

    it('passes a championship with nothing wrong with it', () => {
      expect(codesFor()).toEqual([]);
    });

    /**
     * A calendar of the given size, every round on the same track.
     * @param count How many rounds to run
     * @returns The rounds
     */
    const calendarOf = (count: number): Round[] => Array.from({ length: count }, (unused, at) => ({
      id: `round-${at + 1}`, name: `Round ${at + 1}`, track: { id: 'magione' },
    }));

    // A race event is a week, so a season has room for as many rounds as it
    // has weeks - and the calendar would otherwise crowd two onto one event.
    it('refuses a season running more rounds than it has weeks', () => {
      expect(codesFor({ rounds: calendarOf(41) })).toEqual(['series.season.tooManyRounds']);
    });

    it('passes a season running exactly as many rounds as it has weeks', () => {
      expect(codesFor({ rounds: calendarOf(40) })).toEqual([]);
    });

    it('measures the room against the length the championship states, not the year', () => {
      expect(codesFor({ rounds: calendarOf(20), seasonLength: SeasonLength.QUARTER }))
        .toEqual(['series.season.tooManyRounds']);
      expect(codesFor({ rounds: calendarOf(10), seasonLength: SeasonLength.QUARTER })).toEqual([]);
    });

    // A championship authored before the selector existed states no length, and
    // every one of them meant a whole year.
    it('reads a championship stating no length as filling the year', () => {
      expect(codesFor({ rounds: calendarOf(41), seasonLength: undefined }))
        .toEqual(['series.season.tooManyRounds']);
    });

    it('refuses a class entry that fields nobody', () => {
      expect(validateSeries(withSeats([])).map((one) => one.code))
        .toEqual(['series.seats.empty']);
    });

    // Across the whole championship rather than within a class: a seat is what
    // a contract binds to and what standings will file a result under, and
    // neither is scoped to one class entry.
    it('refuses two seats sharing an id, even in different classes', () => {
      const base = makeSeries();
      const entry = base.entries[0];
      const twoClasses = {
        ...base,
        entries: [
          { ...entry, seats: [{ id: 'shared' }] },
          { ...entry, id: 'second', seats: [{ id: 'shared' }] },
        ],
      };

      expect(validateSeries(twoClasses).map((one) => one.code))
        .toEqual(['series.id.duplicate']);
    });

    it('refuses a seat fielded by a team the championship does not have', () => {
      expect(validateSeries(withSeats([{ id: 'one', team: 'ghost' }])).map((one) => one.code))
        .toEqual(['series.seat.teamUnknown']);
    });

    it('refuses two teams sharing an id', () => {
      const teams = [{ id: 'same', name: 'One' }, { id: 'same', name: 'Two' }];

      expect(codesFor({ teams })).toEqual(['series.id.duplicate']);
    });

    it('accepts a seat pinned to a car its class can field', () => {
      const seats = [{ id: 'one', car: { model: 'test_car' } }];

      expect(validateSeries(withSeats(seats)).map((one) => one.code)).toEqual([]);
    });

    it('refuses a seat pinned to a car its class cannot field', () => {
      const seats = [{ id: 'one', car: { model: 'ghost_car' } }];

      expect(validateSeries(withSeats(seats)).map((one) => one.code))
        .toEqual(['series.seat.carNotEligible']);
    });

    // A seat and a balanced car are both named for the season, and some fields
    // change car with the track - so a round that swaps the cars is what both
    // are allowed to reach for, not just the entry's own rule.
    it('lets a seat and a balance rule name a car only one round runs', () => {
      const base = withSeats(
        [{ id: 'one', car: { model: 'oval_car' } }],
        { bop: [{ car: 'oval_car', ballast: 20 }] },
      );
      const swapped: Championship = {
        ...base,
        rounds: [
          base.rounds[0],
          {
            id: 'oval',
            name: 'Oval',
            track: { id: 'magione' },
            eligibility: [{ entry: 'main', eligibility: { kind: 'cars', cars: ['oval_car'] } }],
          },
        ],
      };

      expect(validateSeries(swapped).map((one) => one.code)).toEqual([]);
    });

    it('names every rule broken rather than the first', () => {
      const seats = [{ id: 'one', team: 'ghost', car: { model: 'ghost_car' } }];

      expect(validateSeries(withSeats(seats)).map((one) => one.code))
        .toEqual(['series.seat.teamUnknown', 'series.seat.carNotEligible']);
    });

    it('carries the money rules, so a bad prize is a problem with the series', () => {
      expect(codesFor({ prizes: { positions: [-1] } })).toEqual(['series.prizes.invalid']);
    });

    it('resolves a spec against the catalogue it is handed', () => {
      expect(validateSeries(USER_SPEC_SERIES, USER_CATALOGUE)).toEqual([]);
    });

    // A championship exported from another machine names a spec only that
    // machine's layer holds, and "no cars" would send the user looking for a
    // missing mod rather than a missing spec.
    it('reports a spec the catalogue lacks as unknown rather than as fielding no cars', () => {
      expect(validateSeries(USER_SPEC_SERIES).map((one) => one.code)).toEqual(['series.spec.unknown']);
    });

    // An unknown spec inside a round override used to index the shipped table
    // to undefined and throw, rather than being reported at all.
    it('reports a spec a round swaps to that the catalogue lacks', () => {
      const base = makeSeries();
      const swapped: Championship = {
        ...base,
        rounds: [{
          ...base.rounds[0],
          eligibility: [{ entry: 'main', eligibility: { kind: 'spec', spec: 'ghost-spec' } }],
        }],
      };

      expect(validateSeries(swapped).map((one) => one.code)).toEqual(['series.round.specUnknown']);
    });
  });

  describe('seriesAvailability', () => {
    it('says how many laps each race comes to on the installed track', () => {
      const availability = seriesAvailability(byDistance(), withLapOf(2500), SHIPPED_CATALOGUE);

      expect(availability.rounds[0].races).toEqual([{ name: 'Race', laps: 4, distance: 10 }]);
      expect(availability.available).toBe(true);
    });

    it('cannot race a distance on a track that does not say how long a lap is', () => {
      const availability = seriesAvailability(byDistance(), makeContent(), SHIPPED_CATALOGUE);

      expect(availability.rounds[0].races).toEqual([{ name: 'Race', laps: null, distance: 10 }]);
      expect(availability.available).toBe(false);
    });

    // A circuit is one round's: missing it costs that round and no other.
    it('stays available while at least one round can be raced', () => {
      const rounds = [
        { id: 'magione', name: 'Magione', track: { id: 'magione' } },
        { id: 'elsewhere', name: 'Elsewhere', track: { id: 'not_installed' } },
      ];
      const availability = seriesAvailability(makeSeries({ rounds }), makeContent(), SHIPPED_CATALOGUE);

      expect(availability.rounds[1].track).not.toBeNull();
      expect(availability.available).toBe(true);
    });

    it('is unavailable once no round can be raced', () => {
      const rounds = [{ id: 'elsewhere', name: 'Elsewhere', track: { id: 'not_installed' } }];

      expect(seriesAvailability(makeSeries({ rounds }), makeContent(), SHIPPED_CATALOGUE).available).toBe(false);
    });

    it('counts the cars a user spec holds as what a class can field', () => {
      const availability = seriesAvailability(USER_SPEC_SERIES, makeContent(), USER_CATALOGUE);

      expect(availability.problems).toEqual([]);
      expect(availability.entries[0]).toMatchObject({ enough: true });
    });

    // A spec used to need three of its models before it read as raceable.
    it('races a spec on one installed model of a wider grid', () => {
      const wide = resolveCatalogue({
        ...USER_CATALOGUE_LAYER,
        cars: { test_car: ['user-spec'], absent_one: ['user-spec'], absent_two: ['user-spec'] },
      });
      const entry = seriesAvailability(USER_SPEC_SERIES, makeContent(), wide).entries[0];

      expect(entry).toMatchObject({ eligible: ['test_car'], missing: [], enough: true });
    });

    // Owning none of an empty grid is not owning enough of it.
    it('never reads a class as raceable on a spec with no cars', () => {
      const empty = resolveCatalogue({ ...USER_CATALOGUE_LAYER, cars: {} });

      expect(seriesAvailability(USER_SPEC_SERIES, makeContent(), empty).entries[0]).toMatchObject({ enough: false });
    });
  });

  describe('seriesForecast', () => {
    it('forecasts nothing for a championship that authors its weather', () => {
      expect(seriesForecast(makeSeries(), OFFER)).toEqual([]);
    });

    it('forecasts every round, each from its own climate where it names one', () => {
      const base = generated();
      const series = {
        ...base,
        rounds: [
          base.rounds[0],
          {
            id: 'magione-2', name: 'Magione again', track: { id: 'magione' }, climate: Climate.ARID,
          },
        ],
      };
      const forecast = seriesForecast(series, OFFER);

      expect(forecast.map((one) => [one.round, one.climate])).toEqual([
        ['magione', Climate.OCEANIC], ['magione-2', Climate.ARID],
      ]);
      forecast.forEach((one) => {
        expect(one.series).toBe('test-cup');
        expect(one.sessions).toHaveLength(1);
      });
    });

    it('draws only weather the offer holds', () => {
      seriesForecast(generated(), OFFER).forEach((round) => round.sessions.forEach((session) => {
        session.steps.forEach((step) => expect(OFFER.types).toContain(step.weather));
      }));
    });

    it('forecasts no rain for a championship that does not allow it', () => {
      seriesForecast({ ...generated(), rain: false }, OFFER).forEach((round) => round.sessions.forEach((session) => {
        session.steps.forEach((step) => expect(step.weather).toBe(WeatherType.CLEAR));
      }));
    });
  });

  describe('drawField', () => {
    /**
     * Draws the field of a championship with the player in its only class.
     * @param series The championship
     * @param salt The season's salt
     * @returns The frozen field
     */
    const draw = (series: Championship, salt = '') => drawField(
      series, 'main', makeContent(), SHIPPED_CATALOGUE, salt,
    );

    /**
     * A class of ten seats, enough that two draws cannot agree by chance.
     */
    const TEN = withSeats(Array.from({ length: 10 }, (unused, at) => ({ id: `seat-${at}` })));

    it('deals every AI seat a car and a livery, leaving the player\'s seat out', () => {
      const field = draw(makeSeries());

      expect(field.map((one) => one.seat)).toEqual(['main-1', 'main-2']);
      field.forEach((one) => {
        expect(one.model).toBe('test_car');
        expect(one.skin).toBeDefined();
      });
    });

    it('keeps every driver within a small spread of their class', () => {
      draw(TEN).forEach((one) => {
        expect(Math.abs(one.strength)).toBeLessThanOrEqual(DRIVER_STRENGTH_SPREAD);
        expect(Math.abs(one.aggression)).toBeLessThanOrEqual(DRIVER_AGGRESSION_SPREAD);
      });
    });

    it('draws the same field twice for the same season', () => {
      expect(draw(TEN, 'career\u00000')).toEqual(draw(TEN, 'career\u00000'));
    });

    it('draws another season its own drivers', () => {
      const offsets = (salt: string) => draw(TEN, salt).map((one) => one.strength);

      expect(offsets('career\u00000')).not.toEqual(offsets('career\u00001'));
    });

    it('takes a seat\'s own offsets over the spread it would have drawn', () => {
      const [star] = draw(withSeats([{ id: 'star', strength: 12, aggression: -8 }, { id: 'player' }]));

      expect(star).toMatchObject({ strength: 12, aggression: -8 });
    });

    it('honours a seat pinned to a car and livery the library has', () => {
      const seats = [{ id: 'one', car: { model: 'test_car', skin: 'green' } }, { id: 'player' }];

      expect(draw(withSeats(seats))[0]).toMatchObject({ model: 'test_car', skin: 'green' });
    });

    // Every round then draws its own, which is what an IndyCar season with
    // only its kits installed needs.
    it('leaves the car to each round when the championship\'s own cars are not installed', () => {
      const series = withSeats(
        [{ id: 'one' }, { id: 'player' }],
        { eligibility: { kind: 'cars', cars: ['ghost_car'] } },
      );
      const [one] = draw(series);

      expect(one.model).toBeUndefined();
      expect(one.skin).toBeUndefined();
    });
  });

  describe('roundRace', () => {
    it('runs a distance as the fewest laps of the installed track that cover it', () => {
      const race = roundRace(
        { series: byDistance(), entry: 'main', round: 'magione', car: { model: 'test_car' } },
        withLapOf(2400),
      );

      expect(race.sessions?.[1]).toMatchObject({ type: 'race', laps: 5 });
      expect(race.sessions?.[1]).not.toHaveProperty('distance');
    });

    it('runs the length a round gives its race over the format\'s', () => {
      const rounds = [{
        id: 'magione', name: 'Magione', track: { id: 'magione' }, sessionLengths: [{ session: 'race', laps: 3 }],
      }];
      const race = roundRace(
        { series: byDistance(rounds), entry: 'main', round: 'magione', car: { model: 'test_car' } },
        makeContent(),
      );

      expect(race.sessions?.[1]).toMatchObject({ laps: 3 });
    });

    it('refuses a distance on a track that does not say how long a lap is', () => {
      expect(() => roundRace(
        { series: byDistance(), entry: 'main', round: 'magione', car: { model: 'test_car' } },
        makeContent(),
      )).toThrow(expect.objectContaining({ code: 'series.distance.unresolved' }));
    });

    /**
     * Lowers the only round of a championship, with the player in its only class.
     * @param series The championship to lower
     * @returns The race definition
     */
    const lower = (series: Championship) => roundRace(
      { series, entry: 'main', round: 'magione', car: { model: 'test_car' } },
      makeContent(),
    );

    it('fields one car per seat, the player taking one of them', () => {
      const race = lower(makeSeries());

      expect(race.grid?.size).toBe(3);
      expect(race.grid?.opponents).toHaveLength(2);
    });

    // The last seat rather than the first, so a championship that named its
    // front-runners keeps them and gives up its tail-ender.
    it('gives the player the last seat of the class they enter', () => {
      const seats = [
        { id: 'one', driver: { name: 'Ahead' } },
        { id: 'two', driver: { name: 'Alongside' } },
        { id: 'three', driver: { name: 'Displaced' } },
      ];
      const drivers = lower(withSeats(seats)).grid?.opponents?.map((one) => one.driver);

      expect(drivers).toEqual(['Ahead', 'Alongside']);
    });

    it('carries a seat driver name and nation onto the grid, naming the nation from its code', () => {
      const seats = [
        { id: 'one', driver: { name: 'Ada Marchetti', nationCode: 'ITA' } },
        { id: 'two' },
      ];

      expect(lower(withSeats(seats)).grid?.opponents?.[0]).toMatchObject({
        driver: 'Ada Marchetti', nationality: 'Italy', nationCode: 'ITA',
      });
    });

    // Left undefined rather than filled in here, so buildGrid's own naming is
    // what a championship with nothing to say about its field still gets.
    it('leaves a seat with no driver for buildGrid to name', () => {
      const opponent = lower(withSeats([{ id: 'one' }, { id: 'two' }])).grid?.opponents?.[0];

      expect(opponent?.driver).toBeUndefined();
    });

    it('takes a seat own strength over the spread its drivers draw', () => {
      const seats = [{ id: 'one', strength: 5 }, { id: 'two' }];

      expect(lower(withSeats(seats)).grid?.opponents?.[0].aiLevel)
        .toBe(DEFAULT_OPPONENTS.strength + 5);
    });

    it('gives a seat the livery it pins when that livery is installed', () => {
      const seats = [{ id: 'one', car: { model: 'test_car', skin: 'green' } }, { id: 'two' }];

      expect(lower(withSeats(seats)).grid?.opponents?.[0].skin).toBe('green');
    });

    // A user pins a livery against their own copy of a mod; the next release
    // may have renamed the folder, and automatic assignment beats a SKIN key
    // Assetto Corsa cannot resolve.
    it('drops a pinned livery the installed car does not have', () => {
      const seats = [{ id: 'one', car: { model: 'test_car', skin: 'chartreuse' } }, { id: 'two' }];

      // Assigned when the season's field is drawn, rather than left to buildGrid.
      expect(lower(withSeats(seats)).grid?.opponents?.[0].skin).not.toBe('chartreuse');
    });

    it('composes the same field every time, since the draw is seeded', () => {
      const series = makeSeries();

      expect(lower(series).grid?.opponents).toEqual(lower(series).grid?.opponents);
    });

    it('leaves the format sessions as they are when the weather is authored', () => {
      const series = makeSeries();

      expect(lower(series).sessions).toEqual(series.eventFormats[0].sessions);
    });

    // The race has to run exactly what the round's forecast showed.
    it('writes the generated forecast onto the sessions it races', () => {
      const series = generated();
      const race = roundRace(
        { series, entry: 'main', round: 'magione', car: { model: 'test_car' } },
        makeContent(),
        SHIPPED_CATALOGUE,
        OFFER,
      );
      const [forecast] = seriesForecast(series, OFFER);

      expect(race.sessions?.[0].conditions).toEqual(forecast.sessions[0].conditions);
      expect(race.sessions?.[0]).toMatchObject({ type: 'race', laps: 8 });
      expect(race.sessions?.[0].conditions?.weatherType).toBeDefined();
    });

    it('races a draw it is handed rather than drawing its own', () => {
      const series = generated();
      const [round] = series.rounds;
      const format = formatOf(series, round);
      if (!format) throw new Error('The fixture round has no format.');

      const draw = drawRound(series.id, round, format, Climate.OCEANIC, { salt: 'career-1' });
      const race = roundRace(
        {
          series, entry: 'main', round: round.id, car: { model: 'test_car' }, draw,
        },
        makeContent(),
        SHIPPED_CATALOGUE,
        OFFER,
      );

      expect(race.sessions?.[0].conditions)
        .toEqual(offerForecast(draw, OFFER).sessions[0].conditions);
    });

    it('races a draw dry when the career does not allow rain', () => {
      const series = generated();
      const [round] = series.rounds;
      const format = formatOf(series, round);
      if (!format) throw new Error('The fixture round has no format.');

      const draw = drawRound(series.id, round, format, Climate.OCEANIC, { salt: 'career-1' });
      const race = roundRace(
        {
          series, entry: 'main', round: round.id, car: { model: 'test_car' }, draw, rain: false,
        },
        makeContent(),
        SHIPPED_CATALOGUE,
        OFFER,
      );

      expect(race.sessions?.[0].conditions)
        .toEqual(offerForecast(draw, OFFER, false).sessions[0].conditions);
      expect(race.sessions?.[0].conditions?.weatherType).toBe(WeatherType.CLEAR);
    });

    /**
     * A championship whose round and race both author rain.
     * @param rain What the championship says of rain
     * @returns The championship
     */
    const authoredRain = (rain?: boolean): Championship => makeSeries({
      ...(rain === undefined ? {} : { rain }),
      rounds: [{
        id: 'magione', name: 'Magione', track: { id: 'magione' }, conditions: { weatherType: WeatherType.RAIN },
      }],
      eventFormats: [{
        id: 'standard',
        name: 'Standard',
        sessions: [{
          type: 'race',
          name: 'Race',
          laps: 8,
          day: 0,
          conditions: {
            weatherSteps: [
              { weather: WeatherType.CLEAR, minutes: 5 },
              { weather: WeatherType.HEAVY_RAIN, rain: 0.8 },
            ],
          },
        }],
      }],
    });

    /**
     * Lowers the authored-rain championship's round.
     * @param series The championship
     * @param rain What the career says of rain, if anything
     * @returns The race
     */
    const lowerAuthored = (series: Championship, rain?: boolean) => roundRace(
      {
        series, entry: 'main', round: 'magione', car: { model: 'test_car' }, ...(rain === undefined ? {} : { rain }),
      },
      makeContent(),
      SHIPPED_CATALOGUE,
      OFFER,
    );

    it('dries the weather a round and its sessions author when the championship allows no rain', () => {
      const race = lowerAuthored(authoredRain(false));

      expect(race.conditions?.weatherType).toBe(WeatherType.CLEAR);
      expect(race.sessions?.[0].conditions?.weatherSteps).toEqual([
        { weather: WeatherType.CLEAR, minutes: 5 },
        { weather: WeatherType.CLEAR, rain: 0 },
      ]);
    });

    it('races authored rain as authored where rain is allowed', () => {
      const series = authoredRain();
      const race = lowerAuthored(series);

      expect(race.conditions).toEqual(series.rounds[0].conditions);
      expect(race.sessions).toEqual(series.eventFormats[0].sessions);
    });

    it('lets the career allow rain a championship does not', () => {
      expect(lowerAuthored(authoredRain(false), true).conditions?.weatherType).toBe(WeatherType.RAIN);
    });

    it('races a named preset declaring rain as a dry type', () => {
      const content = makeContent();
      const series = makeSeries({
        rain: false,
        rounds: [{
          id: 'magione', name: 'Magione', track: { id: 'magione' }, conditions: { weather: 'career_rain' },
        }],
      });
      const race = roundRace(
        { series, entry: 'main', round: 'magione', car: { model: 'test_car' } },
        {
          ...content,
          weather: [{
            id: 'career_rain',
            name: 'Rain',
            type: WeatherType.RAIN,
            temperatureCoeff: 1,
            author: null,
            timeDiapason: null,
            cloudCover: 1,
            rain: null,
            forceHeadlights: false,
          }],
        },
        SHIPPED_CATALOGUE,
        OFFER,
      );

      expect(race.conditions).toEqual({ weatherType: WeatherType.CLEAR });
    });

    it('fields a class out of a user spec, given the catalogue that holds it', () => {
      const race = roundRace(
        { series: USER_SPEC_SERIES, entry: 'main', round: 'magione', car: { model: 'test_car' } },
        makeContent(),
        USER_CATALOGUE,
      );

      expect(race.grid?.opponents?.map((one) => one.model)).toEqual(['test_car']);
    });

    /**
     * Lowers the only round of a championship over the field and base given.
     * @param series The championship
     * @param field The frozen field, if any
     * @param base The difficulty in settings
     * @returns The race definition
     */
    const lowerWith = (
      series: Championship,
      field?: FieldSeat[],
      base = DEFAULT_OPPONENTS,
    ) => roundRace(
      {
        series, entry: 'main', round: 'magione', car: { model: 'test_car' }, field,
      },
      makeContent(),
      SHIPPED_CATALOGUE,
      defaultWeatherOffer(makeContent()),
      base,
    );

    it('races the car, livery and offsets the season froze', () => {
      const field: FieldSeat[] = [
        {
          seat: 'main-1', model: 'test_car', skin: 'green', strength: 2, aggression: -3,
        },
        {
          seat: 'main-2', model: 'test_car', skin: 'blue', strength: -1, aggression: 4,
        },
      ];
      const [first] = lowerWith(makeSeries(), field).grid?.opponents ?? [];

      expect(first).toMatchObject({
        model: 'test_car',
        skin: 'green',
        aiLevel: DEFAULT_OPPONENTS.strength + 2,
        aiAggression: DEFAULT_OPPONENTS.aggression - 3,
      });
    });

    it('lays the difficulty in settings under every offset', () => {
      const base = makeSeries({ grid: { strength: 5, aggression: 10 } });
      const series = {
        ...base,
        entries: [{ ...base.entries[0], grid: { strength: -2 } }],
        rounds: [{ ...base.rounds[0], grid: { strength: 1 } }],
      };
      const field: FieldSeat[] = [{ seat: 'main-1', model: 'test_car', strength: 1, aggression: 0 }];
      const [first] = lowerWith(series, field, { strength: 70, aggression: 20 }).grid?.opponents ?? [];

      expect(first).toMatchObject({ aiLevel: 75, aiAggression: 30 });
    });

    it('records the strength every class races at, before any driver adds their own', () => {
      const base = makeSeries({ grid: { strength: 5 } });
      const series = {
        ...base,
        entries: [
          { ...base.entries[0], grid: { strength: -2 } },
          { ...base.entries[0], id: 'second', name: 'Second', grid: { strength: 3 } },
        ],
        rounds: [{ ...base.rounds[0], grid: { strength: 1 } }],
      };
      const field: FieldSeat[] = [{ seat: 'main-1', model: 'test_car', strength: 2, aggression: 0 }];

      expect(lowerWith(series, field, { strength: 70, aggression: 20 }).classStrength)
        .toEqual({ main: 74, second: 79 });
    });

    it('records no strength for a class with no AI in it', () => {
      const base = makeSeries();
      const series = {
        ...base,
        entries: [
          { ...base.entries[0], seats: [{ id: 'main-1' }] },
          { ...base.entries[0], id: 'second', name: 'Second' },
        ],
      };

      expect(lowerWith(series).classStrength).toEqual({ second: DEFAULT_OPPONENTS.strength });
    });

    it('carries the order the championship lists its classes in, fastest first', () => {
      const base = makeSeries();
      const series = {
        ...base,
        entries: [base.entries[0], { ...base.entries[0], id: 'second', name: 'Second' }],
      };

      expect(lowerWith(series).classOrder).toEqual(['main', 'second']);
    });

    it('carries no class order for a championship of one class', () => {
      expect(lowerWith(makeSeries())).not.toHaveProperty('classOrder');
    });

    it("records the player's own strength setting as the base, before any championship offset", () => {
      const series = makeSeries({ grid: { strength: 10 } });

      expect(lowerWith(series, undefined, { strength: 72, aggression: 30 }).aiBase).toBe(72);
    });

    it('records the default opponents as the base where it is handed none', () => {
      expect(lowerWith(makeSeries()).aiBase).toBe(DEFAULT_OPPONENTS.strength);
    });

    it('holds a recorded class strength inside the range Assetto Corsa accepts', () => {
      const series = makeSeries({ grid: { strength: 10 } });

      expect(lowerWith(series, undefined, { strength: 95, aggression: 30 }).classStrength).toEqual({ main: 100 });
    });

    it('draws a round\'s own car for a seat whose season car it does not run', () => {
      const field: FieldSeat[] = [
        {
          seat: 'main-1', model: 'oval_car', skin: 'white', strength: 0, aggression: 0,
        },
      ];
      const [first] = lowerWith(makeSeries(), field).grid?.opponents ?? [];

      expect(first.model).toBe('test_car');
      // Left to buildGrid, since the season's livery belongs to the other car.
      expect(first.skin).toBeUndefined();
    });

    it('fields a driver in the same car at every round outside a career too', () => {
      const base = withSeats(
        Array.from({ length: 6 }, (unused, at) => ({ id: `seat-${at}` })),
        { eligibility: { kind: 'cars', cars: ['test_car', 'oval_car'] } },
      );
      const series = {
        ...base,
        rounds: [...base.rounds, { id: 'magione-again', name: 'Magione again', track: { id: 'magione' } }],
      };
      const cars = (round: string) => roundRace(
        {
          series, entry: 'main', round, car: { model: 'test_car' },
        },
        makeContent(),
      ).grid?.opponents?.map((one) => `${one.model}/${one.skin}`);

      expect(cars('magione')).toEqual(cars('magione-again'));
    });
  });
});

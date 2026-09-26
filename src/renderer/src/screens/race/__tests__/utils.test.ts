import { describe, expect, it } from '@jest/globals';

import { WEATHER_TYPE_ORDER, WeatherType } from '../../../../../shared/constants';
import type {
  Conditions, SessionDefinition, Weather, WeatherController, WeatherFollow,
} from '../../../../../shared/types';
import { DEFAULT_SLOT_MINUTES } from '../constants.ts';
import {
  addWeatherSlot,
  conditionsSummary,
  countsLaps,
  fromNumber,
  moveAt,
  moveTo,
  nextSession,
  offeredTypes,
  phaseOf,
  removeWeatherSlot,
  seedType,
  sessionLength,
  setWeatherSlot,
  toNumber,
  withChosenTypes,
  withSessionConditions,
  withWeather,
} from '../utils.ts';

/**
 * Builds an installed preset declaring one weather type.
 * @param id The folder name
 * @param type The CSP weather type it declares
 * @returns A complete Weather
 */
const preset = (id: string, type: number): Weather => ({
  id,
  name: id,
  type,
  temperatureCoeff: 0,
  author: null,
  timeDiapason: null,
  cloudCover: 0,
  rain: null,
  forceHeadlights: false,
});

/**
 * Builds an installed controller with one follow answer.
 * @param id The folder name
 * @param weather Whether it honours the race's weather
 * @returns A complete WeatherController
 */
const controller = (id: string, weather: WeatherFollow): WeatherController => ({
  id,
  name: id,
  author: null,
  description: null,
  version: null,
  follows: { weather, temperature: weather, wind: weather },
});

const installed = [
  preset('clear', WeatherType.CLEAR),
  preset('rain', WeatherType.RAIN),
  preset('cold', WeatherType.COLD),
];

const controllers = [
  controller('pureCtrl', 'no'),
  controller('sol', 'yes'),
];

describe('renderer/screens/race/utils', () => {
  describe('toNumber', () => {
    it('reads a number out of the box', () => {
      expect(toNumber('12')).toBe(12);
      expect(toNumber('-1.5')).toBe(-1.5);
    });

    // Clearing a number field has to mean "not set" rather than zero, which is
    // a legal ambient temperature and a legal starting position.
    it('reads an empty box as not set rather than as zero', () => {
      expect(toNumber('')).toBeUndefined();
      expect(toNumber('   ')).toBeUndefined();
    });

    it('reads anything unparsable as not set', () => {
      expect(toNumber('warm')).toBeUndefined();
    });
  });

  describe('fromNumber', () => {
    it('renders a number as itself', () => {
      expect(fromNumber(0)).toBe('0');
      expect(fromNumber(18)).toBe('18');
    });

    it('renders not set as an empty box', () => {
      expect(fromNumber(undefined)).toBe('');
    });
  });

  describe('countsLaps', () => {
    it('asks a race for laps and everything else for minutes', () => {
      expect(countsLaps('race')).toBe(true);
      expect(countsLaps('practice')).toBe(false);
      expect(countsLaps('qualify')).toBe(false);
    });
  });

  describe('nextSession', () => {
    // A weekend with no race in it plans launches nobody wanted, so the first
    // session added is the race itself.
    it('adds a race when there is not one yet', () => {
      expect(nextSession([])).toMatchObject({ type: 'race' });
      expect(nextSession([{ type: 'qualify' }])).toMatchObject({ type: 'race' });
    });

    it('adds a practice once a race is there', () => {
      expect(nextSession([{ type: 'race' }])).toMatchObject({ type: 'practice' });
    });

    it('starts on the day the weekend has reached', () => {
      expect(nextSession([{ type: 'race', day: 2 }]).day).toBe(2);
    });
  });

  describe('sessionLength', () => {
    it('reads a lap race in laps', () => {
      expect(sessionLength({ type: 'race', laps: 12 })).toEqual({ key: 'championships.format.laps', count: 12 });
    });

    it('reads a timed session in minutes', () => {
      expect(sessionLength({ type: 'qualify', minutes: 15 }))
        .toEqual({ key: 'championships.format.minutes', count: 15 });
    });

    // A practice carrying a stale lap count runs to the clock, whatever the
    // leftover field says - the read screen used to show the laps.
    it('reads a session the way race.ini will run it rather than by whichever field is set', () => {
      expect(sessionLength({ type: 'practice', laps: 5, minutes: 30 }))
        .toEqual({ key: 'championships.format.minutes', count: 30 });
    });

    it('states nothing for a session with no length of its own', () => {
      expect(sessionLength({ type: 'race' })).toBeNull();
      expect(sessionLength({ type: 'practice', laps: 5 })).toBeNull();
    });
  });

  describe('moveTo', () => {
    const items = ['a', 'b', 'c', 'd'];

    it('lands an item moved later after the one it was dropped on', () => {
      expect(moveTo(items, 0, 2)).toEqual(['b', 'c', 'a', 'd']);
    });

    it('lands an item moved earlier before the one it was dropped on', () => {
      expect(moveTo(items, 3, 1)).toEqual(['a', 'd', 'b', 'c']);
    });

    it('hands back the same list when nothing moves, so nothing reads as changed', () => {
      expect(moveTo(items, 1, 1)).toBe(items);
    });

    it('refuses a target outside the list rather than growing it', () => {
      expect(moveTo(items, 1, -1)).toBe(items);
      expect(moveTo(items, 1, 4)).toBe(items);
    });
  });

  describe('moveAt', () => {
    const sessions: SessionDefinition[] = [
      { type: 'practice' }, { type: 'qualify' }, { type: 'race' },
    ];

    it('moves a session later', () => {
      expect(moveAt(sessions, 0, 1).map((session) => session.type))
        .toEqual(['qualify', 'practice', 'race']);
    });

    it('moves a session earlier', () => {
      expect(moveAt(sessions, 2, -1).map((session) => session.type))
        .toEqual(['practice', 'race', 'qualify']);
    });

    it('leaves the list alone rather than wrapping round an end', () => {
      expect(moveAt(sessions, 0, -1)).toBe(sessions);
      expect(moveAt(sessions, 2, 1)).toBe(sessions);
    });
  });

  describe('withWeather', () => {
    it('clears the preset and the type when dynamic weather is picked', () => {
      const next = withWeather(
        { weather: 'clear', weatherType: WeatherType.CLEAR },
        { kind: 'dynamic', controller: 'pureCtrl' },
        controllers,
      );

      expect(next).toMatchObject({
        weather: undefined, weatherType: undefined, weatherController: 'pureCtrl',
      });
    });

    // The user never picked a static controller as weather, so it is theirs to
    // keep; a dynamic one only ever got there by being picked.
    it('keeps a static controller and drops a dynamic one', () => {
      const fromStatic = withWeather(
        { weatherController: 'sol' },
        { kind: 'type', type: WeatherType.RAIN },
        controllers,
      );
      const fromDynamic = withWeather(
        { weatherController: 'pureCtrl' },
        { kind: 'type', type: WeatherType.RAIN },
        controllers,
      );

      expect(fromStatic.weatherController).toBe('sol');
      expect(fromDynamic.weatherController).toBeUndefined();
    });

    it('never leaves a type and a preset naming the weather at once', () => {
      const asType = withWeather({ weather: 'clear' }, { kind: 'type', type: WeatherType.RAIN }, controllers);
      const asPreset = withWeather({ weatherType: WeatherType.RAIN }, { kind: 'preset', preset: 'clear' }, controllers);

      expect(asType).toMatchObject({ weather: undefined, weatherType: WeatherType.RAIN });
      expect(asPreset).toMatchObject({ weather: 'clear', weatherType: undefined });
    });

    it('clears everything when the choice is none', () => {
      const next = withWeather(
        { weather: 'clear', weatherType: WeatherType.CLEAR, weatherController: 'pureCtrl' },
        { kind: 'none' },
        controllers,
      );

      expect(next).toMatchObject({
        weather: undefined, weatherType: undefined, weatherController: undefined,
      });
    });
  });

  describe('withSessionConditions', () => {
    it('carries the overrides onto the session', () => {
      const next = withSessionConditions<SessionDefinition>({ type: 'race' }, { ambient: 18 });

      expect(next.conditions).toEqual({ ambient: 18 });
    });

    // An empty block left behind reads as a session that differs from the
    // weekend when it does not, and would be written into the saved draft.
    it('drops the block entirely when it overrides nothing', () => {
      const next = withSessionConditions({ type: 'race', conditions: { ambient: 18 } }, {});

      expect(next).not.toHaveProperty('conditions');
    });

    // A championship's round states its conditions the same way, and used to be
    // written back with an empty block after its dialog was cleared.
    it('drops an emptied block from a round as well as a session', () => {
      const next = withSessionConditions(
        { id: 'magione', name: 'Magione', track: { id: 'magione' }, conditions: { ambient: 18 } },
        {},
      );

      expect(next).toEqual({ id: 'magione', name: 'Magione', track: { id: 'magione' } });
    });
  });

  describe('offeredTypes', () => {
    it('offers only what an installed preset declares', () => {
      expect(offeredTypes(installed, 'none', true)).toContain(WeatherType.CLEAR);
      expect(offeredTypes(installed, 'none', true)).not.toContain(WeatherType.FOG);
    });

    // Asking for rain with RainFX switched off produces a dry race and says
    // nothing about it, which is the silent failure worth removing outright.
    it('drops wet weather when RainFX will not draw it', () => {
      expect(offeredTypes(installed, 'none', false)).not.toContain(WeatherType.RAIN);
      expect(offeredTypes(installed, 'none', false)).toContain(WeatherType.CLEAR);
    });

    // PURE's own table runs 0-28 then 31, 32 - Cold and Hot are simply absent,
    // so an index written for one could not be looked up.
    it('drops the two types PURE does not number', () => {
      expect(offeredTypes(installed, 'pure', true)).not.toContain(WeatherType.COLD);
      expect(offeredTypes(installed, 'sol', true)).toContain(WeatherType.COLD);
    });

    it('drops a type the user switched off even though a preset declares it', () => {
      const types = offeredTypes(installed, 'sol', true, [WeatherType.CLEAR, WeatherType.COLD]);

      expect(types).toEqual([WeatherType.CLEAR, WeatherType.COLD]);
    });

    it('allows every installed type when the user has not narrowed them', () => {
      expect(offeredTypes(installed, 'sol', true))
        .toEqual([WeatherType.CLEAR, WeatherType.RAIN, WeatherType.COLD]);
    });

    it('still drops wet weather and the types PURE does not number from what the user allowed', () => {
      const allowed = [WeatherType.CLEAR, WeatherType.RAIN, WeatherType.COLD];

      expect(offeredTypes(installed, 'sol', false, allowed)).toEqual([WeatherType.CLEAR, WeatherType.COLD]);
      expect(offeredTypes(installed, 'pure', true, allowed)).toEqual([WeatherType.CLEAR, WeatherType.RAIN]);
    });
  });

  describe('withChosenTypes', () => {
    it('lists only what is on offer when the conditions name nothing else', () => {
      expect(withChosenTypes([WeatherType.CLEAR, WeatherType.RAIN], {}))
        .toEqual([WeatherType.CLEAR, WeatherType.RAIN]);
    });

    // A select whose value is not among its items renders blank, which reads as
    // nothing chosen when something is.
    it('keeps a chosen type the menu no longer offers', () => {
      expect(withChosenTypes([WeatherType.CLEAR], { weatherType: WeatherType.RAIN }))
        .toEqual([WeatherType.CLEAR, WeatherType.RAIN]);
    });

    it('keeps the types plan slots name, and passes over a slot deferring to the race', () => {
      const types = withChosenTypes([WeatherType.CLEAR], {
        weatherSteps: [
          { weather: WeatherType.FOG, minutes: 5 },
          { weather: 'race', minutes: 5 },
          { weather: WeatherType.HEAVY_RAIN },
        ],
      });

      expect(types).toEqual([WeatherType.CLEAR, WeatherType.FOG, WeatherType.HEAVY_RAIN]);
    });

    it('lists in menu order with nothing twice, whatever order it was handed', () => {
      const types = withChosenTypes([WeatherType.RAIN, WeatherType.CLEAR], {
        weatherType: WeatherType.RAIN,
        weatherSteps: [{ weather: WeatherType.FOG, minutes: 5 }, { weather: WeatherType.CLEAR }],
      });
      const inMenuOrder = WEATHER_TYPE_ORDER.filter((type) => types.includes(type));

      expect(types).toEqual([WeatherType.CLEAR, WeatherType.FOG, WeatherType.RAIN]);
      expect(types).toEqual(inMenuOrder);
    });
  });

  describe('seedType', () => {
    it('takes a chosen type as it stands', () => {
      expect(seedType({ weatherType: WeatherType.RAIN }, installed, [])).toBe(WeatherType.RAIN);
    });

    it('reads the type off a named preset', () => {
      expect(seedType({ weather: 'rain' }, installed, [])).toBe(WeatherType.RAIN);
    });

    it('falls back to the first type on offer rather than a fixed one', () => {
      expect(seedType({}, installed, [WeatherType.FOG])).toBe(WeatherType.FOG);
    });
  });

  describe('addWeatherSlot', () => {
    const types = offeredTypes(installed, 'pure', true);

    it('seeds both slots from the weather already chosen', () => {
      const next = addWeatherSlot({ weatherType: WeatherType.RAIN }, installed, types);

      expect(next.weatherSteps).toEqual([
        { weather: WeatherType.RAIN, minutes: DEFAULT_SLOT_MINUTES },
        { weather: WeatherType.RAIN },
      ]);
    });

    it('clears the static choice it just turned into slots', () => {
      const next = addWeatherSlot({ weather: 'rain' }, installed, types);

      expect(next.weather).toBeUndefined();
      expect(next.weatherType).toBeUndefined();
    });

    // Only the last slot may run to the end, so the one that held it gets a
    // length and the new one takes over the job.
    it('closes the previously open slot when another is added', () => {
      const two = addWeatherSlot({ weatherType: WeatherType.CLEAR }, installed, types);
      const three = addWeatherSlot(two, installed, types);

      expect(three.weatherSteps).toHaveLength(3);
      expect(three.weatherSteps?.[1].minutes).toBe(DEFAULT_SLOT_MINUTES);
      expect(three.weatherSteps?.[2].minutes).toBeUndefined();
    });
  });

  describe('setWeatherSlot', () => {
    const conditions: Conditions = {
      weatherSteps: [
        { weather: WeatherType.CLEAR, minutes: 5 },
        { weather: WeatherType.RAIN },
      ],
    };

    it('changes only the slot it was given', () => {
      const next = setWeatherSlot(conditions, 0, { minutes: 12 });

      expect(next.weatherSteps?.[0].minutes).toBe(12);
      expect(next.weatherSteps?.[1]).toEqual({ weather: WeatherType.RAIN });
    });
  });

  describe('removeWeatherSlot', () => {
    const three: Conditions = {
      weatherSteps: [
        { weather: WeatherType.CLEAR, minutes: 5 },
        { weather: WeatherType.RAIN, minutes: 5 },
        { weather: WeatherType.CLEAR },
      ],
    };

    it('leaves whichever slot is now last running to the end', () => {
      const next = removeWeatherSlot(three, 2);

      expect(next.weatherSteps).toHaveLength(2);
      expect(next.weatherSteps?.[1].minutes).toBeUndefined();
    });

    // A single slot is a weather that never changes, which needs no planner and
    // no plan - so it goes back to being an ordinary static choice.
    it('collapses back to static weather when one slot is left', () => {
      const two = removeWeatherSlot(three, 2);
      const one = removeWeatherSlot(two, 1);

      expect(one.weatherSteps).toBeUndefined();
      expect(one.weatherType).toBe(WeatherType.CLEAR);
    });
  });

  describe('conditionsSummary', () => {
    it('names the weather a static choice holds at', () => {
      const summary = conditionsSummary({ weatherType: WeatherType.RAIN });

      expect(summary.weather).toBe(WeatherType.RAIN);
      expect(summary.slots).toBeNull();
    });

    // A plan is counted rather than listed: naming every stretch turns a
    // one-line summary into a paragraph.
    it('counts the slots of a plan instead of naming them', () => {
      const summary = conditionsSummary({
        weatherSteps: [
          { weather: WeatherType.CLEAR, minutes: 5 },
          { weather: WeatherType.RAIN },
        ],
      });

      expect(summary.slots).toBe(2);
      expect(summary.weather).toBeNull();
    });

    it('carries the values worth showing beside the weather', () => {
      const summary = conditionsSummary({
        timeOfDay: '14:00', ambient: 22, trackState: 'green',
      });

      expect(summary).toMatchObject({ timeOfDay: '14:00', ambient: 22, trackState: 'green' });
    });

    // A time given as a number of hours is legal in a race file but is not a
    // clock reading, so it is left out rather than printed raw.
    it('says nothing about a time that is not a clock reading', () => {
      expect(conditionsSummary({ timeOfDay: 14 }).timeOfDay).toBeNull();
    });

    it('has nothing to say about conditions that set nothing', () => {
      expect(Object.values(conditionsSummary({})).every((part) => part === null)).toBe(true);
    });
  });

  describe('phaseOf', () => {
    it('reads the phase the card said the weekend is in', () => {
      expect(phaseOf({ phase: 'running' })).toBe('running');
      expect(phaseOf({ phase: 'finished' })).toBe('finished');
      expect(phaseOf({ phase: 'setup' })).toBe('setup');
    });

    // A page opened from anywhere but its card carries no state, or someone
    // else's, and falls back to the setup shape.
    it('reads any other state as setup', () => {
      expect(phaseOf(null)).toBe('setup');
      expect(phaseOf(undefined)).toBe('setup');
      expect(phaseOf({ phase: 'done' })).toBe('setup');
      expect(phaseOf({ started: true })).toBe('setup');
      expect(phaseOf({ from: '/race' })).toBe('setup');
    });
  });
});

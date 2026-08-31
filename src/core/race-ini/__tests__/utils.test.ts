import { describe, expect, it } from '@jest/globals';

import {
  buildCarSection,
  buildGrid,
  buildLighting,
  buildSessionSection,
  capitalise,
  findTrack,
  findWeather,
  firstSkin,
  nextSkin,
  parseClock,
  presetForType,
  resolveWeather,
  roadTemperature,
  spreadAiLevel,
  sunAngleFromTime,
} from '../utils.ts';
import { makeContent, makeRace } from './fixtures.ts';

describe('core/race-ini/utils', () => {
  describe('parseClock', () => {
    it('reads HH:MM into decimal hours', () => {
      expect(parseClock('15:30')).toBe(15.5);
      expect(parseClock('00:00')).toBe(0);
      expect(parseClock('9:15')).toBe(9.25);
    });

    it('passes a number through untouched', () => {
      expect(parseClock(13.75)).toBe(13.75);
    });

    it('throws on anything that is not HH:MM', () => {
      expect(() => parseClock('half past two')).toThrow('Invalid time of day');
      expect(() => parseClock('9:5')).toThrow('Invalid time of day');
    });

    // A cleared time input reads as '', which survives ?? and arrives here.
    // The setup screen has to send undefined instead, and this is why.
    it('rejects an empty string rather than reading it as midnight', () => {
      expect(() => parseClock('')).toThrow('Invalid time of day');
    });
  });

  describe('sunAngleFromTime', () => {
    it('is zero at 13:00, where AC puts the sun overhead', () => {
      // Negative zero, which toFixed(2) still renders as "0.00".
      expect(sunAngleFromTime('13:00')).toBeCloseTo(0);
    });

    it('moves 16 degrees per hour, positive before noon', () => {
      expect(sunAngleFromTime('08:00')).toBe(80);
      expect(sunAngleFromTime('18:00')).toBe(-80);
    });
  });

  describe('findTrack', () => {
    it('finds a single-layout track', () => {
      expect(findTrack(makeContent(), { id: 'test_track' }).name).toBe('Test Track');
    });

    it('finds a layout by name', () => {
      expect(findTrack(makeContent(), { id: 'multi_track', layout: 'gp' }).key).toBe('multi_track/gp');
    });

    it('throws when the id is missing', () => {
      expect(() => findTrack(makeContent(), { id: '' })).toThrow('race.track.id is required');
    });

    it('throws naming the layout when it is not installed', () => {
      expect(() => findTrack(makeContent(), { id: 'multi_track', layout: 'club' }))
        .toThrow('Track not installed: multi_track/club');
    });
  });

  describe('findWeather', () => {
    it('finds an installed preset', () => {
      expect(findWeather(makeContent(), 'test_rain')?.type).toBe(8);
    });

    it('returns null when the race names none', () => {
      expect(findWeather(makeContent(), undefined)).toBeNull();
    });

    it('throws when a named preset is missing', () => {
      expect(() => findWeather(makeContent(), 'nope')).toThrow('Weather not installed: nope');
    });
  });

  describe('presetForType', () => {
    it('finds a preset declaring the type asked for', () => {
      expect(presetForType(makeContent(), 8)?.id).toBe('test_rain');
    });

    // A preset carrying [RAINFX] is what makes rain deterministic, so one is
    // preferred over another declaring the same type without it.
    it('prefers a preset that carries rain figures', () => {
      const content = makeContent();
      content.weather.push({
        id: 'career_rain',
        name: 'Career Rain',
        type: 8,
        temperatureCoeff: -0.5,
        author: null,
        timeDiapason: null,
        cloudCover: 0,
        rain: { intensity: 0.125, wetness: 1, water: 0.5 },
        forceHeadlights: false,
      });

      expect(presetForType(content, 8)?.id).toBe('career_rain');
    });

    it('is null when nothing installed declares the type', () => {
      expect(presetForType(makeContent(), 20)).toBeNull();
    });
  });

  describe('resolveWeather', () => {
    it('reads a named preset and the type it declares', () => {
      expect(resolveWeather(makeContent(), { weather: 'test_rain' }))
        .toMatchObject({ type: 8 });
    });

    // A type still needs a folder behind it, because [WEATHER] NAME wants one
    // and the road temperature wants the preset's coefficient.
    it('resolves a chosen type to a preset that stands for it', () => {
      const resolved = resolveWeather(makeContent(), { weatherType: 8 });

      expect(resolved.preset?.id).toBe('test_rain');
      expect(resolved.type).toBe(8);
    });

    // Failing here beats letting CSP fall back silently to the wrong weather.
    it('throws rather than asking for a type nothing can render', () => {
      expect(() => resolveWeather(makeContent(), { weatherType: 20 }))
        .toThrow(/20/);
    });

    it('takes a chosen type ahead of a preset named beside it', () => {
      expect(resolveWeather(makeContent(), { weather: 'test_clear', weatherType: 8 }).preset?.id)
        .toBe('test_rain');
    });

    it('answers with neither when the race names no weather at all', () => {
      expect(resolveWeather(makeContent(), {})).toEqual({ preset: null, type: null });
    });

    // A Kunos preset declares no __LAUNCHER_CM type, and that is not an error -
    // it means "let Content Manager decide".
    it('reads a preset declaring no type as no type', () => {
      expect(resolveWeather(makeContent(), { weather: 'kunos_weather' }))
        .toMatchObject({ type: null });
    });
  });

  describe('firstSkin', () => {
    it('returns the first installed skin', () => {
      expect(firstSkin(makeContent(), 'test_car')).toBe('red');
    });

    it('returns an empty string for an unknown or skinless car', () => {
      expect(firstSkin(makeContent(), 'skinless_car')).toBe('');
      expect(firstSkin(makeContent(), 'ghost')).toBe('');
    });
  });

  describe('nextSkin', () => {
    it('picks a skin not already on the grid', () => {
      expect(nextSkin(makeContent(), 'test_car', new Set(['red']))).toBe('blue');
    });

    it('reuses the first skin once every one is taken', () => {
      const used = new Set(['red', 'blue', 'green']);
      expect(nextSkin(makeContent(), 'test_car', used)).toBe('red');
    });

    it('returns null for an unknown car', () => {
      expect(nextSkin(makeContent(), 'ghost', new Set())).toBeNull();
    });
  });

  describe('spreadAiLevel', () => {
    it('gives the top level to the fastest opponent', () => {
      expect(spreadAiLevel({ aiLevel: 92, aiLevelMin: 84 }, 1, 8)).toBe(92);
    });

    it('gives the minimum to the last car', () => {
      expect(spreadAiLevel({ aiLevel: 92, aiLevelMin: 84 }, 7, 8)).toBe(84);
    });

    it('spreads linearly in between', () => {
      expect(spreadAiLevel({ aiLevel: 92, aiLevelMin: 84 }, 4, 8)).toBe(88);
    });

    it('uses the top level when there is no room to spread', () => {
      expect(spreadAiLevel({ aiLevel: 92, aiLevelMin: 84 }, 1, 2)).toBe(92);
    });

    it('defaults the minimum to the top when only one level is given', () => {
      expect(spreadAiLevel({ aiLevel: 90 }, 3, 8)).toBe(90);
    });
  });

  describe('buildGrid', () => {
    it('puts the player first with their own car', () => {
      const grid = buildGrid(makeRace(), makeContent());
      expect(grid[0]).toMatchObject({ model: 'test_car', skin: 'red', driver: 'Player' });
    });

    it('sizes the field from grid.size', () => {
      const race = { ...makeRace(), grid: { size: 3 } };
      expect(buildGrid(race, makeContent())).toHaveLength(3);
    });

    it('gives the AI distinct skins where it can', () => {
      const race = { ...makeRace(), grid: { size: 3 } };
      const skins = buildGrid(race, makeContent()).map((entry) => entry.skin);
      expect(new Set(skins).size).toBe(3);
    });

    it('names AI drivers by position', () => {
      const race = { ...makeRace(), grid: { size: 2 } };
      expect(buildGrid(race, makeContent())[1].driver).toBe('AI Driver 1');
    });

    it('lets an explicit opponent override the defaults', () => {
      const race = {
        ...makeRace(),
        grid: { size: 2, opponents: [{ model: 'other_car', driver: 'Rival', aiLevel: 70 }] },
      };
      expect(buildGrid(race, makeContent())[1]).toMatchObject({
        model: 'other_car', driver: 'Rival', aiLevel: 70,
      });
    });

    it('infers the size from the opponent list', () => {
      const race = { ...makeRace(), grid: { opponents: [{ driver: 'A' }, { driver: 'B' }] } };
      expect(buildGrid(race, makeContent())).toHaveLength(3);
    });

    it('gives no AI keys to the player', () => {
      const grid = buildGrid(makeRace(), makeContent());
      expect(grid[0].aiLevel).toBeUndefined();
      expect(grid[0].aiAggression).toBeUndefined();
    });

    it('throws when the player has no car', () => {
      const race = { ...makeRace(), playerCar: { model: '' } };
      expect(() => buildGrid(race, makeContent())).toThrow('race.playerCar.model is required');
    });

    it('throws when the grid exceeds the pit boxes', () => {
      const race = { ...makeRace(), track: { id: 'multi_track', layout: 'gp' }, grid: { size: 5 } };
      // Reworded from a possessive, which has no Ukrainian equivalent.
      expect(() => buildGrid(race, makeContent())).toThrow('exceeds the 4 pit boxes at Multi GP');
    });

    it('throws when the player car has no skins installed', () => {
      const race = { ...makeRace(), playerCar: { model: 'skinless_car' } };
      expect(() => buildGrid(race, makeContent())).toThrow('has no skins installed');
    });
  });

  describe('buildCarSection', () => {
    it('writes MODEL=- for the player, meaning "use [RACE] MODEL"', () => {
      const [player] = buildGrid(makeRace(), makeContent());
      expect(buildCarSection(player, 0).MODEL).toBe('-');
    });

    it('omits the AI keys for the player', () => {
      const [player] = buildGrid(makeRace(), makeContent());
      const section = buildCarSection(player, 0);
      expect(section).not.toHaveProperty('AI_LEVEL');
      expect(section).not.toHaveProperty('AI_AGGRESSION');
    });

    it('writes the real model and AI keys for opponents', () => {
      const race = { ...makeRace(), grid: { size: 2, aiLevel: 90, aiAggression: 40 } };
      const section = buildCarSection(buildGrid(race, makeContent())[1], 1);
      expect(section).toMatchObject({ MODEL: 'test_car', AI_LEVEL: 90, AI_AGGRESSION: 40 });
    });
  });

  describe('capitalise', () => {
    it('upper-cases the first character only', () => {
      expect(capitalise('practice')).toBe('Practice');
      expect(capitalise('timeAttack')).toBe('TimeAttack');
    });

    it('handles an empty string', () => {
      expect(capitalise('')).toBe('');
    });
  });

  describe('buildSessionSection', () => {
    it('maps the session type to AC\'s numeric code', () => {
      expect(buildSessionSection({ type: 'qualify' }).TYPE).toBe(2);
    });

    it('names the session from the type when none is given', () => {
      expect(buildSessionSection({ type: 'practice' }).NAME).toBe('Practice');
    });

    it('writes LAPS only for races', () => {
      expect(buildSessionSection({ type: 'race', laps: 12 }).LAPS).toBe(12);
      expect(buildSessionSection({ type: 'practice', minutes: 20 })).not.toHaveProperty('LAPS');
    });

    it('lines a race up on the grid when it names no spawn set', () => {
      expect(buildSessionSection({ type: 'race' }).SPAWN_SET).toBe('START');
    });

    // Fixed: everything defaulted to START, so a practice or qualifying session
    // created in the app - which names no spawn set - was put on the grid
    // instead of in the pit box. Hand-written race files had been working
    // around it by naming PIT itself, which is why it went unnoticed.
    it('sends practice and qualifying out from the pits instead', () => {
      expect(buildSessionSection({ type: 'practice' }).SPAWN_SET).toBe('PIT');
      expect(buildSessionSection({ type: 'qualify' }).SPAWN_SET).toBe('PIT');
    });

    it('still lets a session name a spawn set of its own', () => {
      expect(buildSessionSection({ type: 'qualify', spawnSet: 'START' }).SPAWN_SET).toBe('START');
    });

    it('writes the starting position when the session asks for one', () => {
      expect(buildSessionSection({ type: 'race', startingPosition: 4 }).STARTING_POSITION).toBe(4);
    });

    // CM omits STARTING_POSITION entirely, so writing it unasked would put every
    // generated INI out of step with the test-mode reference we diff against.
    it('omits the starting position when the session does not ask for one', () => {
      expect(buildSessionSection({ type: 'race', laps: 3 })).not.toHaveProperty('STARTING_POSITION');
    });

    // Slot 1 is pole, confirmed against AC rather than assumed, so a 0 is a real
    // request for the front row and must not be mistaken for "unset".
    it('writes a starting position of zero rather than treating it as absent', () => {
      expect(buildSessionSection({ type: 'race', startingPosition: 0 }).STARTING_POSITION).toBe(0);
    });

    it('throws on a session type AC does not know', () => {
      expect(() => buildSessionSection({ type: 'rallycross' } as never))
        .toThrow('Unknown session type');
    });
  });

  describe('roadTemperature', () => {
    it('uses an explicit road temperature when given', () => {
      expect(roadTemperature({ road: 31, ambient: 10 }, null)).toBe(31);
    });

    it('derives a warmer road under a positive coefficient', () => {
      const weather = makeContent().weather[0];
      expect(roadTemperature({ ambient: 20 }, weather)).toBe(30);
    });

    it('derives a cooler road under a negative coefficient', () => {
      const weather = makeContent().weather[1];
      expect(roadTemperature({ ambient: 20 }, weather)).toBe(15);
    });

    it('falls back to the default ambient when none is given', () => {
      expect(roadTemperature({}, null)).toBe(20);
    });
  });

  describe('buildLighting', () => {
    const content = makeContent();
    const track = content.tracks[0];
    const unplaced = content.tracks[1];

    it('writes the sun angle to two decimals', () => {
      expect(buildLighting({ timeOfDay: '08:00' }, track, null).SUN_ANGLE).toBe('80.00');
    });

    it('writes geotags when the track has them', () => {
      expect(buildLighting({}, track, null)).toMatchObject({
        __TRACK_GEOTAG_LAT: 52.5,
        __TRACK_GEOTAG_LONG: -1.25,
      });
    });

    it('omits geotags when the track has none', () => {
      const lighting = buildLighting({}, unplaced, null);
      expect(lighting).not.toHaveProperty('__TRACK_GEOTAG_LAT');
    });

    it('writes the weather controller when one is named', () => {
      const lighting = buildLighting({ weatherController: 'testCtrl static' }, track, null);
      expect(lighting.__CM_WEATHER_CONTROLLER).toBe('testCtrl static');
    });

    it('writes the CSP weather type when there is one to ask for', () => {
      expect(buildLighting({}, track, 8).__CM_WEATHER_TYPE).toBe(8);
    });

    it('omits the weather type when there is none, as a Kunos preset has', () => {
      expect(buildLighting({}, track, null)).not.toHaveProperty('__CM_WEATHER_TYPE');
    });

    it('unclamps the sun angle past the vanilla limit, so night works', () => {
      expect(buildLighting({ timeOfDay: '22:00' }, track, null).__CM_UNCLAMPED_SUN_ANGLE).toBe(1);
    });

    it('leaves the sun angle clamped inside the vanilla range', () => {
      expect(buildLighting({ timeOfDay: '14:00' }, track, null))
        .not.toHaveProperty('__CM_UNCLAMPED_SUN_ANGLE');
    });
  });
});

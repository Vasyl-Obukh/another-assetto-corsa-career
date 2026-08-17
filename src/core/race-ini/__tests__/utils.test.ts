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

    it('defaults the spawn set to START', () => {
      expect(buildSessionSection({ type: 'race' }).SPAWN_SET).toBe('START');
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

    it('writes the CSP weather type when the preset carries one', () => {
      expect(buildLighting({}, track, content.weather[1]).__CM_WEATHER_TYPE).toBe(8);
    });

    it('omits the weather type for a Kunos preset that has none', () => {
      expect(buildLighting({}, track, content.weather[2])).not.toHaveProperty('__CM_WEATHER_TYPE');
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

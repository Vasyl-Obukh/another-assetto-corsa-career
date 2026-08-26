import { describe, expect, it } from '@jest/globals';

import { makeCar, makeSkin } from './fixtures.ts';
import { carImageSources, roundRatio } from '../utils.ts';

describe('renderer/screens/car-browser/utils', () => {
  describe('carImageSources', () => {
    it('prefers a livery photo, with the badge behind it', () => {
      const car = makeCar({ id: 'ks_ferrari_488', skins: [makeSkin('rosso')] });

      expect(carImageSources(car)).toEqual([
        'accontent://car/ks_ferrari_488/skin/rosso',
        'accontent://car/ks_ferrari_488/badge',
      ]);
    });

    it('falls back to the badge alone when the car has no liveries', () => {
      expect(carImageSources(makeCar({ id: 'ks_ferrari_488', skins: [] })))
        .toEqual(['accontent://car/ks_ferrari_488/badge']);
    });

    // Mod liveries are routinely named "2012 #1 Audi Sport Team Joest LM24".
    // Spaces are legal in a segment and must not cost the car its photo.
    it('serves a livery whose folder name contains spaces', () => {
      const car = makeCar({ id: 'yzd_oreca_07', skins: [makeSkin('1 Oreca Showcar')] });

      expect(carImageSources(car)).toEqual([
        'accontent://car/yzd_oreca_07/skin/1%20Oreca%20Showcar',
        'accontent://car/yzd_oreca_07/badge',
      ]);
    });

    it('skips a livery that cannot be served and takes the next one', () => {
      const car = makeCar({ id: 'yzd_oreca_07', skins: ['bad/name', 'plain'].map(makeSkin) });

      expect(carImageSources(car)).toEqual([
        'accontent://car/yzd_oreca_07/skin/plain',
        'accontent://car/yzd_oreca_07/badge',
      ]);
    });

    it('falls back to the badge when no livery folder can be served', () => {
      const car = makeCar({ id: 'yzd_oreca_07', skins: ['bad/name', '..'].map(makeSkin) });

      expect(carImageSources(car)).toEqual(['accontent://car/yzd_oreca_07/badge']);
    });

    it('offers nothing at all when the car folder itself cannot be served', () => {
      expect(carImageSources(makeCar({ id: 'a/b', skins: [makeSkin('plain')] }))).toEqual([]);
    });

    it('percent-encodes an id rather than letting it break the URL', () => {
      expect(carImageSources(makeCar({ id: 'car#1', skins: [] })))
        .toEqual(['accontent://car/car%231/badge']);
    });
  });


  describe('roundRatio', () => {
    // The underlying figures are parsed out of free text, so 312.4571 bhp/t is
    // noise dressed up as precision.
    it('keeps one decimal place', () => {
      expect(roundRatio(312.4571)).toBe(312.5);
    });

    it('rounds down as well as up', () => {
      expect(roundRatio(312.44)).toBe(312.4);
    });

    it('leaves a whole number alone', () => {
      expect(roundRatio(500)).toBe(500);
    });
  });
});

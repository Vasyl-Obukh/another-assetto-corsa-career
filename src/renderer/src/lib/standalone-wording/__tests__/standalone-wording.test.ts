import { describe, expect, it } from '@jest/globals';
import type { TFunction } from 'i18next';

import type { CareerSummary, ChampionshipStanding } from '../../../../../shared/types';
import {
  isChampion, progressLine, standaloneName, standingLine,
} from '../standalone-wording.ts';

/**
 * A translator that spells out the key and its parameters, so a test can see
 * which wording was asked for and with what.
 * @param key The key asked for
 * @param params The parameters it was given
 * @returns The key with its parameters
 */
const translate = ((key: string, params?: Record<string, unknown>): string => {
  const given = Object.entries(params ?? {}).map(([name, value]) => `${name}=${String(value)}`);

  return given.length > 0 ? `${key}(${given.join(',')})` : key;
}) as unknown as TFunction;

/**
 * Where a ten-round standalone championship stands.
 * @param overrides What to change about it
 * @returns The standing
 */
const standing = (overrides: Partial<ChampionshipStanding> = {}): ChampionshipStanding => ({
  rounds: 10, done: 0, position: null, points: 0, over: false, ...overrides,
});

/**
 * Formats points the way a test can read back.
 * @param value The points
 * @returns The points, marked
 */
const points = (value: number): string => `#${value}`;

describe('renderer/lib/standalone-wording/standalone-wording', () => {
  describe('standaloneName', () => {
    it('names it by its championship and its year', () => {
      const career = { championships: [{ name: 'Lotus Cup' }], year: 2027 } as unknown as CareerSummary;

      expect(standaloneName(career, translate, String))
        .toBe('standalone.name(name=Lotus Cup,year=2027)');
    });

    it('still names the year when the championship is not known', () => {
      expect(standaloneName({ championships: [], year: 2027 }, translate, String))
        .toBe('standalone.name(name=,year=2027)');
    });
  });

  describe('progressLine', () => {
    it('counts the rounds to race before the first', () => {
      expect(progressLine(standing(), translate)).toBe('standalone.progress.toRace(count=10)');
    });

    it('says how far through it is once it has begun', () => {
      expect(progressLine(standing({ done: 4 }), translate)).toBe('standalone.progress.at(done=4,rounds=10)');
    });

    it('says it is finished once it is over', () => {
      expect(progressLine(standing({ done: 10, over: true }), translate)).toBe('standalone.progress.over');
    });
  });

  describe('standingLine', () => {
    it('says nothing before a round has scored', () => {
      expect(standingLine(standing(), translate, points)).toBeNull();
    });

    it('places the player and their points while it runs', () => {
      expect(standingLine(standing({ done: 3, position: 2, points: 43 }), translate, points))
        .toBe('standalone.standing(position=2,points=#43)');
    });

    it('says where the player finished once it is over', () => {
      expect(standingLine(standing({
        done: 10, position: 5, points: 88, over: true,
      }), translate, points)).toBe('standalone.finishedAt(position=5,points=#88)');
    });
  });

  describe('isChampion', () => {
    it('crowns the player first in their class once it is over', () => {
      expect(isChampion(standing({ position: 1, over: true }))).toBe(true);
    });

    it('crowns nobody while it still runs, even the leader', () => {
      expect(isChampion(standing({ position: 1 }))).toBe(false);
    });

    it('crowns nobody who finished anywhere but first', () => {
      expect(isChampion(standing({ position: 2, over: true }))).toBe(false);
    });
  });
});

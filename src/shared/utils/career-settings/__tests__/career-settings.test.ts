import { describe, expect, it } from '@jest/globals';

import { DEFAULT_CAREER_SETTINGS, DEFAULT_SETTINGS } from '../../../constants/index.ts';
import type { CareerSettings, Settings } from '../../../types/index.ts';
import {
  careerCurrency, careerDrivingAids, careerOpponents, readCareerSettings,
} from '../career-settings.ts';

/**
 * The app's settings, with opponents and aids a test can tell apart from a
 * career's.
 */
const APP: Settings = {
  ...DEFAULT_SETTINGS,
  opponents: { strength: 90, aggression: 20 },
  drivingAids: { abs: 1, idealLine: true },
};

/**
 * A career's settings beyond the defaults.
 * @param over What the test wants said differently
 * @returns The settings
 */
const own = (over: Partial<CareerSettings> = {}): CareerSettings => ({ ...DEFAULT_CAREER_SETTINGS, ...over });

describe('shared/utils/career-settings', () => {
  describe('readCareerSettings', () => {
    it('reads a complete set through unchanged', () => {
      const stored: CareerSettings = {
        opponents: { strength: 95, aggression: 40 },
        drivingAids: { abs: 2, autoClutch: true },
        currency: 'EUR',
        allowSameDayEvents: true,
        historicFrequency: 'weekly',
        prizeSpeed: 1.5,
        ratingSpeed: 2,
      };

      expect(readCareerSettings(stored)).toEqual(stored);
    });

    // A career.json written before a career had settings of its own still
    // opens, on the defaults.
    it('reads anything but a record as the defaults', () => {
      expect(readCareerSettings(undefined)).toEqual(DEFAULT_CAREER_SETTINGS);
      expect(readCareerSettings('corrupt')).toEqual(DEFAULT_CAREER_SETTINGS);
    });

    it('does not hand back the shared defaults object', () => {
      expect(readCareerSettings(null)).not.toBe(DEFAULT_CAREER_SETTINGS);
    });

    it('follows the app for opponents or aids that are not a record', () => {
      expect(readCareerSettings({ opponents: 'hard', drivingAids: 3 })).toMatchObject({
        opponents: null, drivingAids: null,
      });
    });

    it('reads its own opponents and aids the way the app reads its own', () => {
      const read = readCareerSettings({ opponents: { strength: 140 }, drivingAids: { abs: 'on', idealLine: true } });

      expect(read.opponents).toEqual({ strength: 100, aggression: DEFAULT_SETTINGS.opponents.aggression });
      expect(read.drivingAids).toEqual({ idealLine: true });
    });

    // Two events on one day clash unless the player has said otherwise, which
    // is the calendar's design rather than a convenience.
    it('clashes two events on one day unless switched on, and only by a real switch', () => {
      expect(DEFAULT_CAREER_SETTINGS.allowSameDayEvents).toBe(false);
      expect(readCareerSettings({ allowSameDayEvents: true }).allowSameDayEvents).toBe(true);
      expect(readCareerSettings({ allowSameDayEvents: 'yes' }).allowSameDayEvents).toBe(false);
    });

    it('keeps a historic frequency it knows and falls back to monthly for one it does not', () => {
      expect(readCareerSettings({ historicFrequency: 'off' }).historicFrequency).toBe('off');
      expect(readCareerSettings({ historicFrequency: 'daily' }).historicFrequency).toBe('monthly');
      expect(readCareerSettings({}).historicFrequency).toBe(DEFAULT_CAREER_SETTINGS.historicFrequency);
    });

    it("keeps a currency it offers and follows the app's for any other", () => {
      expect(readCareerSettings({ currency: 'GBP' }).currency).toBe('GBP');
      expect(readCareerSettings({ currency: 'JPY' }).currency).toBeNull();
      expect(readCareerSettings({}).currency).toBeNull();
    });

    it('keeps a progression speed it offers and pays prizes as they stand for any other', () => {
      expect(readCareerSettings({ prizeSpeed: 3 }).prizeSpeed).toBe(3);
      expect(readCareerSettings({ prizeSpeed: 1.1 }).prizeSpeed).toBe(1);
      expect(readCareerSettings({ prizeSpeed: '2' }).prizeSpeed).toBe(1);
      expect(readCareerSettings({}).prizeSpeed).toBe(DEFAULT_CAREER_SETTINGS.prizeSpeed);
    });

    it('keeps a rating speed it offers and rates at the default for any other', () => {
      expect(readCareerSettings({ ratingSpeed: 0.5 }).ratingSpeed).toBe(0.5);
      expect(readCareerSettings({ ratingSpeed: 4 }).ratingSpeed).toBe(4);
      expect(readCareerSettings({ ratingSpeed: 5 }).ratingSpeed).toBe(DEFAULT_CAREER_SETTINGS.ratingSpeed);
      expect(readCareerSettings({ ratingSpeed: '2' }).ratingSpeed).toBe(DEFAULT_CAREER_SETTINGS.ratingSpeed);
      expect(readCareerSettings({}).ratingSpeed).toBe(DEFAULT_CAREER_SETTINGS.ratingSpeed);
    });

    it('reads the rating speed apart from the prize speed', () => {
      expect(readCareerSettings({ prizeSpeed: 3, ratingSpeed: 0.75 }))
        .toMatchObject({ prizeSpeed: 3, ratingSpeed: 0.75 });
    });
  });

  describe('careerOpponents', () => {
    it("races the career's own where it sets them", () => {
      expect(careerOpponents(APP, own({ opponents: { strength: 70, aggression: 60 } })))
        .toEqual({ strength: 70, aggression: 60 });
    });

    it("races the app's while the career follows them, and outside a career", () => {
      expect(careerOpponents(APP, own())).toBe(APP.opponents);
      expect(careerOpponents(APP, null)).toBe(APP.opponents);
    });
  });

  describe('careerDrivingAids', () => {
    it("drives with the career's own where it sets them, even none at all", () => {
      expect(careerDrivingAids(APP, own({ drivingAids: { abs: 0 } }))).toEqual({ abs: 0 });
      expect(careerDrivingAids(APP, own({ drivingAids: {} }))).toEqual({});
    });

    it("drives with the app's while the career follows them, and outside a career", () => {
      expect(careerDrivingAids(APP, own())).toBe(APP.drivingAids);
      expect(careerDrivingAids(APP, null)).toBe(APP.drivingAids);
    });
  });

  describe('careerCurrency', () => {
    it("shows the career's own where it sets one", () => {
      expect(careerCurrency(APP, own({ currency: 'EUR' }))).toBe('EUR');
    });

    it("shows the app's while the career follows it, and outside a career", () => {
      expect(careerCurrency({ ...APP, currency: 'GBP' }, own())).toBe('GBP');
      expect(careerCurrency({ ...APP, currency: 'GBP' }, null)).toBe('GBP');
    });
  });
});

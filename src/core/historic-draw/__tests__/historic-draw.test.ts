import { describe, expect, it } from '@jest/globals';

import { Discipline } from '../../../shared/types/index.ts';
import type { Championship, ClassEntry } from '../../../shared/types/index.ts';
import { weekdayOf } from '../../../shared/utils/calendar-days/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import {
  historicRung, historicSeat, historicSlots, invitationDrawn, planHistoric, withPlayerSeat,
} from '../index.ts';
import type { HistoricDrawRequest } from '../index.ts';
import { daysFrom } from '../utils.ts';

const SEASON = { startDate: '2027-01-01', endDate: '2027-12-31' };

const POOL = Array.from({ length: 20 }, (unused, at) => `event-${String(at).padStart(2, '0')}`);

/**
 * A draw over the whole season, monthly, with nothing busy.
 * @param overrides What to change about it
 * @returns The request
 */
const request = (overrides: Partial<HistoricDrawRequest> = {}): HistoricDrawRequest => ({
  slots: historicSlots(SEASON, 'monthly'),
  pool: POOL,
  busy: new Set(),
  from: SEASON.startDate,
  salt: 'career-1/0',
  ...overrides,
});

/**
 * A class of a historic event.
 * @param id Its id
 * @param seats Its seats
 * @returns The class entry
 */
const entry = (id: string, seats: ClassEntry['seats']): ClassEntry => ({
  id,
  name: id,
  ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
  seats,
  eligibility: { kind: 'cars', cars: ['lotus_49', 'ferrari_312'] },
});

/**
 * A historic event of the given classes.
 * @param entries Its classes
 * @returns The event
 */
const LEVELS: Record<Discipline, number> = {
  [Discipline.SINGLE_SEATER]: 4,
  [Discipline.SPORTSCAR]: 2,
  [Discipline.TOURING]: 5,
  [Discipline.ROAD]: 5,
};

/**
 * A class of a historic event on a rung of its own.
 * @param id Its id
 * @param discipline Its discipline
 * @param tier Its tier
 * @returns The class entry, one seat
 */
const rung = (id: string, discipline: Discipline, tier: number): ClassEntry => ({
  ...entry(id, [{ id: `${id}-seat` }]),
  ladder: { discipline, tier },
});

const event = (entries: ClassEntry[]): Championship => ({
  version: SERIES_FORMAT_VERSION,
  id: 'british-gp-1967',
  name: 'British Grand Prix 1967',
  entries,
  rounds: [{ id: 'gp', name: 'British Grand Prix 1967', track: { id: 'ks_silverstone1967' } }],
  eventFormats: [{ id: 'gp', name: 'British Grand Prix 1967', sessions: [] }],
  defaultEventFormat: 'gp',
  pointsSystems: [{ id: 'none', name: 'No points', positions: [] }],
  defaultPointsSystem: 'none',
});

describe('core/historic-draw', () => {
  describe('historicSlots', () => {
    it('cuts a season into its twelve calendar months', () => {
      const slots = historicSlots(SEASON, 'monthly');

      expect(slots).toHaveLength(12);
      expect(slots[0]).toEqual({ index: 0, from: '2027-01-01', to: '2027-01-31' });
      expect(slots[1]).toEqual({ index: 1, from: '2027-02-01', to: '2027-02-28' });
      expect(slots[11]).toEqual({ index: 11, from: '2027-12-01', to: '2027-12-31' });
    });

    it('cuts a season into its four calendar quarters', () => {
      expect(historicSlots(SEASON, 'quarterly').map((slot) => [slot.from, slot.to])).toEqual([
        ['2027-01-01', '2027-03-31'],
        ['2027-04-01', '2027-06-30'],
        ['2027-07-01', '2027-09-30'],
        ['2027-10-01', '2027-12-31'],
      ]);
    });

    it('counts fortnights from 1 January and clips the last to the season\'s end', () => {
      const slots = historicSlots(SEASON, 'fortnightly');

      expect(slots[0]).toEqual({ index: 0, from: '2027-01-01', to: '2027-01-14' });
      expect(slots).toHaveLength(27);
      expect(slots.at(-1)).toEqual({ index: 26, from: '2027-12-31', to: '2027-12-31' });
    });

    it('counts weeks from 1 January, numbering them in order', () => {
      const slots = historicSlots(SEASON, 'weekly');

      expect(slots).toHaveLength(53);
      expect(slots[1]).toEqual({ index: 1, from: '2027-01-08', to: '2027-01-14' });
      expect(slots.map((slot) => slot.index)).toEqual(slots.map((unused, at) => at));
      expect(slots.at(-1)?.to).toBe('2027-12-31');
    });

    it('cuts nothing when historic events are off', () => {
      expect(historicSlots(SEASON, 'off')).toEqual([]);
    });

    it('leaves no day of the season outside a stretch, and none in two', () => {
      const slots = historicSlots(SEASON, 'fortnightly');
      const covered = slots.flatMap((slot) => daysFrom(slot.from, slot.to));

      expect(covered).toEqual(daysFrom(SEASON.startDate, SEASON.endDate));
    });
  });

  describe('planHistoric', () => {
    it('draws one event in every stretch, inside it', () => {
      const slots = historicSlots(SEASON, 'monthly');
      const picks = planHistoric(request());

      expect(picks).toHaveLength(12);
      picks.forEach((pick, at) => {
        expect(pick.date >= slots[at].from && pick.date <= slots[at].to).toBe(true);
      });
    });

    it('puts every event on a weekday', () => {
      planHistoric(request({ slots: historicSlots(SEASON, 'weekly'), pool: [...POOL, ...POOL.map((id) => `${id}-b`), ...POOL.map((id) => `${id}-c`)] }))
        .forEach((pick) => expect([1, 2, 3, 4, 5]).toContain(weekdayOf(pick.date)));
    });

    it('never draws one event twice in a season', () => {
      const ids = planHistoric(request()).map((pick) => pick.id);

      expect(new Set(ids).size).toBe(ids.length);
    });

    it('stops once the pool is spent rather than racing an event twice', () => {
      const picks = planHistoric(request({ pool: ['a', 'b', 'c'] }));

      expect(picks.map((pick) => pick.id).sort()).toEqual(['a', 'b', 'c']);
      expect(picks.every((pick) => pick.date <= '2027-03-31')).toBe(true);
    });

    it('draws nothing behind the day it is told to start from', () => {
      const picks = planHistoric(request({ from: '2027-03-15' }));

      expect(picks).toHaveLength(10);
      expect(picks.every((pick) => pick.date >= '2027-03-15')).toBe(true);
    });

    it('prefers a weekday the career races nothing else on', () => {
      const january = daysFrom('2027-01-01', '2027-01-31');
      const busy = new Set(january.filter((day) => day !== '2027-01-20'));
      const [first] = planHistoric(request({ busy }));

      expect(first.date).toBe('2027-01-20');
    });

    it('still draws a stretch whose every weekday is taken', () => {
      const busy = new Set(daysFrom('2027-01-01', '2027-01-31'));
      const [first] = planHistoric(request({ busy }));

      expect(first.date >= '2027-01-01' && first.date <= '2027-01-31').toBe(true);
    });

    it('keeps two events of one season off the same day', () => {
      const dates = planHistoric(request({ slots: historicSlots(SEASON, 'weekly'), pool: POOL })).map((pick) => pick.date);

      expect(new Set(dates).size).toBe(dates.length);
    });

    it('draws the same season the same way every time', () => {
      expect(planHistoric(request())).toEqual(planHistoric(request()));
    });

    it('draws a different season for a different salt', () => {
      expect(planHistoric(request({ salt: 'career-2/0' }))).not.toEqual(planHistoric(request()));
    });

    // Guards a fix: the salt ended the seed, so one career's seasons - salts
    // differing in their last character - drew the same events year after year.
    it('draws the next season of one career apart from the last', () => {
      const ids = (salt: string): string[] => planHistoric(request({ salt })).map((pick) => pick.id);

      expect(ids('career-1/1')).not.toEqual(ids('career-1/0'));
    });

    it('draws a stretch the same from the same pool, whatever came before it', () => {
      const full = planHistoric(request());
      const later = planHistoric(request({
        slots: historicSlots(SEASON, 'monthly').slice(1),
        pool: POOL.filter((id) => id !== full[0].id),
      }));

      expect(later[0]).toEqual(full[1]);
    });
  });

  describe('historicSeat', () => {
    const eligible = new Map([['f1', ['lotus_49', 'ferrari_312']]]);

    it('invites no one when no class can field a car', () => {
      const lotus = event([entry('f1', [{ id: 'clark' }])]);

      expect(historicSeat(lotus, new Map([['f1', []]]), 'salt')).toBeNull();
      expect(historicSeat(lotus, new Map(), 'salt')).toBeNull();
    });

    it('invites no one to a class without seats', () => {
      expect(historicSeat(event([entry('f1', [])]), eligible, 'salt')).toBeNull();
    });

    it('keeps the car and livery a seat names when that car is installed', () => {
      const lotus = event([entry('f1', [{ id: 'clark', car: { model: 'lotus_49', skin: 'clark_1967' } }])]);

      expect(historicSeat(lotus, eligible, 'salt')).toEqual({
        entry: 'f1', seat: 'clark', car: { model: 'lotus_49', skin: 'clark_1967' },
      });
    });

    it('carries no livery for a named car that names none', () => {
      const lotus = event([entry('f1', [{ id: 'clark', car: { model: 'lotus_49' } }])]);

      expect(historicSeat(lotus, eligible, 'salt')?.car).toEqual({ model: 'lotus_49' });
    });

    it('picks one of the class\'s installed cars when the named one is not', () => {
      const brabham = event([entry('f1', [{ id: 'brabham', car: { model: 'brabham_bt24', skin: 'works' } }])]);
      const seat = historicSeat(brabham, eligible, 'salt');

      expect(['lotus_49', 'ferrari_312']).toContain(seat?.car.model);
      expect(seat?.car.skin).toBeUndefined();
    });

    it('invites the player only to a class that can field a car', () => {
      const mixed = event([entry('f1', [{ id: 'clark' }]), entry('f2', [{ id: 'rindt' }])]);
      const onlyF2 = new Map([['f1', []], ['f2', ['lotus_48']]]);

      ['a', 'b', 'c', 'd', 'e', 'f'].forEach((salt) => {
        expect(historicSeat(mixed, onlyF2, salt)?.entry).toBe('f2');
      });
    });

    it('invites the same season to the same seat every time', () => {
      const field = event([entry('f1', [{ id: 'clark' }, { id: 'hill' }, { id: 'surtees' }])]);

      expect(historicSeat(field, eligible, 'career/3')).toEqual(historicSeat(field, eligible, 'career/3'));
    });

    it('given the rungs of the player, offers a class of the discipline they rank highest in', () => {
      const mixed = event([rung('f1', Discipline.SINGLE_SEATER, 4), rung('gt', Discipline.SPORTSCAR, 2)]);
      const cars = new Map([['f1', ['lotus_49']], ['gt', ['ford_gt40']]]);

      ['a', 'b', 'c', 'd', 'e', 'f'].forEach((salt) => {
        expect(historicSeat(mixed, cars, salt, LEVELS)?.entry).toBe('gt');
      });
    });

    it('among the classes of that discipline, offers the one whose tier is nearest the rung', () => {
      const mixed = event([rung('gt1', Discipline.SPORTSCAR, 1), rung('gt3', Discipline.SPORTSCAR, 3), rung('gt2', Discipline.SPORTSCAR, 2)]);
      const cars = new Map([['gt1', ['a']], ['gt2', ['b']], ['gt3', ['c']]]);

      ['a', 'b', 'c', 'd', 'e', 'f'].forEach((salt) => {
        expect(historicSeat(mixed, cars, salt, LEVELS)?.entry).toBe('gt2');
      });
    });
  });

  describe('historicRung', () => {
    it('is the highest rung the player holds among the disciplines of the event', () => {
      const mixed = event([rung('f1', Discipline.SINGLE_SEATER, 4), rung('gt', Discipline.SPORTSCAR, 1)]);
      const cars = new Map([['f1', ['lotus_49']], ['gt', ['ford_gt40']]]);

      expect(historicRung(mixed, cars, LEVELS)).toEqual({ discipline: Discipline.SPORTSCAR, rung: 2 });
    });

    it('leaves out a discipline whose classes cannot field a car', () => {
      const mixed = event([rung('f1', Discipline.SINGLE_SEATER, 4), rung('gt', Discipline.SPORTSCAR, 1)]);
      const cars = new Map([['f1', ['lotus_49']], ['gt', []]]);

      expect(historicRung(mixed, cars, LEVELS)).toEqual({ discipline: Discipline.SINGLE_SEATER, rung: 4 });
    });

    it('is nothing for an event no class of which can field a car', () => {
      expect(historicRung(event([rung('f1', Discipline.SINGLE_SEATER, 4)]), new Map(), LEVELS)).toBeNull();
    });
  });

  describe('invitationDrawn', () => {
    const lotus = event([entry('f1', [{ id: 'clark' }])]);
    const salts = Array.from({ length: 200 }, (unused, at) => `career/${at}`);

    it('always comes at a certain chance, and never at none', () => {
      expect(salts.every((salt) => invitationDrawn(lotus, 100, salt))).toBe(true);
      expect(salts.some((salt) => invitationDrawn(lotus, 0, salt))).toBe(false);
    });

    // Guards a fix: the salt ended the seed, so seasons of one career - salts
    // differing in their last character - all drew within a hair of each other.
    it('comes about as often as its chance says, season after season', () => {
      const hits = salts.filter((salt) => invitationDrawn(lotus, 40, salt)).length;

      expect(hits / salts.length).toBeGreaterThan(0.3);
      expect(hits / salts.length).toBeLessThan(0.5);
    });

    it('draws the same season the same way every time', () => {
      expect(salts.map((salt) => invitationDrawn(lotus, 50, salt)))
        .toEqual(salts.map((salt) => invitationDrawn(lotus, 50, salt)));
    });

    it('comes at a higher chance whenever it comes at a lower one', () => {
      salts.filter((salt) => invitationDrawn(lotus, 20, salt))
        .forEach((salt) => expect(invitationDrawn(lotus, 60, salt)).toBe(true));
    });
  });

  describe('withPlayerSeat', () => {
    const field = event([
      entry('f1', [{ id: 'clark' }, { id: 'hill' }, { id: 'surtees' }]),
      entry('f2', [{ id: 'rindt' }, { id: 'ickx' }]),
    ]);

    it('moves the seat to the end of its class', () => {
      const moved = withPlayerSeat(field, 'f1', 'clark');

      expect(moved.entries[0].seats.map((seat) => seat.id)).toEqual(['hill', 'surtees', 'clark']);
    });

    it('leaves every other class as it was', () => {
      expect(withPlayerSeat(field, 'f1', 'clark').entries[1]).toBe(field.entries[1]);
    });

    it('changes nothing for a seat its class does not hold', () => {
      const moved = withPlayerSeat(field, 'f1', 'rindt');

      expect(moved.entries.map((one) => one.seats.map((seat) => seat.id)))
        .toEqual(field.entries.map((one) => one.seats.map((seat) => seat.id)));
    });

    it('does not reorder the event it was handed', () => {
      withPlayerSeat(field, 'f1', 'clark');

      expect(field.entries[0].seats.map((seat) => seat.id)).toEqual(['clark', 'hill', 'surtees']);
    });
  });
});

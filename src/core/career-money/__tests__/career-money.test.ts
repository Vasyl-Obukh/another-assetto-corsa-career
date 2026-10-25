import { describe, expect, it } from '@jest/globals';

import {
  CUP, makeCareer, makeEntry, makeEvent, makePlace, makeRace, makeSeason, makeStanding,
} from './fixtures.ts';
import type { Career, OwnedCar, SeasonEntry } from '../../../shared/types/index.ts';
import {
  feeLine,
  feeOf,
  feeOwed,
  feePaid,
  openingLine,
  owedPrizes,
  payOut,
  post,
  purchaseLine,
  rentLine,
  rentOwed,
  rentPaid,
  repaintLine,
  saleLine,
  speedLine,
} from '../career-money.ts';

/**
 * A career holding one season with one entry in it.
 * @param entry The entry
 * @param over Whatever the test wants said differently of the career
 * @returns The career
 */
const careerIn = (entry: SeasonEntry, over: Partial<Career> = {}): Career => makeCareer({
  seasons: [makeSeason([entry])], ...over,
});

/**
 * The cup's entry with both rounds raced and its final table standing, the
 * player third in it.
 * @param over Whatever the test wants said differently
 * @returns The entry
 */
const finished = (over: Partial<SeasonEntry> = {}): SeasonEntry => makeEntry({
  events: [
    makeEvent('one', '2027-03-07', [makeRace(2, [makePlace(1)])]),
    makeEvent('two', '2027-06-06', [makeRace(2, [makePlace(4)])]),
  ],
  standings: {
    classes: [{
      entry: 'main', name: 'Main', drivers: [makeStanding(3)], teams: [],
    }],
    updatedAt: '2027-06-06T18:00:00.000Z',
  },
  ...over,
});

describe('core/career-money', () => {
  describe('feeOf', () => {
    it("is the round's own fee", () => {
      expect(feeOf(makeEntry(), makeEvent('one', '2027-03-07', undefined, { entryFee: 1500 }))).toBe(1500);
    });

    it('costs nothing where the round has no fee, or one of zero', () => {
      expect(feeOf(makeEntry(), makeEvent('one', '2027-03-07'))).toBeNull();
      expect(feeOf(makeEntry(), makeEvent('one', '2027-03-07', undefined, { entryFee: 0 }))).toBeNull();
    });

    it('costs nothing for a historic event, which the invitation covers', () => {
      const event = makeEvent('one', '2027-03-07', undefined, { entryFee: 1500 });

      expect(feeOf(makeEntry({ historic: true }), event)).toBeNull();
    });
  });

  describe('feePaid', () => {
    it("is paid once the round's fee is on the ledger", () => {
      const entry = makeEntry();
      const event = makeEvent('one', '2027-03-07', undefined, { entryFee: 1500 });
      const career = careerIn(entry);

      expect(feePaid(career, event)).toBe(false);
      expect(feePaid(post(career, [feeLine(makeSeason(), entry, event, 1500)]), event)).toBe(true);
    });
  });

  describe('feeOwed', () => {
    const entry = makeEntry();
    const event = makeEvent('one', '2027-03-07', undefined, { entryFee: 1500 });

    it('owes the fee until it is paid, and nothing after', () => {
      const career = careerIn(entry);

      expect(feeOwed(career, entry, event)).toBe(1500);
      expect(feeOwed(post(career, [feeLine(makeSeason(), entry, event, 1500)]), entry, event)).toBe(0);
    });

    it('owes nothing in a standalone championship, which has no money', () => {
      expect(feeOwed(careerIn(entry, { kind: 'championship' }), entry, event)).toBe(0);
    });

    it("is never scaled by the career's progression speed", () => {
      const career = careerIn(entry, { settings: { ...makeCareer().settings, prizeSpeed: 2 } });

      expect(feeOwed(career, entry, event)).toBe(1500);
    });
  });

  describe('feeLine', () => {
    it('takes the fee out, keyed by the round and naming it', () => {
      const event = makeEvent('two', '2027-06-06', undefined, { entryFee: 1500 });

      expect(feeLine(makeSeason(), makeEntry(), event, 1500)).toEqual({
        key: 'fee:test-cup/two@0.0',
        kind: 'fee',
        date: '2027-06-06',
        amount: -1500,
        season: 0,
        series: 'test-cup',
        seriesName: 'Test Cup',
        edition: 0,
        round: 'two',
        roundName: 'Round two',
        number: 2,
      });
    });

    it('names a round the season\'s copy no longer holds by its id', () => {
      const line = feeLine(makeSeason(), makeEntry(), makeEvent('gone', '2027-06-06'), 1500);

      expect(line).toMatchObject({ round: 'gone', roundName: 'gone', number: 0 });
    });
  });

  describe('rentPaid', () => {
    it("is paid once the round's rent is on the ledger", () => {
      const entry = makeEntry({ car: { model: 'test_car', source: 'rented' } });
      const event = makeEvent('one', '2027-03-07');
      const career = careerIn(entry);

      expect(rentPaid(career, event)).toBe(false);
      expect(rentPaid(post(career, [rentLine(makeSeason(), entry, event, 300, 'Test Car')]), event)).toBe(true);
    });

    it("is not paid by the round's entry fee", () => {
      const entry = makeEntry();
      const event = makeEvent('one', '2027-03-07');

      expect(rentPaid(post(careerIn(entry), [feeLine(makeSeason(), entry, event, 1500)]), event)).toBe(false);
    });
  });

  describe('rentOwed', () => {
    const rented = makeEntry({ car: { model: 'test_car', source: 'rented' } });
    const event = makeEvent('one', '2027-03-07');

    it('owes the rent of a rented car until it is paid, and nothing after', () => {
      const career = careerIn(rented);

      expect(rentOwed(career, rented, event, 300)).toBe(300);
      expect(rentOwed(post(career, [rentLine(makeSeason(), rented, event, 300, 'Test Car')]), rented, event, 300))
        .toBe(0);
    });

    it('owes nothing for a car the career owns, or one that came with the seat', () => {
      const owned = makeEntry({ car: { model: 'test_car', source: 'owned' } });
      const supplied = makeEntry();

      expect(rentOwed(careerIn(owned), owned, event, 300)).toBe(0);
      expect(rentOwed(careerIn(supplied), supplied, event, 300)).toBe(0);
    });

    it('owes nothing in a standalone championship, which has no money', () => {
      expect(rentOwed(careerIn(rented, { kind: 'championship' }), rented, event, 300)).toBe(0);
    });
  });

  describe('rentLine', () => {
    it('takes the rent out, keyed by the round and naming it and the car', () => {
      const entry = makeEntry({ car: { model: 'test_car', source: 'rented' } });
      const event = makeEvent('two', '2027-06-06');

      expect(rentLine(makeSeason(), entry, event, 300, 'Test Car')).toEqual({
        key: 'rent:test-cup/two@0.0',
        kind: 'rent',
        date: '2027-06-06',
        amount: -300,
        season: 0,
        series: 'test-cup',
        seriesName: 'Test Cup',
        edition: 0,
        round: 'two',
        roundName: 'Round two',
        number: 2,
        car: { model: 'test_car', name: 'Test Car' },
      });
    });
  });

  describe('purchaseLine', () => {
    it('takes the price out on the day, in the latest season, naming the car and its livery', () => {
      const career = makeCareer({ date: '2027-04-01', seasons: [makeSeason(), { ...makeSeason(), index: 1 }] });

      expect(purchaseLine(career, 'test_car', 'Test Car', 'Red', 40_000)).toEqual({
        key: 'purchase:test_car:0',
        kind: 'purchase',
        date: '2027-04-01',
        season: 1,
        amount: -40_000,
        car: { model: 'test_car', name: 'Test Car', livery: 'Red' },
      });
    });

    it('leaves the livery out for a car bought in none', () => {
      expect(purchaseLine(makeCareer(), 'test_car', 'Test Car', undefined, 40_000).car)
        .toEqual({ model: 'test_car', name: 'Test Car' });
    });

    it('falls in the first season of a career with none yet', () => {
      expect(purchaseLine(makeCareer({ seasons: [] }), 'test_car', 'Test Car', undefined, 40_000).season).toBe(0);
    });

    it('keys each purchase of one car apart from the ones before it', () => {
      const career = makeCareer({ seasons: [makeSeason()] });
      const first = purchaseLine(career, 'test_car', 'Test Car', undefined, 40_000);

      expect(purchaseLine(post(career, [first]), 'test_car', 'Test Car', undefined, 40_000).key)
        .toBe('purchase:test_car:1');
    });
  });

  describe('saleLine', () => {
    it('pays what the car sells for, saying what was paid for it and when', () => {
      const owned: OwnedCar = {
        model: 'test_car', skin: 'red', paid: 40_000, bought: '2027-02-01',
      };
      const career = makeCareer({ date: '2027-08-01', seasons: [makeSeason()] });

      expect(saleLine(career, owned, 'Test Car', 38_000)).toEqual({
        key: 'sale:test_car:0',
        kind: 'sale',
        date: '2027-08-01',
        season: 0,
        amount: 38_000,
        car: {
          model: 'test_car', name: 'Test Car', paid: 40_000, bought: '2027-02-01',
        },
      });
    });
  });

  describe('repaintLine', () => {
    it('takes the cost out, naming the livery it went from and to', () => {
      const career = makeCareer({ date: '2027-05-01', seasons: [makeSeason()] });

      expect(repaintLine(career, 'test_car', 'Test Car', 'Red', 'Blue', 600)).toEqual({
        key: 'repaint:test_car:0',
        kind: 'repaint',
        date: '2027-05-01',
        season: 0,
        amount: -600,
        car: {
          model: 'test_car', name: 'Test Car', from: 'Red', livery: 'Blue',
        },
      });
    });

    it('leaves out either livery it has no name for', () => {
      expect(repaintLine(makeCareer(), 'test_car', 'Test Car', undefined, undefined, 600).car)
        .toEqual({ model: 'test_car', name: 'Test Car' });
    });
  });

  describe('openingLine', () => {
    it('opens the ledger on the money the career starts with', () => {
      expect(openingLine('2027-01-01', 50_000)).toEqual({
        key: 'opening', kind: 'opening', date: '2027-01-01', season: 0, amount: 50_000,
      });
    });
  });

  describe('speedLine', () => {
    it('moves no money and says the speed it moved from and to', () => {
      const career = makeCareer({ date: '2027-04-01', seasons: [makeSeason()] });

      expect(speedLine(career, 2)).toEqual({
        key: 'speed:0', kind: 'speed', date: '2027-04-01', season: 0, amount: 0, speed: { from: 1, to: 2 },
      });
    });

    it('keys each change apart from the ones before it', () => {
      const career = post(makeCareer(), [openingLine('2027-01-01', 50_000)]);

      expect(speedLine(career, 2).key).not.toBe(speedLine(makeCareer(), 2).key);
    });
  });

  describe('owedPrizes', () => {
    it("pays the player's class place in every race they drove", () => {
      const entry = makeEntry({
        events: [makeEvent('one', '2027-03-07', [makeRace(1, [makePlace(1)]), makeRace(2, [makePlace(3)])])],
      });

      expect(owedPrizes(careerIn(entry))).toEqual([
        expect.objectContaining({
          key: 'race:test-cup/one@0.0:1', kind: 'race', amount: 1000, place: 1, race: 'Race 1', date: '2027-03-07',
        }),
        expect.objectContaining({ key: 'race:test-cup/one@0.0:2', amount: 400, place: 3 }),
      ]);
    });

    it("pays at the career's progression speed", () => {
      const entry = makeEntry({ events: [makeEvent('one', '2027-03-07', [makeRace(1, [makePlace(2)])])] });
      const career = careerIn(entry, { settings: { ...makeCareer().settings, prizeSpeed: 1.5 } });

      expect(owedPrizes(career).map((line) => line.amount)).toEqual([900]);
    });

    it('pays nothing for a place the purse does not reach', () => {
      const entry = makeEntry({ events: [makeEvent('one', '2027-03-07', [makeRace(1, [makePlace(4)])])] });

      expect(owedPrizes(careerIn(entry))).toEqual([]);
    });

    it('pays nothing twice', () => {
      const entry = makeEntry({ events: [makeEvent('one', '2027-03-07', [makeRace(1, [makePlace(1)])])] });
      const career = careerIn(entry);

      expect(owedPrizes(post(career, owedPrizes(career)))).toEqual([]);
    });

    it('pays nothing for a race simulated, or raced in their seat by someone else', () => {
      const entry = makeEntry({
        events: [makeEvent('one', '2027-03-07', [
          makeRace(1, [makePlace(1)], { simulated: true }),
          makeRace(2, [makePlace(1, { substitute: true })]),
          makeRace(3, [makePlace(1, { seat: 'seat-1' })]),
        ])],
      });

      expect(owedPrizes(careerIn(entry))).toEqual([]);
    });

    it('pays nothing for qualifying points kept from a round the player left part-way', () => {
      const entry = makeEntry({
        events: [makeEvent('one', '2027-03-07', [makeRace(1, [makePlace(1, { bonusOnly: true })])])],
      });

      expect(owedPrizes(careerIn(entry))).toEqual([]);
    });

    it("pays a class's own purse over the championship's", () => {
      const championship = { ...CUP, entries: [{ ...CUP.entries[0], prizes: { positions: [70] } }] };
      const entry = makeEntry({
        championship, events: [makeEvent('one', '2027-03-07', [makeRace(1, [makePlace(1)])])],
      });

      expect(owedPrizes(careerIn(entry)).map((line) => line.amount)).toEqual([70]);
    });

    // Fixed: a class stating only its own final-standings table paid nothing
    // per race, its whole purse standing in for the championship's.
    it("pays a table the class leaves out from the championship's", () => {
      const championship = { ...CUP, entries: [{ ...CUP.entries[0], prizes: { standings: [99] } }] };
      const career = careerIn(finished({ championship }), { date: '2027-07-01' });

      expect(owedPrizes(career).map((line) => line.amount)).toEqual([1000]);
    });

    it("pays the final standing once the edition has run its course, dated by its last race", () => {
      const career = careerIn(finished(), { date: '2027-06-06' });

      expect(owedPrizes(career).at(-1)).toEqual({
        key: 'standings:0:test-cup:0',
        kind: 'standings',
        date: '2027-06-06',
        season: 0,
        amount: 4000,
        series: 'test-cup',
        seriesName: 'Test Cup',
        edition: 0,
        place: 3,
      });
    });

    it('pays no final standing while a round is still to run', () => {
      const entry = finished({
        events: [makeEvent('one', '2027-03-07', [makeRace(1, [makePlace(1)])]), makeEvent('two', '2027-06-06')],
      });

      expect(owedPrizes(careerIn(entry, { date: '2027-04-01' })).map((line) => line.kind)).toEqual(['race']);
    });

    it('waits for a round given up to be raced by the field before paying the final standing', () => {
      const missed = makeEvent('two', '2027-06-06', undefined, { status: 'missed' });
      const career = (simulated: boolean): Career => careerIn(finished({
        events: [makeEvent('one', '2027-03-07', [makeRace(1, [makePlace(4)])]), { ...missed, simulated }],
      }), { date: '2027-07-01' });

      expect(owedPrizes(career(false))).toEqual([]);
      expect(owedPrizes(career(true)).map((line) => line.kind)).toEqual(['standings']);
    });

    // Fixed: a championship the player withdrew from still paid its final table.
    it('pays a withdrawn championship its races and no final standing', () => {
      const career = careerIn(finished({ withdrawn: true }), { date: '2027-07-01' });

      expect(owedPrizes(career).map((line) => line.kind)).toEqual(['race']);
    });

    it('pays no final standing to a player who raced none of it', () => {
      const entry = finished({ standings: { ...finished().standings, classes: [{
        entry: 'main', name: 'Main', drivers: [makeStanding(1, { races: 0 })], teams: [],
      }] } });

      expect(owedPrizes(careerIn(entry, { date: '2027-07-01' })).map((line) => line.kind)).not.toContain('standings');
    });

    it('pays a historic event per race and never for a table it stands in none of', () => {
      const career = careerIn(finished({ historic: true }), { date: '2027-07-01' });

      expect(owedPrizes(career).map((line) => line.kind)).toEqual(['historic']);
    });

    it('pays nothing in a standalone championship', () => {
      expect(owedPrizes(careerIn(finished(), { kind: 'championship', date: '2027-07-01' }))).toEqual([]);
    });
  });

  describe('post', () => {
    it('adds the lines to the ledger and their amounts to the money', () => {
      const career = post(makeCareer(), [openingLine('2027-01-01', 10), { ...openingLine('2027-01-02', -4), key: 'x' }]);

      expect(career.money).toBe(50_006);
      expect(career.ledger.map((line) => line.key)).toEqual(['opening', 'x']);
    });

    it('hands back the same career when there is nothing to post', () => {
      const career = makeCareer();

      expect(post(career, [])).toBe(career);
    });
  });

  describe('payOut', () => {
    it('posts every prize owed', () => {
      const career = payOut(careerIn(finished(), { date: '2027-07-01' }));

      expect(career.money).toBe(50_000 + 1000 + 4000);
      expect(career.ledger.map((line) => line.kind)).toEqual(['race', 'standings']);
    });

    it('hands back the same career when nothing is owed', () => {
      const career = makeCareer();

      expect(payOut(career)).toBe(career);
    });
  });
});

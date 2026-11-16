import { describe, expect, it } from '@jest/globals';

import {
  CUP, makeCareer, makeContract, makeEntry, makeEvent, makeOffer, makePlace, makeRace, makeSeason, makeStanding,
} from './fixtures.ts';
import { Discipline } from '../../../shared/types/index.ts';
import type {
  Career, Contract, OwnedCar, SeasonEntry, SeasonEvent, SponsorDeal,
} from '../../../shared/types/index.ts';
import {
  coveringSponsor,
  feeLine,
  feeOf,
  feeOwed,
  feePaid,
  feeShares,
  openingLine,
  owedPrizes,
  owedSponsors,
  payOut,
  post,
  purchaseLine,
  refundLine,
  releaseLine,
  rentLine,
  rentOwed,
  rentPaid,
  rentShares,
  repaintLine,
  salaryPaid,
  saleLine,
  seatLine,
  speedLine,
  sponsorLine,
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

/**
 * A main sponsor's deal for a year from the eve of the career's opening day,
 * covering any racing, asking only that the player race and paying nothing
 * until a test gives it perks.
 * @param over Whatever the test wants said differently
 * @returns The deal
 */
const makeDeal = (over: Partial<SponsorDeal> = {}): SponsorDeal => ({
  id: 'sponsor:test-cup/zero@0.0',
  sponsor: { name: 'Halden Lubricants', trade: 'oil', nation: 'GBR' },
  slot: 'main',
  covers: null,
  perks: [],
  target: { kind: 'start' },
  goal: { kind: 'racesStarted', count: 2 },
  rung: 4,
  signed: '2026-12-31',
  until: '2027-12-31',
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

    it('charges a historic event entered at the player\'s own cost, in a car of their own or rented', () => {
      const event = makeEvent('one', '2027-03-07', undefined, { entryFee: 1500 });

      expect(feeOf(makeEntry({ historic: true, car: { model: 'test_car', source: 'rented' } }), event)).toBe(1500);
      expect(feeOf(makeEntry({ historic: true, car: { model: 'test_car', source: 'owned' } }), event)).toBe(1500);
    });

    it('costs nothing under a contract whose team covers every fee', () => {
      const event = makeEvent('one', '2027-03-07', undefined, { entryFee: 1500 });

      expect(feeOf(makeEntry({ contract: makeContract() }), event)).toBeNull();
    });

    it('charges the half a contract covering half of each fee leaves the player', () => {
      const event = makeEvent('one', '2027-03-07', undefined, { entryFee: 1500 });

      expect(feeOf(makeEntry({ contract: makeContract({ feeCover: 0.5 }) }), event)).toBe(750);
    });

    it('charges the whole fee once the contract is terminated', () => {
      const event = makeEvent('one', '2027-03-07', undefined, { entryFee: 1500 });

      expect(feeOf(makeEntry({ contract: makeContract({ ended: '2027-02-01' }) }), event)).toBe(1500);
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

    it("owes nothing for a round whose championship a sponsor's deal covers", () => {
      const deal = makeDeal({ perks: [{ kind: 'championship', series: CUP.id, seriesName: CUP.name }] });

      expect(feeOwed(careerIn(entry, { sponsors: [deal] }), entry, event)).toBe(0);
    });

    it("owes what is left of the fee after a sponsor's share", () => {
      const deal = makeDeal({ perks: [{ kind: 'feeShare', share: 20 }] });

      expect(feeOwed(careerIn(entry, { sponsors: [deal] }), entry, event)).toBe(1200);
    });
  });

  describe('coveringSponsor', () => {
    const entry = makeEntry();
    const event = makeEvent('one', '2027-03-07');
    const covering = makeDeal({ perks: [{ kind: 'championship', series: CUP.id, seriesName: CUP.name }] });

    it("finds the deal covering the round's championship", () => {
      expect(coveringSponsor(makeCareer({ sponsors: [makeDeal(), covering] }), entry, event)).toBe(covering);
    });

    it('finds none for a deal covering another championship', () => {
      const other = makeDeal({ perks: [{ kind: 'championship', series: 'other-cup', seriesName: 'Other Cup' }] });

      expect(coveringSponsor(makeCareer({ sponsors: [other] }), entry, event)).toBeNull();
    });

    it('finds none outside the deal: on the day it was signed, or once it ended', () => {
      const signed = { ...covering, signed: event.date };
      const ended = { ...covering, ended: { on: '2027-02-01', why: 'mine' as const } };

      expect(coveringSponsor(makeCareer({ sponsors: [signed] }), entry, event)).toBeNull();
      expect(coveringSponsor(makeCareer({ sponsors: [ended] }), entry, event)).toBeNull();
    });
  });

  describe('feeShares', () => {
    const entry = makeEntry();
    const event = makeEvent('one', '2027-03-07', undefined, { entryFee: 1500 });
    const deal = makeDeal({ perks: [{ kind: 'feeShare', share: 20 }] });

    it("says what each sponsor takes off a round's fee", () => {
      expect(feeShares(careerIn(entry, { sponsors: [deal] }), entry, event)).toEqual([
        { sponsor: 'Halden Lubricants', amount: 300, share: 20 },
      ]);
    });

    it('takes nothing off a fee a sponsor already covers, nor a round with none to pay', () => {
      const covering = makeDeal({
        id: 'covering', perks: [{ kind: 'championship', series: CUP.id, seriesName: CUP.name }],
      });
      const invited = makeEntry({ historic: true });

      expect(feeShares(careerIn(entry, { sponsors: [deal, covering] }), entry, event)).toEqual([]);
      expect(feeShares(careerIn(invited, { sponsors: [deal] }), invited, event)).toEqual([]);
    });
  });

  describe('rentShares', () => {
    const rented = makeEntry({ car: { model: 'test_car', source: 'rented' } });
    const event = makeEvent('one', '2027-03-07');

    it("says what each sponsor takes off a round's rent", () => {
      const deal = makeDeal({ perks: [{ kind: 'rentShare', share: 40 }] });

      expect(rentShares(careerIn(rented, { sponsors: [deal] }), rented, event, 300)).toEqual([
        { sponsor: 'Halden Lubricants', amount: 120, share: 40 },
      ]);
    });

    it('takes nothing off a round in a discipline the deal does not cover', () => {
      const deal = makeDeal({ covers: Discipline.TOURING, perks: [{ kind: 'rentShare', share: 40 }] });

      expect(rentShares(careerIn(rented, { sponsors: [deal] }), rented, event, 300)).toEqual([]);
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

    it("owes what is left of the rent after a sponsor's share", () => {
      const deal = makeDeal({ perks: [{ kind: 'rentShare', share: 40 }] });

      expect(rentOwed(careerIn(rented, { sponsors: [deal] }), rented, event, 300)).toBe(180);
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

    it('says what sponsors took off it, and nothing when none did', () => {
      const entry = makeEntry({ car: { model: 'test_car', source: 'rented' } });
      const event = makeEvent('two', '2027-06-06');
      const offBy = [{ sponsor: 'Halden Lubricants', amount: 120, share: 40 }];

      expect(rentLine(makeSeason(), entry, event, 180, 'Test Car', offBy)).toMatchObject({ amount: -180, offBy });
      expect(rentLine(makeSeason(), entry, event, 300, 'Test Car')).not.toHaveProperty('offBy');
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

    it('says what a sale took off, and whether the car was the Deal of the week', () => {
      expect(purchaseLine(makeCareer(), 'test_car', 'Test Car', undefined, 24_000, {
        model: 'test_car', off: 40, headline: true,
      }).car).toEqual({
        model: 'test_car', name: 'Test Car', off: 40, headline: true,
      });
      expect(purchaseLine(makeCareer(), 'test_car', 'Test Car', undefined, 32_000, {
        model: 'test_car', off: 20, headline: false,
      }).car).toEqual({ model: 'test_car', name: 'Test Car', off: 20 });
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
        model: 'test_car', skin: 'red', paid: 40_000, listed: 40_000, bought: '2027-02-01',
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

  describe('salaryPaid', () => {
    it("is paid once the round's salary is on the ledger", () => {
      const event = makeEvent('one', '2027-03-07');
      const line = { ...openingLine('2027-03-07', 5000), key: `salary:${event.raceId}` };

      expect(salaryPaid(makeCareer(), event)).toBe(false);
      expect(salaryPaid(makeCareer({ ledger: [line] }), event)).toBe(true);
    });

    it("is not paid by the round's entry fee", () => {
      const event = makeEvent('one', '2027-03-07');
      const line = { ...openingLine('2027-03-07', -1500), key: `fee:${event.raceId}` };

      expect(salaryPaid(makeCareer({ ledger: [line] }), event)).toBe(false);
    });
  });

  describe('seatLine', () => {
    it("takes the seat's price out on the day, keyed by the offer and naming the team", () => {
      const career = makeCareer({ date: '2027-01-15' });

      expect(seatLine(career, 'offer:test-cup:0.0', makeOffer())).toEqual({
        key: 'seat:offer:test-cup:0.0',
        kind: 'seat',
        date: '2027-01-15',
        season: 0,
        amount: -8000,
        series: 'test-cup',
        seriesName: 'Test Cup',
        edition: 0,
        team: 'Test Racing',
      });
    });
  });

  describe('releaseLine', () => {
    it('takes the release fee out on the day, saying how many rounds were left', () => {
      const career = makeCareer({ date: '2027-04-01' });
      const contract = makeContract();
      const entry = makeEntry({ contract, edition: 1 });

      expect(releaseLine(career, makeSeason([entry]), entry, contract, 1500, 2)).toEqual({
        key: 'release:offer:test-cup:0.0',
        kind: 'release',
        date: '2027-04-01',
        season: 0,
        amount: -1500,
        place: 2,
        series: 'test-cup',
        seriesName: 'Test Cup',
        edition: 1,
        team: 'Test Racing',
      });
    });
  });

  describe('refundLine', () => {
    it('pays part of the seat back on the day, saying how many rounds were left', () => {
      const career = makeCareer({ date: '2027-04-01' });
      const contract = makeContract({ pay: 'seat', amount: 8000 });
      const entry = makeEntry({ contract });

      expect(refundLine(career, makeSeason([entry]), entry, contract, 2000, 1)).toEqual({
        key: 'refund:offer:test-cup:0.0',
        kind: 'refund',
        date: '2027-04-01',
        season: 0,
        amount: 2000,
        place: 1,
        series: 'test-cup',
        seriesName: 'Test Cup',
        edition: 0,
        team: 'Test Racing',
      });
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

    it('pays a class smaller than a full grid its share of both tables', () => {
      const championship = { ...CUP, entries: [{ ...CUP.entries[0], seats: CUP.entries[0].seats.slice(0, 6) }] };
      const career = careerIn(finished({ championship }), { date: '2027-07-01' });

      expect(owedPrizes(career).map((line) => [line.kind, line.amount])).toEqual([['race', 500], ['standings', 2000]]);
    });

    describe('a historic event of a class a rung above the career', () => {
      const championship = { ...CUP, entries: [{ ...CUP.entries[0], ladder: { ...CUP.entries[0].ladder, tier: 1 } }] };

      it('pays its purse at the fees of the rung it was entered from', () => {
        const career = careerIn(finished({ championship, historic: true, rung: 5 }), { date: '2027-07-01' });

        expect(owedPrizes(career).map((line) => line.amount)).toEqual([28]);
      });

      it('pays in full where the entry keeps no rung, as one made before purses were scaled', () => {
        const career = careerIn(finished({ championship, historic: true }), { date: '2027-07-01' });

        expect(owedPrizes(career).map((line) => line.amount)).toEqual([1000]);
      });
    });

    it('pays nothing in a standalone championship', () => {
      expect(owedPrizes(careerIn(finished(), { kind: 'championship', date: '2027-07-01' }))).toEqual([]);
    });

    describe('under a contract', () => {
      /**
       * The cup's entry under a contract, round one raced and won and round
       * two still to come.
       * @param over Whatever the test wants said differently of the contract
       * @returns The entry
       */
      const signedTo = (over: Partial<Contract> = {}): SeasonEntry => makeEntry({
        contract: makeContract(over),
        events: [makeEvent('one', '2027-03-07', [makeRace(1, [makePlace(1)])]), makeEvent('two', '2027-06-06')],
      });

      /**
       * The cup's entry under a contract, round one given up and round two
       * still to come, each with a fee.
       * @param over Whatever the test wants said differently of the contract
       * @param event Whatever the test wants said differently of the round given up
       * @returns The entry
       */
      const missedUnder = (over: Partial<Contract> = {}, event: Partial<SeasonEvent> = {}): SeasonEntry => makeEntry({
        contract: makeContract(over),
        events: [
          makeEvent('one', '2027-03-07', undefined, { status: 'missed', entryFee: 1500, ...event }),
          makeEvent('two', '2027-06-06', undefined, { entryFee: 1500 }),
        ],
      });

      it("pays each round raced its share of the salary, beside the player's share of the purse", () => {
        const career = careerIn(signedTo({ pay: 'salary', amount: 10_000, prizeShare: 25 }), { date: '2027-04-01' });

        expect(owedPrizes(career)).toEqual([
          {
            key: 'salary:test-cup/one@0.0',
            kind: 'salary',
            date: '2027-03-07',
            amount: 5000,
            team: 'Test Racing',
            season: 0,
            series: 'test-cup',
            seriesName: 'Test Cup',
            edition: 0,
            round: 'one',
            roundName: 'Round one',
            number: 1,
          },
          expect.objectContaining({
            key: 'race:test-cup/one@0.0:1',
            kind: 'race',
            amount: 250,
            share: { percent: 25, purse: 1000 },
            team: 'Test Racing',
          }),
        ]);
      });

      it('pays no salary under a contract that pays none', () => {
        const career = careerIn(signedTo(), { date: '2027-04-01' });

        expect(owedPrizes(career).map((line) => line.kind)).toEqual(['race']);
      });

      it('pays no salary twice', () => {
        const career = careerIn(signedTo({ pay: 'salary', amount: 10_000 }), { date: '2027-04-01' });

        expect(owedPrizes(post(career, owedPrizes(career)))).toEqual([]);
      });

      it("pays the whole purse, saying no share, when every purse is the player's", () => {
        const career = careerIn(signedTo({ pay: 'seat', amount: 8000, prizeShare: 100 }), { date: '2027-04-01' });
        const [line] = owedPrizes(career);

        expect(line.amount).toBe(1000);
        expect(line).not.toHaveProperty('share');
      });

      it('fines a round given up its entry fee, which the team paid for an empty seat', () => {
        const career = careerIn(missedUnder(), { date: '2027-04-01' });

        expect(owedPrizes(career)).toEqual([expect.objectContaining({
          key: 'fine:test-cup/one@0.0', kind: 'fine', date: '2027-03-07', amount: -1500, team: 'Test Racing', number: 1,
        })]);
      });

      it('fines no round already behind the clock as the contract was signed', () => {
        const career = careerIn(missedUnder({ signed: '2027-04-01' }), { date: '2027-04-01' });

        expect(owedPrizes(career)).toEqual([]);
      });

      it('fines no paid seat, no round the install could not race and none after the contract ended', () => {
        const unfined = [
          missedUnder({ pay: 'seat', amount: 8000 }),
          missedUnder({}, { unraceable: true }),
          missedUnder({ ended: '2027-03-01' }),
        ];

        expect(unfined.flatMap((entry) => owedPrizes(careerIn(entry, { date: '2027-04-01' })))).toEqual([]);
      });

      it('fines nothing twice', () => {
        const career = careerIn(missedUnder(), { date: '2027-04-01' });

        expect(owedPrizes(post(career, owedPrizes(career)))).toEqual([]);
      });

      it("pays the player's share of the final standing", () => {
        const career = careerIn(finished({ contract: makeContract() }), { date: '2027-07-01' });

        expect(owedPrizes(career).at(-1)).toEqual({
          key: 'standings:0:test-cup:0',
          kind: 'standings',
          date: '2027-06-06',
          season: 0,
          amount: 2000,
          share: { percent: 50, purse: 4000 },
          team: 'Test Racing',
          series: 'test-cup',
          seriesName: 'Test Cup',
          edition: 0,
          place: 3,
        });
      });

      it('pays the standings bonus the final place earns once the edition has run its course', () => {
        const contract = makeContract({ bonus: [{ upTo: 1, amount: 5000 }, { upTo: 3, amount: 2000 }] });
        const career = careerIn(finished({ contract }), { date: '2027-07-01' });

        expect(owedPrizes(career).at(-1)).toEqual({
          key: 'bonus:0:test-cup:0',
          kind: 'bonus',
          date: '2027-06-06',
          season: 0,
          amount: 2000,
          team: 'Test Racing',
          series: 'test-cup',
          seriesName: 'Test Cup',
          edition: 0,
          place: 3,
        });
      });

      it('pays no bonus while a round is still to run, nor for a place it does not reach', () => {
        const early = finished({
          contract: makeContract({ bonus: [{ upTo: 3, amount: 2000 }] }),
          events: [makeEvent('one', '2027-03-07', [makeRace(1, [makePlace(1)])]), makeEvent('two', '2027-06-06')],
        });
        const third = finished({ contract: makeContract({ bonus: [{ upTo: 1, amount: 5000 }] }) });

        expect(owedPrizes(careerIn(early, { date: '2027-04-01' })).map((line) => line.kind)).not.toContain('bonus');
        expect(owedPrizes(careerIn(third, { date: '2027-07-01' })).map((line) => line.kind)).not.toContain('bonus');
      });

      it('pays no bonus twice', () => {
        const contract = makeContract({ bonus: [{ upTo: 3, amount: 2000 }] });
        const career = careerIn(finished({ contract }), { date: '2027-07-01' });

        expect(owedPrizes(post(career, owedPrizes(career)))).toEqual([]);
      });
    });
  });

  describe('sponsorLine', () => {
    const at = { date: '2027-03-07', season: 0 };

    it('books pay for being there as a sponsor line and a result or a goal as a bonus', () => {
      expect(sponsorLine(makeDeal(), 'racePay', 'k', 100, at).kind).toBe('sponsor');
      expect(sponsorLine(makeDeal(), 'signing', 'k', 100, at).kind).toBe('sponsor');
      expect(sponsorLine(makeDeal(), 'carBacking', 'k', 100, at).kind).toBe('sponsor');
      expect(sponsorLine(makeDeal(), 'win', 'k', 100, at).kind).toBe('sponsorBonus');
      expect(sponsorLine(makeDeal(), 'goalBonus', 'k', 100, at).kind).toBe('sponsorBonus');
    });

    it('names the deal, the sponsor and the perk that paid', () => {
      expect(sponsorLine(makeDeal(), 'racePay', 'k', 100, at)).toEqual({
        key: 'k',
        kind: 'sponsor',
        date: '2027-03-07',
        season: 0,
        amount: 100,
        sponsor: { deal: 'sponsor:test-cup/zero@0.0', name: 'Halden Lubricants', perk: 'racePay' },
      });
    });

    it('marks race pay a main sponsor halved, and nothing else', () => {
      expect(sponsorLine(makeDeal(), 'racePay', 'k', 50, at, true).sponsor?.half).toBe(true);
      expect(sponsorLine(makeDeal(), 'racePay', 'k', 50, at).sponsor).not.toHaveProperty('half');
    });
  });

  describe('owedSponsors', () => {
    const pay = { kind: 'racePay' as const, amount: 1000 };

    /**
     * A career whose player won round one and was fourth in round two, with
     * one deal.
     * @param deal The deal
     * @param over Whatever the test wants said differently of the career
     * @returns The career
     */
    const career = (deal: SponsorDeal, over: Partial<Career> = {}): Career => careerIn(finished(), {
      date: '2027-07-01', sponsors: [deal], ...over,
    });

    it('pays race pay in full for every race on target, keyed by deal and race', () => {
      const owed = owedSponsors(career(makeDeal({ perks: [pay] })));

      expect(owed.map((line) => [line.key, line.amount])).toEqual([
        ['sponsor:sponsor:test-cup/zero@0.0:pay:test-cup/one@0.0:2', 1000],
        ['sponsor:sponsor:test-cup/zero@0.0:pay:test-cup/two@0.0:2', 1000],
      ]);
      expect(owed[0]).toMatchObject({
        kind: 'sponsor', series: CUP.id, round: 'one', race: 'Race 2', place: 1,
      });
    });

    it('pays a partner nothing for a race short of its target', () => {
      const deal = makeDeal({ slot: 'partner', perks: [pay], target: { kind: 'classPlace', share: 1 / 2 } });

      expect(owedSponsors(career(deal)).map((line) => line.round)).toEqual(['one']);
    });

    it('pays a main sponsor half for a race short of its target, and says so', () => {
      const deal = makeDeal({ perks: [pay], target: { kind: 'classPlace', share: 1 / 2 } });
      const [full, half] = owedSponsors(career(deal));

      expect(full.amount).toBe(1000);
      expect(full.sponsor).not.toHaveProperty('half');
      expect(half.amount).toBe(500);
      expect(half.sponsor?.half).toBe(true);
    });

    it('pays each results bonus for the race that earned it', () => {
      const entry = makeEntry({
        events: [
          makeEvent('one', '2027-03-07', [makeRace(2, [makePlace(1, { qualifyingPosition: 1, finishPoints: 25 })])]),
          makeEvent('two', '2027-06-06', [makeRace(2, [makePlace(3, { qualifyingPosition: 2, finishPoints: 15 })])]),
        ],
      });
      const deal = makeDeal({
        perks: [
          { kind: 'win', amount: 2000 },
          { kind: 'podium', amount: 700 },
          { kind: 'points', amount: 300 },
          { kind: 'pole', amount: 500 },
        ],
      });
      const owed = owedSponsors(careerIn(entry, { date: '2027-07-01', sponsors: [deal] }));

      expect(owed.map((line) => [line.round, line.sponsor?.perk, line.amount, line.kind])).toEqual([
        ['one', 'win', 2000, 'sponsorBonus'],
        ['one', 'podium', 700, 'sponsorBonus'],
        ['one', 'points', 300, 'sponsorBonus'],
        ['one', 'pole', 500, 'sponsorBonus'],
        ['two', 'podium', 700, 'sponsorBonus'],
        ['two', 'points', 300, 'sponsorBonus'],
      ]);
    });

    it('pays nothing for a race the player did not drive', () => {
      const entry = makeEntry({
        events: [makeEvent('one', '2027-03-07', [makeRace(2, [makePlace(1)], { simulated: true })])],
      });

      expect(owedSponsors(careerIn(entry, { sponsors: [makeDeal({ perks: [pay] })] }))).toEqual([]);
    });

    it('matches every prize paid inside the deal, race and standings alike', () => {
      const deal = makeDeal({ perks: [{ kind: 'prizeMatch', share: 20 }] });
      const prized = payOut(career(makeDeal()));
      const owed = owedSponsors({ ...prized, sponsors: [deal] });

      expect(owed.map((line) => [line.key, line.amount, line.kind])).toEqual([
        ['sponsor:sponsor:test-cup/zero@0.0:match:race:test-cup/one@0.0:2', 200, 'sponsorBonus'],
        ['sponsor:sponsor:test-cup/zero@0.0:match:standings:0:test-cup:0', 800, 'sponsorBonus'],
      ]);
      expect(owed[0]).toMatchObject({ series: CUP.id, round: 'one', place: 1 });
    });

    it('matches no prize won before the deal, nor one of a discipline it does not cover', () => {
      const prized = payOut(career(makeDeal()));
      const later = makeDeal({ perks: [{ kind: 'prizeMatch', share: 20 }], signed: '2027-04-01' });
      const elsewhere = makeDeal({ perks: [{ kind: 'prizeMatch', share: 20 }], covers: Discipline.SPORTSCAR });

      expect(owedSponsors({ ...prized, sponsors: [later] }).map((line) => line.amount)).toEqual([800]);
      expect(owedSponsors({ ...prized, sponsors: [elsewhere] })).toEqual([]);
    });

    it('pays the goal bonus the day its goal is met', () => {
      const deal = makeDeal({ perks: [{ kind: 'goalBonus', amount: 5000 }] });
      const met = { ...deal, goalMet: '2027-06-01' };

      expect(owedSponsors(career(deal, { date: '2027-12-31' }))).toEqual([]);
      expect(owedSponsors(career(met, { date: '2027-06-01' }))).toEqual([
        sponsorLine(met, 'goalBonus', 'sponsor:sponsor:test-cup/zero@0.0:goal', 5000, { date: '2027-06-01', season: 0 }),
      ]);
    });

    it('pays no goal bonus for a goal missed, nor to a deal ended before its year ran out', () => {
      const bonus = { kind: 'goalBonus' as const, amount: 5000 };
      const missed = makeDeal({ perks: [bonus], goal: { kind: 'racesStarted', count: 3 } });
      const ended = makeDeal({ perks: [bonus], ended: { on: '2027-07-01', why: 'mine' } });

      expect(owedSponsors(career(missed, { date: '2028-01-01' }))).toEqual([]);
      expect(owedSponsors(career(ended, { date: '2028-01-01' }))).toEqual([]);
    });

    it('raises the figures of a deal that climbs with the player to their new rung', () => {
      // Drawn at Rookie's typical fee of 700 a round, paid at Bronze's 3,000.
      const deal = makeDeal({ rung: 5, perks: [{ kind: 'climbs' }, pay] });

      expect(owedSponsors(career(deal)).map((line) => line.amount)).toEqual([4290, 4290]);
    });

    it('pays nothing twice', () => {
      const owing = career(makeDeal({ perks: [pay] }));

      expect(owedSponsors(post(owing, owedSponsors(owing)))).toEqual([]);
    });

    it('pays nothing in a standalone championship, which has no money', () => {
      expect(owedSponsors(career(makeDeal({ perks: [pay] }), { kind: 'championship' }))).toEqual([]);
    });

    // Guards a fix: the round that brought the offer falls on the day it is
    // signed, and used to be paid by a deal signed after it ran.
    it('pays nothing for a round raced on the day the deal was signed', () => {
      const deal = makeDeal({ perks: [pay], signed: '2027-03-07' });

      expect(owedSponsors(career(deal)).map((line) => line.round)).toEqual(['two']);
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

    it('pays the sponsors after the prizes, so a prize match pays on prizes paid in the same call', () => {
      const deal = makeDeal({ perks: [{ kind: 'prizeMatch', share: 20 }] });
      const career = payOut(careerIn(finished(), { date: '2027-07-01', sponsors: [deal] }));

      expect(career.money).toBe(50_000 + 1000 + 4000 + 200 + 800);
      expect(career.ledger.map((line) => line.kind)).toEqual(['race', 'standings', 'sponsorBonus', 'sponsorBonus']);
    });
  });
});

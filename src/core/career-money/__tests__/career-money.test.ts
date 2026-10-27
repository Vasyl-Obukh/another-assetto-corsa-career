import { describe, expect, it } from '@jest/globals';

import {
  CUP, makeCareer, makeContract, makeEntry, makeEvent, makeOffer, makePlace, makeRace, makeSeason, makeStanding,
} from './fixtures.ts';
import type {
  Career, Contract, OwnedCar, SeasonEntry, SeasonEvent,
} from '../../../shared/types/index.ts';
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
  refundLine,
  releaseLine,
  rentLine,
  rentOwed,
  rentPaid,
  repaintLine,
  salaryPaid,
  saleLine,
  seatLine,
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

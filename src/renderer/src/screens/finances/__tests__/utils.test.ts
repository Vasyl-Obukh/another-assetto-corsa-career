import { describe, expect, it } from '@jest/globals';
import type { TFunction } from 'i18next';

import type { Career, LedgerLine } from '../../../../../shared/types';
import { describeLine } from '../utils.ts';

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
 * Formats a number the way a test can read back.
 * @param value The number
 * @returns It, as written
 */
const formatNumber = (value: number): string => String(value);

/**
 * The formatters a line is described with, each writing its value back as is.
 */
const FORMAT = { formatNumber, formatMoney: formatNumber, formatDay: (value: string): string => value };

/**
 * A career whose 2027 season ran the cup twice, which is what names an edition
 * by its half.
 */
const CAREER = {
  seasons: [{
    index: 0,
    startDate: '2027-01-01',
    endDate: '2027-12-31',
    entries: [{ series: 'cup', edition: 1, championship: { seasonLength: 'half-year' } }],
  }],
} as unknown as Career;

/**
 * Builds a ledger line from the cup.
 * @param over What the test wants said of it
 * @returns The line
 */
const line = (over: Partial<LedgerLine>): LedgerLine => ({
  key: 'line',
  kind: 'race',
  date: '2027-03-07',
  season: 0,
  amount: 1000,
  series: 'cup',
  seriesName: 'Cup',
  round: 'one',
  roundName: 'Imola',
  number: 3,
  ...over,
});

describe('renderer/screens/finances/utils', () => {
  describe('describeLine', () => {
    it('names a race prize by its round and race, and the place it paid', () => {
      expect(describeLine(line({ race: 'Race 2', place: 1 }), CAREER, translate, FORMAT)).toEqual({
        title: 'finances.line.race(round=finances.line.round(number=3,round=Imola),race=Race 2)',
        detail: 'finances.line.place(series=Cup,place=1)',
      });
    });

    it('names a fee by its round and championship', () => {
      expect(describeLine(line({ kind: 'fee', amount: -1500 }), CAREER, translate, FORMAT)).toEqual({
        title: 'finances.line.round(number=3,round=Imola)',
        detail: 'finances.line.feeDetail(series=Cup)',
      });
    });

    it('names a historic purse by the event itself', () => {
      const historic = line({
        kind: 'historic', seriesName: 'Spa 1966', race: 'Race', place: 4,
      });

      expect(describeLine(historic, CAREER, translate, FORMAT)).toEqual({
        title: 'Spa 1966',
        detail: 'finances.line.historicDetail(race=Race,place=4)',
      });
    });

    it('names a final standing by the edition it closed', () => {
      const standing = line({ kind: 'standings', edition: 1, place: 2 });

      expect(describeLine(standing, CAREER, translate, FORMAT)).toEqual({
        title: 'finances.line.standings(series=Cup,edition=edition.half(number=2,year=2027))',
        detail: 'finances.line.standingsDetail(place=2)',
      });
    });

    it('names a change of speed by the speeds either side of it', () => {
      const speed = line({ kind: 'speed', amount: 0, speed: { from: 1, to: 2 } });

      expect(describeLine(speed, CAREER, translate, FORMAT)).toEqual({
        title: 'finances.line.speed(from=finances.speed(speed=1),to=finances.speed(speed=2))',
        detail: 'finances.line.speedDetail(to=finances.speed(speed=2))',
      });
    });

    it("names a round's rent by its round, and the car and championship it was for", () => {
      const rent = line({ kind: 'rent', amount: -800, car: { model: 'mx5', name: 'MX-5 Cup' } });

      expect(describeLine(rent, CAREER, translate, FORMAT)).toEqual({
        title: 'finances.line.round(number=3,round=Imola)',
        detail: 'finances.line.rentDetail(car=MX-5 Cup,series=Cup)',
      });
    });

    it('names a car bought by the car, and the livery it was bought in', () => {
      const bought = line({
        kind: 'purchase', amount: -40_000, car: { model: 'mx5', name: 'MX-5 Cup', livery: 'Red' },
      });

      expect(describeLine(bought, CAREER, translate, FORMAT)).toEqual({
        title: 'MX-5 Cup',
        detail: 'finances.line.boughtIn(livery=Red)',
      });
    });

    it('names a car bought in no livery by the car alone', () => {
      const bought = line({ kind: 'purchase', amount: -40_000, car: { model: 'mx5', name: 'MX-5 Cup' } });

      expect(describeLine(bought, CAREER, translate, FORMAT).detail).toBe('finances.line.bought');
    });

    it('names a car sold by what was paid for it and when', () => {
      const sold = line({
        kind: 'sale',
        amount: 36_000,
        car: {
          model: 'mx5', name: 'MX-5 Cup', paid: 40_000, bought: '2027-01-10',
        },
      });

      expect(describeLine(sold, CAREER, translate, FORMAT)).toEqual({
        title: 'MX-5 Cup',
        detail: 'finances.line.sold(paid=40000,day=2027-01-10)',
      });
    });

    it('names a repaint by the liveries either side of it', () => {
      const repaint = line({
        kind: 'repaint',
        amount: -600,
        car: {
          model: 'mx5', name: 'MX-5 Cup', from: 'Red', livery: 'Blue',
        },
      });

      expect(describeLine(repaint, CAREER, translate, FORMAT)).toEqual({
        title: 'MX-5 Cup',
        detail: 'finances.line.repainted(from=Red,to=Blue)',
      });
    });

    it("names a race prize under contract by the share of the purse that was the player's", () => {
      const shared = line({
        race: 'Race 1', place: 2, amount: 500, share: { percent: 25, purse: 2000 },
      });

      expect(describeLine(shared, CAREER, translate, FORMAT).detail)
        .toBe('finances.line.placeShare(series=Cup,place=2,share=25,purse=2000)');
    });

    it("names a final standing under contract by the share of the purse that was the player's", () => {
      const shared = line({
        kind: 'standings', edition: 1, place: 1, amount: 3000, share: { percent: 30, purse: 10_000 },
      });

      expect(describeLine(shared, CAREER, translate, FORMAT).detail)
        .toBe('finances.line.standingsShare(place=1,share=30,purse=10000)');
    });

    it("names a round's salary and fine by the round, the team and the championship", () => {
      const salary = line({ kind: 'salary', amount: 2500, team: 'Alpha Racing' });
      const fine = line({ kind: 'fine', amount: -1500, team: 'Alpha Racing' });

      expect(describeLine(salary, CAREER, translate, FORMAT)).toEqual({
        title: 'finances.line.round(number=3,round=Imola)',
        detail: 'finances.line.salaryDetail(team=Alpha Racing,series=Cup)',
      });
      expect(describeLine(fine, CAREER, translate, FORMAT)).toEqual({
        title: 'finances.line.round(number=3,round=Imola)',
        detail: 'finances.line.fineDetail(team=Alpha Racing,series=Cup)',
      });
    });

    it('names a standings bonus by the edition it closed, the team and the place it paid', () => {
      const bonus = line({
        kind: 'bonus', amount: 4000, edition: 1, place: 1, team: 'Alpha Racing',
      });

      expect(describeLine(bonus, CAREER, translate, FORMAT)).toEqual({
        title: 'finances.line.standings(series=Cup,edition=edition.half(number=2,year=2027))',
        detail: 'finances.line.bonusDetail(team=Alpha Racing,place=1)',
      });
    });

    it('names a seat paid for by the team and the edition it was for', () => {
      const seat = line({
        kind: 'seat', amount: -9000, edition: 1, team: 'Alpha Racing',
      });

      expect(describeLine(seat, CAREER, translate, FORMAT)).toEqual({
        title: 'finances.line.seat(team=Alpha Racing)',
        detail: 'finances.line.seatDetail(series=Cup,edition=edition.half(number=2,year=2027))',
      });
    });

    it('names a release fee and a refund by the team left and the rounds still to race', () => {
      const release = line({
        kind: 'release', amount: -800, edition: 1, place: 3, team: 'Alpha Racing',
      });
      const refund = line({
        kind: 'refund', amount: 3000, edition: 1, place: 2, team: 'Alpha Racing',
      });

      expect(describeLine(release, CAREER, translate, FORMAT)).toEqual({
        title: 'finances.line.terminated(team=Alpha Racing)',
        detail: 'finances.line.releaseDetail(series=Cup,edition=edition.half(number=2,year=2027),count=3)',
      });
      expect(describeLine(refund, CAREER, translate, FORMAT)).toEqual({
        title: 'finances.line.terminated(team=Alpha Racing)',
        detail: 'finances.line.refundDetail(series=Cup,edition=edition.half(number=2,year=2027),count=2)',
      });
    });

    it('names an edition by its year where the season no longer lists it, and nothing where the season is gone', () => {
      expect(describeLine(line({ kind: 'seat', series: 'gone', edition: 0 }), CAREER, translate, FORMAT).detail)
        .toBe('finances.line.seatDetail(series=Cup,edition=edition.year(year=2027))');
      expect(describeLine(line({ kind: 'seat', season: 4 }), CAREER, translate, FORMAT).detail)
        .toBe('finances.line.seatDetail(series=Cup,edition=)');
    });

    it("names a sponsor's signing bonus, and its repayment, by the sponsor", () => {
      const sponsor = { deal: 'sponsor:spa', name: 'Halden Lubricants', perk: 'signing' as const };
      const signing = line({ kind: 'sponsor', amount: 5000, sponsor });
      const repaid = line({ kind: 'sponsor', amount: -2000, sponsor });

      expect(describeLine(signing, CAREER, translate, FORMAT)).toEqual({
        title: 'Halden Lubricants',
        detail: 'finances.line.sponsor.signing',
      });
      expect(describeLine(repaid, CAREER, translate, FORMAT).detail).toBe('finances.line.sponsor.repaid');
    });

    it("names a sponsor's car backing by the car, its goal bonus, and its prize match by the championship", () => {
      const of = (perk: 'carBacking' | 'goalBonus' | 'prizeMatch'): LedgerLine => line({
        kind: perk === 'goalBonus' ? 'sponsorBonus' : 'sponsor',
        car: { model: 'mx5', name: 'MX-5 Cup' },
        sponsor: { deal: 'sponsor:spa', name: 'Halden Lubricants', perk },
      });

      expect(describeLine(of('carBacking'), CAREER, translate, FORMAT).detail).toBe('finances.line.sponsor.car(car=MX-5 Cup)');
      expect(describeLine(of('goalBonus'), CAREER, translate, FORMAT).detail).toBe('finances.line.sponsor.goal');
      expect(describeLine(of('prizeMatch'), CAREER, translate, FORMAT).detail).toBe('finances.line.sponsor.match(series=Cup)');
    });

    it("names a sponsor's race pay by the round, the race and what it paid for, and says when it was halved", () => {
      const pay = line({
        kind: 'sponsor', race: 'Race 1', place: 4, sponsor: { deal: 'sponsor:spa', name: 'Halden Lubricants', perk: 'racePay' },
      });
      const half = line({
        kind: 'sponsor',
        race: 'Race 1',
        place: 12,
        sponsor: {
          deal: 'sponsor:spa', name: 'Halden Lubricants', perk: 'racePay', half: true,
        },
      });

      expect(describeLine(pay, CAREER, translate, FORMAT)).toEqual({
        title: 'Halden Lubricants',
        detail: 'finances.line.round(number=3,round=Imola) · Race 1 · finances.line.sponsor.racePay(place=4)',
      });
      expect(describeLine(half, CAREER, translate, FORMAT).detail)
        .toBe('finances.line.round(number=3,round=Imola) · Race 1 · finances.line.sponsor.racePay(place=12) · finances.line.sponsor.half');
    });

    it("names a sponsor's results bonus by the place it paid, and a line with no round by its championship", () => {
      const win = line({
        kind: 'sponsorBonus', race: 'Race 2', place: 1, sponsor: { deal: 'sponsor:spa', name: 'Halden Lubricants', perk: 'win' },
      });
      const noRound = line({
        kind: 'sponsorBonus',
        roundName: undefined,
        race: undefined,
        place: 1,
        sponsor: { deal: 'sponsor:spa', name: 'Halden Lubricants', perk: 'pole' },
      });

      expect(describeLine(win, CAREER, translate, FORMAT).detail)
        .toBe('finances.line.round(number=3,round=Imola) · Race 2 · finances.line.sponsor.win(place=1)');
      expect(describeLine(noRound, CAREER, translate, FORMAT).detail).toBe('Cup · finances.line.sponsor.pole(place=1)');
    });

    it('names the opening balance', () => {
      expect(describeLine(line({ kind: 'opening' }), CAREER, translate, FORMAT)).toEqual({
        title: 'finances.line.opening',
        detail: 'finances.line.openingDetail',
      });
    });
  });
});

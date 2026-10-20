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
      expect(describeLine(line({ race: 'Race 2', place: 1 }), CAREER, translate, formatNumber)).toEqual({
        title: 'finances.line.race(round=finances.line.round(number=3,round=Imola),race=Race 2)',
        detail: 'finances.line.place(series=Cup,place=1)',
      });
    });

    it('names a fee by its round and championship', () => {
      expect(describeLine(line({ kind: 'fee', amount: -1500 }), CAREER, translate, formatNumber)).toEqual({
        title: 'finances.line.round(number=3,round=Imola)',
        detail: 'finances.line.feeDetail(series=Cup)',
      });
    });

    it('names a historic purse by the event itself', () => {
      const historic = line({
        kind: 'historic', seriesName: 'Spa 1966', race: 'Race', place: 4,
      });

      expect(describeLine(historic, CAREER, translate, formatNumber)).toEqual({
        title: 'Spa 1966',
        detail: 'finances.line.historicDetail(race=Race,place=4)',
      });
    });

    it('names a final standing by the edition it closed', () => {
      const standing = line({ kind: 'standings', edition: 1, place: 2 });

      expect(describeLine(standing, CAREER, translate, formatNumber)).toEqual({
        title: 'finances.line.standings(series=Cup,edition=edition.half(number=2,year=2027))',
        detail: 'finances.line.standingsDetail(place=2)',
      });
    });

    it('names a change of speed by the speeds either side of it', () => {
      const speed = line({ kind: 'speed', amount: 0, speed: { from: 1, to: 2 } });

      expect(describeLine(speed, CAREER, translate, formatNumber)).toEqual({
        title: 'finances.line.speed(from=finances.speed(speed=1),to=finances.speed(speed=2))',
        detail: 'finances.line.speedDetail(to=finances.speed(speed=2))',
      });
    });

    it('names the opening balance', () => {
      expect(describeLine(line({ kind: 'opening' }), CAREER, translate, formatNumber)).toEqual({
        title: 'finances.line.opening',
        detail: 'finances.line.openingDetail',
      });
    });
  });
});

import type { TFunction } from 'i18next';

import type { Career, LedgerLine } from '../../../../shared/types';
import { editionsOf, seasonYear } from '../../../../shared/utils/editions';
import { editionName } from '@/lib/edition-names';

/**
 * What a ledger line says it was for: a line naming it, and a line of detail.
 * @param line The line
 * @param career The career, whose seasons name the year an edition ran in
 * @param t The translator
 * @param formatNumber Formats a number, a progression speed's
 * @returns The two lines
 */
export const describeLine = (
  line: LedgerLine,
  career: Career,
  t: TFunction,
  formatNumber: (value: number) => string,
): { title: string; detail: string } => {
  const round = t('finances.line.round', { number: line.number ?? 1, round: line.roundName ?? '' });
  const series = line.seriesName ?? '';

  switch (line.kind) {
    case 'opening':
      return { title: t('finances.line.opening'), detail: t('finances.line.openingDetail') };
    case 'fee':
      return { title: round, detail: t('finances.line.feeDetail', { series }) };
    case 'race':
      return {
        title: t('finances.line.race', { round, race: line.race ?? '' }),
        detail: t('finances.line.place', { series, place: line.place ?? 0 }),
      };
    case 'historic':
      return {
        title: series,
        detail: t('finances.line.historicDetail', { race: line.race ?? '', place: line.place ?? 0 }),
      };
    case 'standings': {
      const season = career.seasons.find((one) => one.index === line.season);
      const entry = season?.entries.find((one) => one.series === line.series && one.edition === line.edition);
      const edition = season ? editionName({
        year: seasonYear(season),
        edition: line.edition ?? 0,
        editions: entry ? editionsOf(entry.championship) : 1,
      }, t) : '';

      return {
        title: t('finances.line.standings', { series, edition }),
        detail: t('finances.line.standingsDetail', { place: line.place ?? 0 }),
      };
    }
    default: {
      const speed = (value: number): string => t('finances.speed', { speed: formatNumber(value) });

      return {
        title: t('finances.line.speed', { from: speed(line.speed?.from ?? 1), to: speed(line.speed?.to ?? 1) }),
        detail: t('finances.line.speedDetail', { to: speed(line.speed?.to ?? 1) }),
      };
    }
  }
};

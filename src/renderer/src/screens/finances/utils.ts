import type { TFunction } from 'i18next';

import type { Career, LedgerLine } from '../../../../shared/types';
import { editionsOf, seasonYear } from '../../../../shared/utils/editions';
import type { Formatters } from '@/i18n';
import { editionName } from '@/lib/edition-names';

/**
 * A fee's or a rent's detail, saying what a sponsor took off it.
 * @param line The line
 * @param detail What it says otherwise
 * @param t The translator
 * @param formatMoney Formats an amount
 * @returns The detail
 */
const withOff = (line: LedgerLine, detail: string, t: TFunction, formatMoney: (amount: number) => string): string => {
  const offBy = line.offBy ?? [];
  if (offBy.length === 0) return detail;
  const whole = -line.amount + offBy.reduce((sum, one) => sum + one.amount, 0);

  return [detail, t('finances.line.offBy', {
    whole: formatMoney(whole),
    off: offBy.map((one) => t('finances.line.offByOne', { amount: formatMoney(one.amount), sponsor: one.sponsor })).join(', '),
  })].join(' · ');
};

/**
 * What a ledger line says it was for: a line naming it, and a line of detail.
 * @param line The line
 * @param career The career, whose seasons name the year an edition ran in
 * @param t The translator
 * @param format Formats a progression speed, and what a car sold was bought
 * for and when
 * @returns The two lines
 */
export const describeLine = (
  line: LedgerLine,
  career: Career,
  t: TFunction,
  format: Pick<Formatters, 'formatNumber' | 'formatMoney' | 'formatDay'>,
): { title: string; detail: string } => {
  const round = t('finances.line.round', { number: line.number ?? 1, round: line.roundName ?? '' });
  const series = line.seriesName ?? '';
  const car = line.car?.name ?? '';
  const team = line.team ?? '';
  // What the edition a line came from is called, off the season it ran in.
  const edition = (): string => {
    const season = career.seasons.find((one) => one.index === line.season);
    const entry = season?.entries.find((one) => one.series === line.series && one.edition === line.edition);

    return season ? editionName({
      year: seasonYear(season),
      edition: line.edition ?? 0,
      editions: entry ? editionsOf(entry.championship) : 1,
    }, t) : '';
  };
  // A prize under contract says the share of the purse it was.
  const share = line.share
    ? { share: line.share.percent, purse: format.formatMoney(line.share.purse) }
    : null;

  switch (line.kind) {
    case 'opening':
      return { title: t('finances.line.opening'), detail: t('finances.line.openingDetail') };
    case 'fee':
      return { title: round, detail: withOff(line, t('finances.line.feeDetail', { series }), t, format.formatMoney) };
    case 'rent':
      return { title: round, detail: withOff(line, t('finances.line.rentDetail', { car, series }), t, format.formatMoney) };
    case 'purchase':
      return {
        title: car,
        detail: line.car?.livery === undefined ? t('finances.line.bought') : t('finances.line.boughtIn', { livery: line.car.livery }),
      };
    case 'sale':
      return {
        title: car,
        detail: t('finances.line.sold', {
          paid: format.formatMoney(line.car?.paid ?? 0), day: format.formatDay(line.car?.bought ?? line.date),
        }),
      };
    case 'repaint':
      return { title: car, detail: t('finances.line.repainted', { from: line.car?.from ?? '', to: line.car?.livery ?? '' }) };
    case 'race':
      return {
        title: t('finances.line.race', { round, race: line.race ?? '' }),
        detail: share
          ? t('finances.line.placeShare', { series, place: line.place ?? 0, ...share })
          : t('finances.line.place', { series, place: line.place ?? 0 }),
      };
    case 'salary':
      return { title: round, detail: t('finances.line.salaryDetail', { team, series }) };
    case 'fine':
      return { title: round, detail: t('finances.line.fineDetail', { team, series }) };
    case 'bonus':
      return {
        title: t('finances.line.standings', { series, edition: edition() }),
        detail: t('finances.line.bonusDetail', { team, place: line.place ?? 0 }),
      };
    case 'seat':
      return {
        title: t('finances.line.seat', { team }),
        detail: t('finances.line.seatDetail', { series, edition: edition() }),
      };
    case 'release':
      return {
        title: t('finances.line.terminated', { team }),
        detail: t('finances.line.releaseDetail', { series, edition: edition(), count: line.place ?? 0 }),
      };
    case 'refund':
      return {
        title: t('finances.line.terminated', { team }),
        detail: t('finances.line.refundDetail', { series, edition: edition(), count: line.place ?? 0 }),
      };
    case 'historic':
      return {
        title: series,
        detail: t('finances.line.historicDetail', { race: line.race ?? '', place: line.place ?? 0 }),
      };
    case 'sponsor':
    case 'sponsorBonus': {
      const perk = line.sponsor?.perk ?? 'racePay';
      const sponsor = line.sponsor?.name ?? '';
      if (perk === 'signing') {
        return { title: sponsor, detail: t(line.amount < 0 ? 'finances.line.sponsor.repaid' : 'finances.line.sponsor.signing') };
      }
      if (perk === 'carBacking') return { title: sponsor, detail: t('finances.line.sponsor.car', { car }) };
      if (perk === 'seatBacking') return { title: sponsor, detail: t('finances.line.sponsor.seat', { series }) };
      if (perk === 'carReward') return { title: sponsor, detail: t('finances.line.sponsor.carReward') };
      if (perk === 'goalBonus') return { title: sponsor, detail: t('finances.line.sponsor.goal') };
      if (perk === 'prizeMatch') return { title: sponsor, detail: t('finances.line.sponsor.match', { series }) };
      // Race pay or a results bonus, the only perks left by now.
      const result = perk as 'racePay' | 'win' | 'podium' | 'points' | 'pole';
      const what = t(`finances.line.sponsor.${result}`, { place: line.place ?? 0 });

      return {
        title: sponsor,
        detail: [line.roundName ? round : series, line.race, what, line.sponsor?.half ? t('finances.line.sponsor.half') : null]
          .filter(Boolean).join(' · '),
      };
    }
    case 'standings':
      return {
        title: t('finances.line.standings', { series, edition: edition() }),
        detail: share
          ? t('finances.line.standingsShare', { place: line.place ?? 0, ...share })
          : t('finances.line.standingsDetail', { place: line.place ?? 0 }),
      };
    default: {
      const speed = (value: number): string => t('finances.speed', { speed: format.formatNumber(value) });

      return {
        title: t('finances.line.speed', { from: speed(line.speed?.from ?? 1), to: speed(line.speed?.to ?? 1) }),
        detail: t('finances.line.speedDetail', { to: speed(line.speed?.to ?? 1) }),
      };
    }
  }
};

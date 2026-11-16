import { useTranslation } from 'react-i18next';

import { RacePrizes } from './RacePrizes.tsx';
import { pursesOf } from './utils.ts';
import type { Championship } from '../../../../shared/types';
import { entryFeeOf } from '../../../../shared/utils/entry-fees';
import { useFormat } from '@/i18n';

interface HistoricPrizesProps {
  /**
   * The historic event.
   */
  event: Championship;
  /**
   * The progression speed its prize money is shown at, 1 for the purse as
   * written.
   */
  speed?: number;
  /**
   * The rung its purse is paid at, when a career races it.
   */
  rung?: number;
}

// What a historic event pays a place, in money alone: its points table pays
// nothing, so it is left out of the table rather than shown as a column of
// zeroes.
export const HistoricPrizes = ({ event, speed = 1, rung }: HistoricPrizesProps) => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();
  const purses = pursesOf(event, speed, rung);
  const paid = purses.some((purse) => (purse.prizes?.positions?.length ?? 0) > 0);

  // What entering costs without an invitation, a class at a time where the
  // classes are charged differently.
  const fees = event.entries.map((entry) => ({
    entry, fee: entryFeeOf(event, event.rounds[0]?.id ?? '', entry.id) ?? 0,
  }));
  const shared = fees.every((one) => one.fee === fees[0]?.fee);
  const feeLine = (
    <p className="text-sm text-muted-foreground">
      {shared
        ? t('historic.about.fee', { amount: formatMoney(fees[0]?.fee ?? 0) })
        : t('historic.about.fees', {
          fees: fees.map((one) => t('historic.about.classFee', {
            name: one.entry.name, amount: formatMoney(one.fee),
          })).join(' · '),
        })}
    </p>
  );

  if (!paid) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">{t('historic.about.noPrizes')}</p>
        {feeLine}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <RacePrizes series={{ ...event, pointsSystems: [] }} purses={purses} split={purses.length > 1} />
      {feeLine}
    </div>
  );
};

import { useTranslation } from 'react-i18next';

import { RacePrizes } from './RacePrizes.tsx';
import { pursesOf } from './utils.ts';
import type { Championship } from '../../../../shared/types';

interface HistoricPrizesProps {
  /**
   * The historic event.
   */
  event: Championship;
}

// What a historic event pays a place, in money alone: its points table pays
// nothing, so it is left out of the table rather than shown as a column of
// zeroes.
export const HistoricPrizes = ({ event }: HistoricPrizesProps) => {
  const { t } = useTranslation();
  const purses = pursesOf(event.prizes, event.entries);
  const paid = purses.some((purse) => (purse.prizes?.positions?.length ?? 0) > 0);

  if (!paid) return <p className="text-sm text-muted-foreground">{t('historic.about.noPrizes')}</p>;

  return <RacePrizes series={{ ...event, pointsSystems: [] }} purses={purses} split={purses.length > 1} />;
};

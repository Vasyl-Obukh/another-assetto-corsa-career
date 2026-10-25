import { GaugeIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { RATING_MAX_LOSS } from '../../../../shared/constants';
import { useFormat } from '@/i18n';
import { path } from '@/lib/routes';

interface HowItMovesProps {
  /**
   * The career's rating speed.
   */
  speed: number;
}

/**
 * The rules in four lines, beside the log they explain, and the speed the
 * career rates at with the way to change it.
 */
export const HowItMoves = ({ speed }: HowItMovesProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();

  return (
    <section className="flex flex-col gap-2 rounded-xl border bg-card p-4 text-sm">
      <h2 className="font-semibold">{t('rating.how.title')}</h2>
      <p className="text-muted-foreground">{t('rating.how.moves')}</p>
      <p className="text-muted-foreground">{t('rating.how.cap', { most: formatNumber(RATING_MAX_LOSS * speed) })}</p>
      <p className="text-muted-foreground">{t('rating.how.levels')}</p>
      <p className="text-muted-foreground">{t('rating.how.through')}</p>
      <p className="mt-1 flex items-center gap-1.5">
        <GaugeIcon className="size-4 text-muted-foreground" />
        {t('rating.how.speed')}
        <span className="font-semibold">{t('finances.speed', { speed: formatNumber(speed) })}</span>
        <Link to={path.settingsCareer()} className="ml-auto text-primary hover:underline">{t('rating.how.settings')}</Link>
      </p>
    </section>
  );
};

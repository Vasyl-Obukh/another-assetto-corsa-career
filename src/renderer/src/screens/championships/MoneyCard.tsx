import { useTranslation } from 'react-i18next';

import type { PrizeMoney } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { useFormat } from '@/i18n';

interface MoneyCardProps {
  /**
   * What entering a round costs, when the championship charges one.
   */
  entryFee?: number;
  /**
   * What the championship pays out.
   */
  prizes?: PrizeMoney;
}

export const MoneyCard = ({ entryFee, prizes }: MoneyCardProps) => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();

  /**
   * Lists one prize table as the badges it is made of.
   *
   * The same shape PointsCard uses for a points system, because the two are the
   * same list read two ways and a career page showing them differently would be
   * saying something it does not mean.
   * @param amounts What each position pays
   * @returns One label per position paid
   */
  const rows = (amounts: readonly number[]): string[] => amounts.map((amount, index) => t(
    'championships.money.row',
    { label: t('championships.money.position', { number: index + 1 }), amount: formatMoney(amount) },
  ));

  return (
    <Card>
      <CardHeader><CardTitle>{t('championships.money.title')}</CardTitle></CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{t('championships.money.entryFee')}</span>
          {/* A free championship says so rather than showing nothing: an
              absent fee and a fee of zero are different facts. */}
          <Badge variant="outline">
            {entryFee ? formatMoney(entryFee) : t('championships.money.free')}
          </Badge>
        </div>

        {prizes?.positions?.length ? (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">{t('championships.money.roundPrizes')}</span>
            <div className="flex flex-wrap gap-2">
              {rows(prizes.positions).map((row) => (
                <Badge key={row} variant="outline">{row}</Badge>
              ))}
            </div>
          </div>
        ) : null}

        {prizes?.standings?.length ? (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">{t('championships.money.seasonPrizes')}</span>
            <div className="flex flex-wrap gap-2">
              {rows(prizes.standings).map((row) => (
                <Badge key={row} variant="outline">{row}</Badge>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

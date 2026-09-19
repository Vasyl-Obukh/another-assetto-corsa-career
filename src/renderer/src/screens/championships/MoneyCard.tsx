import { useTranslation } from 'react-i18next';

import { pursesOf } from './utils.ts';
import type { ClassEntry, PrizeMoney } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { useFormat } from '@/i18n';
import { PODIUM_ACCENT } from '@/lib/accents';

interface MoneyCardProps {
  /**
   * What entering a round costs, when the championship charges one.
   */
  entryFee?: number;
  /**
   * What the championship pays out.
   */
  prizes?: PrizeMoney;
  /**
   * Its classes, any of which may pay a purse of its own.
   */
  entries: readonly ClassEntry[];
}

export const MoneyCard = ({ entryFee, prizes, entries }: MoneyCardProps) => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();

  /**
   * Lists one prize table as the badges it is made of.
   *
   * The same shape PointsCard uses for a points system, because the two are the
   * same list read two ways and a career page showing them differently would be
   * saying something it does not mean.
   * @param amounts What each position pays
   * @returns One label per position paid, with the colour it wears
   */
  const rows = (amounts: readonly number[]): { label: string; accent?: string }[] => amounts.map(
    (amount, index) => ({
      label: t('championships.money.row', {
        label: t('championships.money.position', { number: index + 1 }),
        amount: formatMoney(amount),
      }),
      accent: PODIUM_ACCENT[index],
    }),
  );

  /**
   * One purse's two tables, under the classes it is paid to when there is
   * more than one purse.
   * @param purse What is paid
   * @param heading Which classes it is paid to, or null for a single purse
   * @returns The tables, or null when neither pays anything
   */
  const tables = (purse: PrizeMoney | undefined, heading: string | null) => {
    if (!purse?.positions?.length && !purse?.standings?.length) return null;

    return (
      <div key={heading ?? 'all'} className="flex flex-col gap-4">
        {heading ? <span className="text-sm font-semibold">{heading}</span> : null}

        {purse.positions?.length ? (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">{t('championships.money.roundPrizes')}</span>
            <div className="flex flex-wrap gap-2">
              {rows(purse.positions).map((row) => (
                <Badge key={row.label} variant="outline" className={row.accent}>
                  {row.label}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}

        {purse.standings?.length ? (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">{t('championships.money.seasonPrizes')}</span>
            <div className="flex flex-wrap gap-2">
              {rows(purse.standings).map((row) => (
                <Badge key={row.label} variant="outline" className={row.accent}>
                  {row.label}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  const purses = pursesOf(prizes, entries);

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

        {/* Headed by class only once the classes are paid differently; one
            purse for the whole grid needs no heading. */}
        {purses.map((purse) => tables(
          purse.prizes,
          purses.length > 1 ? purse.classes.join(', ') : null,
        ))}
      </CardContent>
    </Card>
  );
};

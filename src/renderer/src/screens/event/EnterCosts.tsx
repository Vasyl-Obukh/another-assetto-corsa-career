import { useTranslation } from 'react-i18next';

import { sharesText } from './utils.ts';
import type { Career, Discipline } from '../../../../shared/types';
import { afterShares, costShares, coveringDeal } from '../../../../shared/utils/sponsors';
import { SparkleMark } from '@/components';
import { useFormat } from '@/i18n';

interface EnterCostsProps {
  /**
   * The career, whose sponsors take their part - null outside one.
   */
  career: Career | null;
  /**
   * The championship, by id.
   */
  series: string;
  /**
   * The class's discipline.
   */
  discipline: Discipline | null;
  /**
   * The ISO date of the first round it would race.
   */
  date: string;
  /**
   * The class's entry fee, null for none.
   */
  fee: number | null;
  /**
   * A rented car's rent, null for none.
   */
  rent: number | null;
  /**
   * Whether it is a historic event, costing once rather than a round.
   */
  historic: boolean;
}

// What entering costs a round, each figure what the player will pay: a sparkle
// says what a sponsor took off it, cyan for a partner's share and the main
// sponsor's pink for a fee it covers.
export const EnterCosts = ({
  career, series, discipline, date, fee, rent, historic,
}: EnterCostsProps) => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();
  if (!fee && !rent) return null;

  const covering = career && fee ? coveringDeal(career, series, date) : null;
  const paysFee = !!fee && !covering;
  const each = (amount: number): string => (
    t(historic ? 'event.enter.perEvent' : 'event.enter.perRound', { amount: formatMoney(amount) })
  );
  const row = (label: string, whole: number, kind: 'feeShare' | 'rentShare') => {
    const off = career ? costShares(career, discipline, date, kind, whole) : [];

    return (
      <>
        <dt className="text-muted-foreground">{label}</dt>
        <dd className="flex items-center justify-end gap-1.5 font-semibold tabular-nums">
          {off.length > 0 ? <SparkleMark text={sharesText(off, t)} className="text-partner-foreground" /> : null}
          {each(afterShares(whole, off))}
        </dd>
      </>
    );
  };
  let hint: string | null = null;
  if (rent && paysFee) hint = t(historic ? 'event.enter.historicRentHint' : 'event.enter.rentHint');
  else if (rent || paysFee) hint = t(historic ? 'event.enter.historicFeeHint' : 'event.enter.feeHint');

  return (
    <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 border-t pt-2.5 text-xs">
      {fee && covering ? (
        <>
          <dt className="text-muted-foreground">{t('event.enter.fee')}</dt>
          <dd className="flex items-center justify-end gap-1.5 font-semibold">
            <SparkleMark text={each(fee)} />
            {t('event.enter.coveredBy', { sponsor: covering.sponsor.name })}
          </dd>
        </>
      ) : null}
      {fee && !covering ? row(t('event.enter.fee'), fee, 'feeShare') : null}
      {rent ? row(t('event.enter.rent'), rent, 'rentShare') : null}
      {hint ? <dd className="col-span-2 text-muted-foreground">{hint}</dd> : null}
      {/* Racing on the player's own, against what a contract asks. */}
      {historic ? null : <dd className="col-span-2 text-muted-foreground">{t('event.enter.own')}</dd>}
    </dl>
  );
};

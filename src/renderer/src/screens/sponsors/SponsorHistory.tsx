import { ChevronRightIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import type { DealRow } from './types.ts';
import {
  CoversBadge, MoneyAmount, SponsorMark,
} from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { SPONSOR_ACCENT, SPONSOR_END_ACCENT } from '@/lib/accents';
import { path } from '@/lib/routes';

interface SponsorHistoryProps {
  /**
   * Every deal the career signed, newest first.
   */
  rows: readonly DealRow[];
}

/**
 * Every sponsor the career has had, a year at a time by when each signed:
 * what each covered, the races it covered, what it paid and how it ended. A
 * row opens the offer the deal was signed on, so its terms read back.
 */
export const SponsorHistory = ({ rows }: SponsorHistoryProps) => {
  const { t } = useTranslation();
  const { formatDay, formatNumber } = useFormat();
  const navigate = useNavigate();
  const years = [...new Set(rows.map((row) => row.deal.signed.slice(0, 4)))];

  if (rows.length === 0) {
    return <p className="rounded-xl border-2 border-dashed p-6 text-center text-sm text-muted-foreground">{t('sponsors.history.none')}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-sm">
        <thead className="text-left text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-2 font-medium">{t('sponsors.history.sponsor')}</th>
            <th className="px-3 py-2 font-medium">{t('sponsors.history.slot')}</th>
            <th className="px-3 py-2 font-medium">{t('sponsors.history.covered')}</th>
            <th className="px-3 py-2 font-medium">{t('sponsors.history.signed')}</th>
            <th className="px-3 py-2 text-right font-medium">{t('sponsors.history.races')}</th>
            <th className="px-3 py-2 text-right font-medium">{t('sponsors.history.paid')}</th>
            <th className="px-4 py-2 font-medium">{t('sponsors.history.ended')}</th>
            <th aria-label={t('sponsors.card.offer')} className="w-10" />
          </tr>
        </thead>
        {years.map((year) => (
          <tbody key={year}>
            <tr>
              <td colSpan={8} className="border-t bg-muted/40 px-4 py-1.5 text-[0.65rem] font-semibold tracking-wide text-muted-foreground">
                {year}
              </td>
            </tr>
            {rows.filter((row) => row.deal.signed.startsWith(year)).map(({
              deal, paid, races, end,
            }) => (
              <tr
                key={deal.id}
                className="cursor-pointer border-t hover:bg-accent/50"
                title={t('sponsors.card.offer')}
                onClick={() => { void navigate(path.inbox(deal.id)); }}
              >
                <td className="px-4 py-2.5">
                  <span className="flex items-center gap-2.5">
                    <SponsorMark sponsor={deal.sponsor} slot={deal.slot} small />
                    <span className="font-medium">{deal.sponsor.name}</span>
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <Badge className={SPONSOR_ACCENT[deal.slot]}>{t(`sponsors.slot.${deal.slot}`)}</Badge>
                </td>
                <td className="px-3 py-2.5"><CoversBadge covers={deal.covers} /></td>
                <td className="px-3 py-2.5 text-muted-foreground tabular-nums">{formatDay(deal.signed)}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{formatNumber(races)}</td>
                <td className="px-3 py-2.5 text-right"><MoneyAmount amount={paid} /></td>
                <td className="px-4 py-2.5">
                  <span className="flex flex-col items-start gap-0.5">
                    <Badge className={SPONSOR_END_ACCENT[end]}>{t(`sponsors.end.${end}`)}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {end === 'running' ? t('sponsors.card.until', { day: formatDay(deal.until) }) : formatDay(deal.ended?.on ?? deal.until)}
                    </span>
                  </span>
                </td>
                <td className="pr-3 align-middle text-muted-foreground">
                  <ChevronRightIcon className="size-4" />
                </td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
};

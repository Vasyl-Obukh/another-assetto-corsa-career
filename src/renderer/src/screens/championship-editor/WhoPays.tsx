import { useTranslation } from 'react-i18next';

import { paysInAll } from './utils.ts';
import type { Championship } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { Card } from '@/components/ui/card.tsx';
import { useFormat } from '@/i18n';
import { TierMedal } from '@/screens/championships';

interface WhoPaysProps {
  /**
   * The championship, its classes and its own purse.
   */
  series: Championship;
  /**
   * Called to open a class's own prize money.
   * @param entry The class entry's id
   */
  onOpen: (entry: string) => void;
}

/**
 * Where each class's prize money comes from, under the championship's purse,
 * so a class paying its own is not a surprise found on its own tab.
 */
export const WhoPays = ({ series, onOpen }: WhoPaysProps) => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();

  return (
    <Card className="gap-2 px-4 py-3 sm:px-5">
      <h3 className="text-sm font-semibold">{t('editor.prizeMoney.whoPays')}</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground">
              <th className="pb-2 text-left font-normal">{t('editor.prizeMoney.class')}</th>
              <th className="pb-2 text-left font-normal">{t('editor.prizeMoney.paidFrom')}</th>
              <th className="pb-2 text-right font-normal">{t('editor.purse.race')}</th>
              <th className="pb-2 text-right font-normal">{t('editor.prizeMoney.winner')}</th>
              <th className="pb-2 text-right font-normal">{t('editor.purse.season')}</th>
              <th aria-hidden />
            </tr>
          </thead>
          <tbody>
            {series.entries.map((entry) => {
              const prizes = entry.prizes ?? series.prizes;

              return (
                <tr key={entry.id} className="border-t">
                  <td className="py-2 pr-3">
                    <span className="flex items-center gap-2">
                      <TierMedal tier={entry.ladder.tier} className="size-6 text-xs" />
                      <b className="font-semibold">{entry.name}</b>
                    </span>
                  </td>
                  <td className="py-2 pr-3">
                    {/* Tinted for a purse of its own, the thing worth noticing. */}
                    {entry.prizes ? (
                      <Badge className="border-transparent bg-primary/10 text-primary">{t('editor.prizeMoney.own')}</Badge>
                    ) : (
                      <span className="text-muted-foreground">{t('editor.prizeMoney.shared')}</span>
                    )}
                  </td>
                  <td className="py-2 pl-3 text-right tabular-nums">{formatMoney(paysInAll(prizes?.positions))}</td>
                  <td className="py-2 pl-3 text-right tabular-nums">{formatMoney(prizes?.positions?.[0] ?? 0)}</td>
                  <td className="py-2 pl-3 text-right tabular-nums">{formatMoney(paysInAll(prizes?.standings))}</td>
                  <td className="py-2 pl-3 text-right">
                    <button type="button" className="text-sm whitespace-nowrap text-primary hover:underline" onClick={() => onOpen(entry.id)}>
                      {t('editor.prizeMoney.edit')}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

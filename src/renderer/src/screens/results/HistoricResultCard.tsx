import { ChevronRightIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { HistoricChip } from '@/components';
import { useFormat } from '@/i18n';

interface HistoricResultCardProps {
  /**
   * What the player's place paid, or null for nothing.
   */
  prize: number | null;
  /**
   * Where the player finished in their class, for a race they drove.
   */
  place: number | null;
  /**
   * The event's page.
   */
  to: string;
}

// Where a championship's result shows the table after it, a historic event's
// shows what the place was worth and the way back to the event.
export const HistoricResultCard = ({ prize, place, to }: HistoricResultCardProps) => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();

  return (
    <aside className="flex flex-col rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-2 px-4 pt-4">
        <h2 className="text-sm font-semibold">{t('results.historic.title')}</h2>
        <HistoricChip />
      </div>
      <div className="flex flex-col gap-0.5 px-4 py-3">
        <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
          {t('event.summary.prize')}
        </span>
        <span className="text-xl font-semibold tabular-nums">
          {prize === null ? t('standings.none') : formatMoney(prize)}
        </span>
        {place === null ? null : (
          <span className="text-xs text-muted-foreground">{t('results.historic.for', { position: place })}</span>
        )}
      </div>
      <Link
        to={to}
        className="flex items-center justify-center gap-1 border-t py-2 text-xs font-medium text-primary hover:bg-accent/50"
      >
        {t('results.historic.open')}
        <ChevronRightIcon className="size-3.5" />
      </Link>
    </aside>
  );
};

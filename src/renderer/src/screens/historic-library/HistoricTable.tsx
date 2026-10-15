import { useTranslation } from 'react-i18next';

import { HISTORIC_SKELETON } from './constants.ts';
import { HistoricRow } from './HistoricRow.tsx';
import { HistoricRowSkeleton } from './HistoricRowSkeleton.tsx';
import type { SeriesListing } from '../../../../shared/types';
import type { SeriesCommandsState } from '@/hooks';
import { slots } from '@/lib/slots.ts';
import { cn } from '@/lib/utils.ts';
import { TABLE_HEADING } from '@/screens/championships';

interface HistoricTableProps {
  /**
   * The historic events to list, in the order they are shown.
   */
  listings: readonly SeriesListing[];
  /**
   * The tab's commands, shared by every row.
   */
  commands: SeriesCommandsState;
  /**
   * Whether the pool is still being read, which fills the table with skeleton
   * rows.
   */
  loading?: boolean;
}

// The pool as a table, denser than the cards for a pool that runs past forty.
export const HistoricTable = ({ listings, commands, loading = false }: HistoricTableProps) => {
  const { t } = useTranslation();

  return (
    // A container, so columns give way to the table's own width rather than the window's.
    <div className="@container overflow-hidden rounded-xl border bg-card">
      <table className="w-full border-collapse text-sm">
        <thead className="border-b bg-muted/40">
          <tr>
            <th scope="col" aria-hidden />
            <th scope="col" className={TABLE_HEADING}>{t('historicLibrary.column.event')}</th>
            <th scope="col" className={TABLE_HEADING}>{t('historicLibrary.column.discipline')}</th>
            <th scope="col" className={cn(TABLE_HEADING, 'hidden @[52rem]:table-cell')}>
              {t('historicLibrary.column.classes')}
            </th>
            <th scope="col" className={cn(TABLE_HEADING, 'text-right')}>{t('historicLibrary.column.field')}</th>
            <th scope="col" className={cn(TABLE_HEADING, 'hidden @[44rem]:table-cell')}>
              {t('historicLibrary.column.format')}
            </th>
            <th scope="col" aria-hidden />
            <th scope="col" aria-hidden />
          </tr>
        </thead>
        <tbody>
          {loading ? slots(HISTORIC_SKELETON).map((at) => <HistoricRowSkeleton key={at} />) : null}
          {listings.map((listing) => (
            <HistoricRow key={listing.series.id} listing={listing} commands={commands} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

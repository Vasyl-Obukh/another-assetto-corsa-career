import { useTranslation } from 'react-i18next';

import { LIBRARY_ROW_SKELETON } from './constants.ts';
import { LibraryRow } from './LibraryRow.tsx';
import { LibraryRowSkeleton } from './LibraryRowSkeleton.tsx';
import { SortHeading } from './SortHeading.tsx';
import type { SeriesListing } from '../../../../shared/types';
import type { ChampionshipCriteria, SeriesCommandsState } from '@/hooks';
import { slots } from '@/lib/slots.ts';
import { cn } from '@/lib/utils.ts';
import { TABLE_HEADING } from '@/screens/championships';

interface LibraryTableProps {
  /**
   * The championships to list, in the order they are shown.
   */
  listings: readonly SeriesListing[];
  /**
   * The tab's commands, shared by every row.
   */
  commands: SeriesCommandsState;
  /**
   * The list's filters and sort, which two of the headings set.
   */
  criteria: ChampionshipCriteria;
  /**
   * Applies a sort a heading asks for.
   * @param next The criteria with it
   */
  onCriteria(next: ChampionshipCriteria): void;
  /**
   * Whether the library is still being read, which fills the table with
   * skeleton rows.
   */
  loading?: boolean;
}

// The library as a table, a championship a row - easier to manage than a grid
// of cards once it runs past a hundred.
export const LibraryTable = ({
  listings, commands, criteria, onCriteria, loading = false,
}: LibraryTableProps) => {
  const { t } = useTranslation();

  return (
    // A container, so columns give way to the table's own width rather than the
    // window's: the classes first, then the format, then what it needs.
    <div className="@container overflow-x-auto rounded-xl border bg-card">
      <table className="w-full border-collapse text-sm">
        <thead className="border-b bg-muted/40">
          <tr>
            <th scope="col" aria-hidden />
            <SortHeading
              label={t('championshipLibrary.table.column.championship')}
              sort="name"
              criteria={criteria}
              onChange={onCriteria}
            />
            <SortHeading
              label={t('championshipLibrary.table.column.ladder')}
              sort="ladder"
              criteria={criteria}
              onChange={onCriteria}
            />
            <th scope="col" className={cn(TABLE_HEADING, 'hidden @[88rem]:table-cell')}>
              {t('championshipLibrary.table.column.classes')}
            </th>
            <th scope="col" className={TABLE_HEADING}>{t('championshipLibrary.table.column.season')}</th>
            <th scope="col" className={cn(TABLE_HEADING, 'hidden @[70rem]:table-cell')}>
              {t('championshipLibrary.table.column.format')}
            </th>
            <th scope="col" className={cn(TABLE_HEADING, 'text-right')}>
              {t('championshipLibrary.table.column.grid')}
            </th>
            <th scope="col" className={cn(TABLE_HEADING, 'hidden @[64rem]:table-cell')}>
              {t('championshipLibrary.table.column.needs')}
            </th>
            <th scope="col" aria-hidden />
            <th scope="col" aria-hidden />
          </tr>
        </thead>
        <tbody>
          {loading ? slots(LIBRARY_ROW_SKELETON).map((at) => <LibraryRowSkeleton key={at} />) : null}
          {listings.map((listing) => (
            <LibraryRow key={listing.series.id} listing={listing} commands={commands} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

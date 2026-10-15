import { useTranslation } from 'react-i18next';

import { TRACK_COLUMN } from './constants.ts';
import { TrackRow } from './TrackRow.tsx';
import { TrackRowSkeleton } from './TrackRowSkeleton.tsx';
import type { SortDirection, TrackGroup, TrackSortKey } from '../../../../shared/types';
import { SKELETON_COUNT, SortHeader } from '@/components';
import type { BrowserToggle } from '@/components';
import type { RacingIndex } from '@/lib/racing-index';
import { slots } from '@/lib/slots.ts';

interface TrackTableProps {
  /**
   * The circuits loaded so far, in order.
   */
  groups: readonly TrackGroup[];
  /**
   * Where every circuit races, or null until the library has loaded.
   */
  racing: RacingIndex | null;
  /**
   * What the list is sorted by.
   */
  sort: TrackSortKey;
  /**
   * Which way it runs.
   */
  direction: SortDirection;
  /**
   * Whether the first page is still being read, which fills the table with
   * placeholder rows under its real headings.
   */
  loading?: boolean;
  /**
   * Re-sorts the list.
   * @param sort The key
   * @param direction Which way
   */
  onSort(sort: TrackSortKey, direction: SortDirection): void;
  /**
   * Called with a circuit when the table is picked from rather than read.
   */
  onSelect?: (group: TrackGroup) => void;
  /**
   * The key of the layout already chosen, when there is one.
   */
  selectedKey?: string;
  /**
   * A switch on every row, for a browser deciding something about each circuit.
   */
  toggle?: BrowserToggle;
}

/**
 * The circuits as a table to compare across, sorted by its headings.
 */
export const TrackTable = ({
  groups, racing, sort, direction, loading = false, onSort, onSelect, selectedKey, toggle,
}: TrackTableProps) => {
  const { t } = useTranslation();
  const heading = { sort, direction, onSort };

  return (
    // A container, so the columns give way to the table's own width - which
    // with the rail beside it, the window's width says little about the table's.
    <div className="@container overflow-hidden rounded-xl border bg-card">
      <table className="w-full border-collapse text-sm">
        <thead className="border-b">
          <tr>
            {toggle === undefined ? null : <th scope="col" aria-hidden />}
            <th scope="col" aria-hidden />
            <SortHeader {...heading} label={t('tracks.column.circuit')} sortKey="name" />
            <SortHeader {...heading} label={t('tracks.column.country')} sortKey="country" className={TRACK_COLUMN.wide} />
            <SortHeader {...heading} label={t('tracks.column.layouts')} numeric className={TRACK_COLUMN.layouts} />
            <SortHeader {...heading} label={t('tracks.column.length')} sortKey="length" numeric />
            <SortHeader {...heading} label={t('tracks.column.pitboxes')} sortKey="pitboxes" numeric />
            <SortHeader {...heading} label={t('tracks.column.located')} className={TRACK_COLUMN.located} />
            <SortHeader {...heading} label={t('tracks.column.championships')} />
            <SortHeader {...heading} label={t('tracks.column.source')} className={TRACK_COLUMN.wide} />
          </tr>
        </thead>
        <tbody>
          {loading ? slots(SKELETON_COUNT).map((at) => (
            <TrackRowSkeleton key={at} toggle={toggle !== undefined} />
          )) : null}
          {groups.map((group) => (
            <TrackRow
              key={group.id}
              group={group}
              racing={racing?.tracks.get(group.id)}
              onSelect={onSelect}
              selectedKey={selectedKey}
              toggle={toggle}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

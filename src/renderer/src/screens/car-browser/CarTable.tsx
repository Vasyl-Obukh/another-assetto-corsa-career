import { useTranslation } from 'react-i18next';

import { CarRow } from './CarRow.tsx';
import { CarRowSkeleton } from './CarRowSkeleton.tsx';
import { CAR_COLUMN } from './constants.ts';
import type { Car, CarSortKey, SortDirection } from '../../../../shared/types';
import { SKELETON_COUNT, SortHeader } from '@/components';
import type { BrowserToggle } from '@/components';
import type { RacingIndex } from '@/lib/racing-index';
import { slots } from '@/lib/slots.ts';

interface CarTableProps {
  /**
   * The cars loaded so far, in order.
   */
  cars: readonly Car[];
  /**
   * Where every car races, or null until the library has loaded.
   */
  racing: RacingIndex | null;
  /**
   * What the list is sorted by.
   */
  sort: CarSortKey;
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
  onSort(sort: CarSortKey, direction: SortDirection): void;
  /**
   * Called with a car when the table is picked from rather than read.
   */
  onSelect?: (car: Car) => void;
  /**
   * Folder ID of the car already chosen, when there is one.
   */
  selectedId?: string;
  /**
   * A switch on every row, for a browser deciding something about each car.
   */
  toggle?: BrowserToggle;
}

/**
 * The cars as a table to compare figures across, sorted by its headings.
 */
export const CarTable = ({
  cars, racing, sort, direction, loading = false, onSort, onSelect, selectedId, toggle,
}: CarTableProps) => {
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
            <SortHeader {...heading} label={t('cars.column.car')} sortKey="name" />
            <SortHeader {...heading} label={t('cars.column.class')} className={CAR_COLUMN.wide} />
            <SortHeader {...heading} label={t('cars.column.year')} sortKey="year" numeric className={CAR_COLUMN.year} />
            <SortHeader {...heading} label={t('cars.column.power')} sortKey="bhp" numeric />
            <SortHeader {...heading} label={t('cars.column.weight')} sortKey="weight" numeric className={CAR_COLUMN.weight} />
            <SortHeader {...heading} label={t('cars.column.powerToWeight')} sortKey="powerToWeight" numeric />
            <SortHeader {...heading} label={t('cars.column.liveries')} numeric className={CAR_COLUMN.liveries} />
            <SortHeader {...heading} label={t('cars.column.championships')} />
            <SortHeader {...heading} label={t('cars.column.source')} className={CAR_COLUMN.wide} />
          </tr>
        </thead>
        <tbody>
          {loading ? slots(SKELETON_COUNT).map((at) => (
            <CarRowSkeleton key={at} toggle={toggle !== undefined} />
          )) : null}
          {cars.map((car) => (
            <CarRow
              key={car.id}
              car={car}
              racing={racing?.cars.get(car.id)}
              onSelect={onSelect}
              selected={car.id === selectedId}
              toggle={toggle}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

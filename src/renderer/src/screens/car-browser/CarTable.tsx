import { useTranslation } from 'react-i18next';

import { CarRow } from './CarRow.tsx';
import { CarRowSkeleton } from './CarRowSkeleton.tsx';
import { CAR_COLUMN } from './constants.ts';
import { GarageRow } from './GarageRow.tsx';
import type { Car, CarSortKey, SortDirection } from '../../../../shared/types';
import { SKELETON_COUNT, SortHeader } from '@/components';
import type { BrowserToggle, CarAppraise, CarTrade } from '@/components';
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
  /**
   * What the browser does with money, inside a career.
   */
  trade?: CarTrade;
  /**
   * What the browser does with prices, in Your content.
   */
  appraise?: CarAppraise;
}

/**
 * The cars as a table to compare figures across, sorted by its headings. The
 * Store adds what each costs, and the Garage is a table of its own: what each
 * car the career owns wears, races and is worth.
 */
export const CarTable = ({
  cars, racing, sort, direction, loading = false, onSort, onSelect, selectedId, toggle, trade, appraise,
}: CarTableProps) => {
  const { t } = useTranslation();
  const heading = { sort, direction, onSort };

  if (trade?.mode === 'garage') {
    return (
      <div className="@container overflow-hidden rounded-xl border bg-card">
        <table className="w-full border-collapse text-sm">
          <thead className="border-b">
            <tr>
              <th scope="col" aria-hidden />
              <SortHeader {...heading} label={t('cars.column.car')} sortKey="name" />
              <SortHeader {...heading} label={t('trade.livery')} />
              <SortHeader {...heading} label={t('trade.bought')} />
              <SortHeader {...heading} label={t('trade.racingIn')} />
              <SortHeader {...heading} label={t('trade.repaint')} numeric />
              <SortHeader {...heading} label={t('trade.sellsFor')} numeric />
              <th scope="col" aria-hidden />
            </tr>
          </thead>
          <tbody>
            {loading ? slots(SKELETON_COUNT).map((at) => <CarRowSkeleton key={at} toggle={false} trade="garage" />) : null}
            {cars.map((car) => <GarageRow key={car.id} car={car} trade={trade} />)}
          </tbody>
        </table>
      </div>
    );
  }

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
            {/* Priced, these give way to what the car costs. */}
            <SortHeader
              {...heading}
              label={t('cars.column.powerToWeight')}
              sortKey="powerToWeight"
              numeric
              className={trade ? 'hidden' : undefined}
            />
            <SortHeader
              {...heading}
              label={t('cars.column.liveries')}
              numeric
              className={trade ? 'hidden' : CAR_COLUMN.liveries}
            />
            <SortHeader {...heading} label={t('cars.column.championships')} />
            <SortHeader {...heading} label={t('cars.column.source')} className={trade ? 'hidden' : CAR_COLUMN.wide} />
            {trade ? (
              <>
                <SortHeader {...heading} label={t('trade.price')} sortKey="price" numeric />
                <SortHeader {...heading} label={t('trade.rentRound')} numeric />
              </>
            ) : null}
            {appraise ? (
              <>
                <SortHeader {...heading} label={t('trade.price')} sortKey="price" numeric />
                <th scope="col" aria-hidden />
              </>
            ) : null}
            {trade?.mode === 'store' ? <th scope="col" aria-hidden /> : null}
          </tr>
        </thead>
        <tbody>
          {loading ? slots(SKELETON_COUNT).map((at) => (
            <CarRowSkeleton
              key={at}
              toggle={toggle !== undefined}
              trade={trade?.mode}
              appraised={appraise !== undefined}
            />
          )) : null}
          {cars.map((car) => (
            <CarRow
              key={car.id}
              car={car}
              racing={racing?.cars.get(car.id)}
              onSelect={onSelect}
              selected={car.id === selectedId}
              toggle={toggle}
              trade={trade}
              appraise={appraise}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

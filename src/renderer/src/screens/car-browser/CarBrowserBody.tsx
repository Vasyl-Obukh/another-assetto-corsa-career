import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { CarCard } from './CarCard.tsx';
import { CarCardSkeleton } from './CarCardSkeleton.tsx';
import { CarRail } from './CarRail.tsx';
import { CarTable } from './CarTable.tsx';
import { CAR_SORTS } from './constants.ts';
import { carPills } from './pills.ts';
import type { Car, CarQuery } from '../../../../shared/types';
import { useClasses, useSettings } from '@/app';
import {
  ActiveFilters, BrowserGrid, BrowserLayout, SearchField, SortMenu, TOOLBAR_SEARCH, ViewToggle,
} from '@/components';
import type { BrowserToggle } from '@/components';
import { useCarBrowser, useInfiniteScroll, useRacingIndex } from '@/hooks';
import { useFormat } from '@/i18n';
import { isListed } from '@/screens/championships';

interface CarBrowserBodyProps {
  /**
   * Called with a car when the browser is being picked from rather than read.
   *
   * This is the whole difference between the Cars page and a car picker: the
   * search, the facets, the paging and the cards are the same either way.
   */
  onSelect?: (car: Car) => void;
  /**
   * Folder ID of the car already chosen, when there is one.
   */
  selectedId?: string;
  /**
   * A query every request is narrowed by, before the user filters anything.
   *
   * What a restricted picker is: the search, the facets and the paging all work
   * as they do on the Cars page, over a smaller library.
   */
  baseQuery?: CarQuery;
  /**
   * Which browser this is, for one that comes back to the filters it was left
   * with. Omitted, it opens unfiltered every time - which is what a picker
   * wants, since its library is already restricted to one question.
   */
  memoryId?: string;
  /**
   * A switch on every card, for a browser deciding something about each car
   * rather than opening or picking one.
   */
  toggle?: BrowserToggle;
  /**
   * Whether it is the Cars page itself, which heads itself with its title.
   */
  heading?: boolean;
}

export const CarBrowserBody = ({
  onSelect, selectedId, baseQuery, memoryId, toggle, heading = false,
}: CarBrowserBodyProps) => {
  const { t } = useTranslation();
  const format = useFormat();
  const { catalogue } = useClasses();
  const { settings } = useSettings();

  // What a career can race, which is what the Championships page lists.
  const racing = useRacingIndex((listing) => isListed(listing, settings));
  const raced = useMemo(() => (racing === null ? undefined : [...racing.cars.keys()]), [racing]);

  const browser = useCarBrowser(baseQuery, memoryId, raced);
  const { list, criteria } = browser;
  const view = criteria.view ?? 'cards';
  const sort = criteria.sort ?? 'name';
  const direction = criteria.direction ?? 'asc';

  const { scrollRef, sentinelRef } = useInfiniteScroll(
    list.loadMore,
    !list.loading && !list.exhausted,
  );

  return (
    <BrowserLayout
      heading={heading ? (
        <header className="flex flex-col gap-1 pt-8">
          <h1 className="text-2xl font-semibold">{t('cars.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('cars.subtitle')}</p>
        </header>
      ) : undefined}
      rail={(
        <CarRail
          criteria={criteria}
          facets={browser.facets}
          filtered={browser.filtered}
          onChange={browser.setCriteria}
          onClear={browser.clear}
        />
      )}
      toolbar={(
        <>
          <div className="flex items-center gap-2">
            <SearchField
              value={browser.search}
              placeholder={t('cars.searchPlaceholder')}
              inputClassName={TOOLBAR_SEARCH}
              onChange={browser.setSearch}
            />
            <SortMenu
              items={CAR_SORTS}
              value={sort}
              direction={direction}
              onChange={(next) => browser.setCriteria({ ...criteria, sort: next })}
              onDirectionChange={(next) => browser.setCriteria({ ...criteria, direction: next })}
            />
            <ViewToggle value={view} onChange={(next) => browser.setCriteria({ ...criteria, view: next })} />
          </div>
          <ActiveFilters
            filters={carPills(criteria, browser.facets, catalogue, t, format, browser.setCriteria)}
            shown={list.items.length}
            total={list.total}
            stale={browser.stale}
            loading={list.loading}
            onClear={browser.clear}
            onRefresh={browser.refresh}
          />
        </>
      )}
      scrollRef={scrollRef}
      backToTop={heading}
    >
      <BrowserGrid
        list={list}
        view={view}
        cardSkeleton={<CarCardSkeleton />}
        filtered={browser.filtered}
        sentinelRef={sentinelRef}
        onClear={browser.clear}
      >
        {view === 'cards' ? list.items.map((car) => (
          <CarCard
            key={car.id}
            car={car}
            racing={racing?.cars.get(car.id)}
            onSelect={onSelect}
            selected={car.id === selectedId}
            toggle={toggle}
          />
      )) : (
        <CarTable
          cars={list.items}
          racing={racing}
          sort={sort}
          direction={direction}
          loading={list.loading}
          onSort={(next, way) => browser.setCriteria({ ...criteria, sort: next, direction: way })}
          onSelect={onSelect}
          selectedId={selectedId}
          toggle={toggle}
        />
      )}
      </BrowserGrid>
    </BrowserLayout>
  );
};

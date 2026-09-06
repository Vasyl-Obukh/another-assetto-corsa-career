import { useTranslation } from 'react-i18next';

import { CarCard } from './CarCard.tsx';
import { CarFilters } from './CarFilters.tsx';
import { CAR_SORTS } from './constants.ts';
import type { Car, CarQuery } from '../../../../shared/types';
import { BrowserGrid, BrowserToolbar, ScreenBody, SortSelect } from '@/components';
import { useCarBrowser, useInfiniteScroll } from '@/hooks';

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
}

export const CarBrowserBody = ({
  onSelect, selectedId, baseQuery, memoryId,
}: CarBrowserBodyProps) => {
  const { t } = useTranslation();
  const browser = useCarBrowser(baseQuery, memoryId);
  const { list, criteria } = browser;

  const { scrollRef, sentinelRef } = useInfiniteScroll(
    list.loadMore,
    !list.loading && !list.exhausted,
  );

  return (
    <ScreenBody scrollRef={scrollRef}>
      <BrowserToolbar
        search={browser.search}
        placeholder={t('cars.searchPlaceholder')}
        shown={list.items.length}
        total={list.total}
        filtered={browser.filtered}
        stale={browser.stale}
        onSearchChange={browser.setSearch}
        onClear={browser.clear}
        onRefresh={browser.refresh}
      >
        <SortSelect
          items={CAR_SORTS}
          value={criteria.sort ?? 'name'}
          direction={criteria.direction ?? 'asc'}
          onChange={(sort) => browser.setCriteria({ ...criteria, sort })}
          onDirectionChange={(direction) => browser.setCriteria({ ...criteria, direction })}
        />
        <CarFilters
          criteria={criteria}
          facets={browser.facets}
          onChange={browser.setCriteria}
        />
      </BrowserToolbar>

      <BrowserGrid
        list={list}
        filtered={browser.filtered}
        sentinelRef={sentinelRef}
        onClear={browser.clear}
      >
        {list.items.map((car) => (
          <CarCard
            key={car.id}
            car={car}
            onSelect={onSelect}
            selected={car.id === selectedId}
          />
        ))}
      </BrowserGrid>
    </ScreenBody>
  );
};

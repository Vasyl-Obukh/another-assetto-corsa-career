import { useTranslation } from 'react-i18next';

import { CarCard } from './CarCard.tsx';
import { CarFilters } from './CarFilters.tsx';
import { CAR_SORTS } from './constants.ts';
import { BrowserGrid, BrowserToolbar, SortSelect } from '@/components';
import { useCarBrowser, useInfiniteScroll } from '@/hooks';

export const CarBrowser = () => {
  const { t } = useTranslation();
  const browser = useCarBrowser();
  const { list, criteria } = browser;

  const { scrollRef, sentinelRef } = useInfiniteScroll(
    list.loadMore,
    !list.loading && !list.exhausted,
  );

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl px-8">
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
          {list.items.map((car) => <CarCard key={car.id} car={car} />)}
        </BrowserGrid>
      </div>
    </div>
  );
};

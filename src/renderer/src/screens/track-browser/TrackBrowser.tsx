import { useTranslation } from 'react-i18next';

import { TRACK_SORTS } from './constants.ts';
import { TrackCard } from './TrackCard.tsx';
import { TrackFilters } from './TrackFilters.tsx';
import { BrowserGrid, BrowserToolbar, SortSelect } from '@/components';
import { useInfiniteScroll, useTrackBrowser } from '@/hooks';

export const TrackBrowser = () => {
  const { t } = useTranslation();
  const browser = useTrackBrowser();
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
          placeholder={t('tracks.searchPlaceholder')}
          shown={list.items.length}
          total={list.total}
          filtered={browser.filtered}
          stale={browser.stale}
          onSearchChange={browser.setSearch}
          onClear={browser.clear}
          onRefresh={browser.refresh}
        >
          <SortSelect
            items={TRACK_SORTS}
            value={criteria.sort ?? 'name'}
            direction={criteria.direction ?? 'asc'}
            onChange={(sort) => browser.setCriteria({ ...criteria, sort })}
            onDirectionChange={(direction) => browser.setCriteria({ ...criteria, direction })}
          />
          <TrackFilters
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
          {list.items.map((group) => <TrackCard key={group.id} group={group} />)}
        </BrowserGrid>
      </div>
    </div>
  );
};

import { useTranslation } from 'react-i18next';

import { TRACK_SORTS } from './constants.ts';
import { TrackCard } from './TrackCard.tsx';
import { TrackFilters } from './TrackFilters.tsx';
import type { TrackGroup } from '../../../../shared/types';
import { BrowserGrid, BrowserToolbar, ScreenBody, SortSelect } from '@/components';
import { useInfiniteScroll, useTrackBrowser } from '@/hooks';

interface TrackBrowserBodyProps {
  /**
   * Called with a circuit when the browser is being picked from rather than
   * read. Which of its layouts is a second question, asked elsewhere.
   */
  onSelect?: (group: TrackGroup) => void;
  /**
   * Key of the layout already chosen, when there is one.
   */
  selectedKey?: string;
}

export const TrackBrowserBody = ({ onSelect, selectedKey }: TrackBrowserBodyProps) => {
  const { t } = useTranslation();
  const browser = useTrackBrowser();
  const { list, criteria } = browser;

  const { scrollRef, sentinelRef } = useInfiniteScroll(
    list.loadMore,
    !list.loading && !list.exhausted,
  );

  return (
    <ScreenBody scrollRef={scrollRef}>
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
        {list.items.map((group) => (
          <TrackCard
            key={group.id}
            group={group}
            onSelect={onSelect}
            selectedKey={selectedKey}
          />
        ))}
      </BrowserGrid>
    </ScreenBody>
  );
};

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { TRACK_SORTS } from './constants.ts';
import { trackPills } from './pills.ts';
import { TrackCard } from './TrackCard.tsx';
import { TrackCardSkeleton } from './TrackCardSkeleton.tsx';
import { TrackRail } from './TrackRail.tsx';
import { TrackTable } from './TrackTable.tsx';
import type { TrackGroup, TrackQuery } from '../../../../shared/types';
import { useSettings } from '@/app';
import {
  ActiveFilters, BrowserGrid, BrowserLayout, SearchField, SortMenu, TOOLBAR_SEARCH, ViewToggle,
} from '@/components';
import type { BrowserToggle } from '@/components';
import { useInfiniteScroll, useRacingIndex, useTrackBrowser, useUnits } from '@/hooks';
import { useFormat } from '@/i18n';
import { isListed } from '@/screens/championships';

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
  /**
   * A query every request is narrowed by, before the user filters anything.
   */
  baseQuery?: TrackQuery;
  /**
   * Which browser this is, for one that comes back to the filters it was left
   * with. Omitted, it opens unfiltered every time - which is what a picker
   * wants, since its library is already restricted to one question.
   */
  memoryId?: string;
  /**
   * A switch on every card, for a browser deciding something about each
   * circuit rather than opening or picking one.
   */
  toggle?: BrowserToggle;
  /**
   * Whether it is the Tracks page itself, which heads itself with its title.
   */
  heading?: boolean;
}

export const TrackBrowserBody = ({
  onSelect, selectedKey, baseQuery, memoryId, toggle, heading = false,
}: TrackBrowserBodyProps) => {
  const { t } = useTranslation();
  const format = useFormat();
  const units = useUnits();
  const { settings } = useSettings();

  // What a career can race, which is what the Championships page lists.
  const racing = useRacingIndex((listing) => isListed(listing, settings));
  const raced = useMemo(() => (racing === null ? undefined : [...racing.tracks.keys()]), [racing]);

  const browser = useTrackBrowser(baseQuery, memoryId, raced);
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
          <h1 className="text-2xl font-semibold">{t('tracks.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('tracks.subtitle')}</p>
        </header>
      ) : undefined}
      rail={(
        <TrackRail
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
              placeholder={t('tracks.searchPlaceholder')}
              inputClassName={TOOLBAR_SEARCH}
              onChange={browser.setSearch}
            />
            <SortMenu
              items={TRACK_SORTS}
              value={sort}
              direction={direction}
              onChange={(next) => browser.setCriteria({ ...criteria, sort: next })}
              onDirectionChange={(next) => browser.setCriteria({ ...criteria, direction: next })}
            />
            <ViewToggle value={view} onChange={(next) => browser.setCriteria({ ...criteria, view: next })} />
          </div>
          <ActiveFilters
            filters={trackPills(criteria, browser.facets, t, format, units, browser.setCriteria)}
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
        cardSkeleton={<TrackCardSkeleton />}
        filtered={browser.filtered}
        sentinelRef={sentinelRef}
        onClear={browser.clear}
      >
        {view === 'cards' ? list.items.map((group) => (
          <TrackCard
            key={group.id}
            group={group}
            racing={racing?.tracks.get(group.id)}
            onSelect={onSelect}
            selectedKey={selectedKey}
            toggle={toggle}
          />
      )) : (
        <TrackTable
          groups={list.items}
          racing={racing}
          sort={sort}
          direction={direction}
          loading={list.loading}
          onSort={(next, way) => browser.setCriteria({ ...criteria, sort: next, direction: way })}
          onSelect={onSelect}
          selectedKey={selectedKey}
          toggle={toggle}
        />
      )}
      </BrowserGrid>
    </BrowserLayout>
  );
};

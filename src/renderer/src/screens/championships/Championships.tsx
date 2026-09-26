import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ChampionshipRail } from './ChampionshipRail.tsx';
import { CHAMPIONSHIP_MEMORY, CHAMPIONSHIP_SORTS } from './constants.ts';
import { championshipFilters } from './filters.ts';
import { LadderBoard } from './LadderBoard.tsx';
import { LadderSkeleton } from './LadderSkeleton.tsx';
import { NoneMatch } from './NoneMatch.tsx';
import { championshipPills } from './pills.ts';
import { isListed, ladderDepth } from './utils.ts';
import { useSettings } from '@/app';
import {
  ActiveFilters, BrowserLayout, ErrorCard, SearchField, SortMenu, TOOLBAR_SEARCH,
} from '@/components';
import { useChampionshipBrowser, useChampionships } from '@/hooks';

export const Championships = () => {
  const { t } = useTranslation();
  const championships = useChampionships();
  const { settings } = useSettings();

  // What a career can race today. Everything else - and everything that manages
  // the library - lives on the settings tab.
  const listed = useMemo(
    () => championships.listings.filter((listing) => isListed(listing, settings)),
    [championships.listings, settings],
  );
  const depth = useMemo(() => ladderDepth(listed), [listed]);
  const filters = useMemo(() => championshipFilters(), []);
  const browser = useChampionshipBrowser(
    listed,
    filters,
    CHAMPIONSHIP_MEMORY.championships,
    !championships.loading,
  );
  const { criteria } = browser;

  return (
    // The whole window rather than the shared column: the ladder is a board,
    // a column per tier, and only gains from the room.
    <BrowserLayout
      wide
      heading={(
        <header className="flex flex-col gap-1 pt-8">
          <h1 className="text-2xl font-semibold">{t('championships.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('championships.subtitle')}</p>
        </header>
      )}
      rail={<ChampionshipRail browser={browser} filters={filters} loading={championships.loading} />}
      toolbar={(
        <>
          <div className="flex items-center gap-2">
            <SearchField
              value={browser.search}
              placeholder={t('championships.filter.search')}
              inputClassName={TOOLBAR_SEARCH}
              onChange={browser.setSearch}
            />
            <SortMenu
              items={CHAMPIONSHIP_SORTS}
              value={criteria.sort}
              direction={criteria.direction}
              onChange={(sort) => browser.setCriteria({ ...criteria, sort })}
              onDirectionChange={(direction) => browser.setCriteria({ ...criteria, direction })}
            />
          </div>

          <ActiveFilters
            filters={championshipPills(browser, filters, t)}
            shown={browser.shown.length}
            total={browser.total}
            stale={false}
            loading={championships.loading}
            onClear={browser.clear}
            onRefresh={() => undefined}
          />
        </>
      )}
      scrollRef={browser.scrollRef}
      backToTop
    >
      <div className="flex flex-col gap-4 pb-6">
        {championships.error ? (
          <ErrorCard error={championships.error} onDismiss={championships.dismissError} />
        ) : null}

        {championships.loading ? <LadderSkeleton /> : null}

        {!championships.loading && listed.length === 0 && !championships.error ? (
          <p className="text-sm text-muted-foreground">{t('championships.empty')}</p>
        ) : null}

        {listed.length > 0 && browser.shown.length === 0 ? <NoneMatch onClear={browser.clear} /> : null}

        {browser.shown.length > 0 ? <LadderBoard listings={browser.shown} depth={depth} /> : null}
      </div>
    </BrowserLayout>
  );
};

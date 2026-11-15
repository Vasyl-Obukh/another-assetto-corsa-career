import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ChampionshipRail } from './ChampionshipRail.tsx';
import { CHAMPIONSHIP_MEMORY, CHAMPIONSHIP_SORTS, RAIL_KEY } from './constants.ts';
import { affordableFilter, championshipFilters, openFilter } from './filters.ts';
import { LadderBoard } from './LadderBoard.tsx';
import { LadderSkeleton } from './LadderSkeleton.tsx';
import { NoneMatch } from './NoneMatch.tsx';
import { championshipPills } from './pills.ts';
import type { CareerLadder } from './types.ts';
import { isListed, ladderDepth } from './utils.ts';
import { isEligible, openLevels } from '../../../../shared/utils/career-eligibility';
import { useSettings, useSlot } from '@/app';
import {
  ActiveFilters, BrowserLayout, ErrorCard, SearchField, SortMenu, TOOLBAR_SEARCH,
} from '@/components';
import { useChampionshipBrowser, useChampionships, useRoundCosts } from '@/hooks';

export const Championships = () => {
  const { t } = useTranslation();
  const championships = useChampionships();
  const { settings } = useSettings();
  const { mode, career } = useSlot();
  // A career's own ladder: a standalone championship has none to climb.
  const levels = useMemo(
    () => (mode === 'career' && career ? openLevels(career.level) : null),
    [mode, career],
  );

  // What a career can race today. Everything else - and everything that manages
  // the library - lives on the settings tab.
  const listed = useMemo(
    () => championships.listings.filter((listing) => isListed(listing, settings)),
    [championships.listings, settings],
  );
  const depth = useMemo(() => ladderDepth(listed), [listed]);
  // What a round costs is a career's alone, so only a career can filter on it.
  const costs = useRoundCosts(championships.listings);
  const filters = useMemo(() => [
    ...championshipFilters(),
    ...(levels ? [openFilter(levels)] : []),
    ...(costs ? [affordableFilter(costs)] : []),
  ], [costs, levels]);
  const browser = useChampionshipBrowser(
    listed,
    filters,
    CHAMPIONSHIP_MEMORY.championships,
    !championships.loading,
  );
  const { criteria } = browser;
  // A championship passes when a round of any class is affordable, and the
  // board then stands only the classes that are.
  const affordableOnly = costs !== null && (criteria.picked[RAIL_KEY.affordable] ?? []).includes('yes');
  const ladder: CareerLadder | undefined = levels && career ? {
    career,
    open: levels,
    openOnly: (criteria.picked[RAIL_KEY.open] ?? []).includes('yes'),
  } : undefined;

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

        {browser.shown.length > 0 ? (
          <LadderBoard
            listings={browser.shown}
            depth={depth}
            keepRung={affordableOnly || ladder?.openOnly
              ? (listing, entry) => (!affordableOnly || costs.affordable(listing.series.id, entry.id))
                && (!ladder?.openOnly || isEligible(entry.ladder, ladder.open))
              : undefined}
            ladder={ladder}
          />
        ) : null}
      </div>
    </BrowserLayout>
  );
};

import { PlusIcon, UploadIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { LIBRARY_VIEW_MEMORY } from './constants.ts';
import { LibraryTable } from './LibraryTable.tsx';
import type { SeriesImportResult } from '../../../../shared/types';
import { hiddenBySources } from '../../../../shared/utils/content-sources';
import { useSettings } from '@/app';
import {
  ActiveFilters, BrowserLayout, ErrorCard, Loading, ProblemList, SearchField, SortMenu, TOOLBAR_SEARCH,
  ViewToggle,
} from '@/components';
import { Button } from '@/components/ui/button.tsx';
import {
  useChampionshipBrowser, useChampionships, usePreference, useSeriesCommands,
} from '@/hooks';
import { readBrowserView } from '@/lib/browser-memory';
import { path } from '@/lib/routes';
import { slots } from '@/lib/slots.ts';
import {
  CHAMPIONSHIP_MEMORY, CHAMPIONSHIP_SORTS, championshipFilters, championshipPills, ChampionshipRail, NoneMatch,
  SEASON_GRID, SEASON_SKELETON, SeasonCard, SeasonCardSkeleton,
} from '@/screens/championships';

/**
 * The cards' grid.
 */

export const ChampionshipLibrary = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const championships = useChampionships();
  const commands = useSeriesCommands();
  const { settings } = useSettings();
  const [refused, setRefused] = useState<SeriesImportResult | null>(null);
  const [view, setView] = usePreference(LIBRARY_VIEW_MEMORY, readBrowserView);

  // One card rather than two: the two hooks fail for the same kinds of reason,
  // and stacking a second banner under the first says nothing extra.
  const error = championships.error ?? commands.error;
  // A championship of ours the content sources leave out is not listed at all,
  // since those switches are how it is turned back on. The user's own are never
  // switched off that way, so they are always here.
  const offered = useMemo(
    () => championships.listings.filter(
      (listing) => !hiddenBySources(listing, settings.offeredContentSources),
    ),
    [championships.listings, settings.offeredContentSources],
  );
  // Rebuilt with the switches, since whether one is on is one of the filters.
  const filters = useMemo(
    () => championshipFilters({ seriesActive: settings.seriesActive }),
    [settings.seriesActive],
  );
  const browser = useChampionshipBrowser(
    offered,
    filters,
    CHAMPIONSHIP_MEMORY.library,
    !championships.loading,
  );
  const { criteria } = browser;

  return (
    <BrowserLayout
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

            <span aria-hidden className="mx-1 h-6 w-px bg-border" />

            {/* Nothing is written until the editor's first Save, so this is a
                navigation rather than a command. */}
            <Button onClick={() => navigate(path.championshipNew())}>
              <PlusIcon />
              {t('common.new')}
            </Button>

            <Button
              variant="outline"
              disabled={commands.busy}
              onClick={() => {
                commands.importSeries().then((result) => {
                  if (!result) return;
                  // A file that held no championship is reported here rather than
                  // written: it must not become a permanent entry in the library's
                  // own problems that the user then has to delete by hand.
                  if (result.id === null) { setRefused(result); return; }

                  setRefused(null);
                }, () => undefined);
              }}
            >
              <UploadIcon />
              {t('championships.actions.import')}
            </Button>

            <ViewToggle value={view} onChange={setView} />
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
        {error ? (
          <ErrorCard
            error={error}
            onDismiss={() => { championships.dismissError(); commands.dismissError(); }}
          />
        ) : null}

        {refused ? (
          <ProblemList
            problems={refused.problems}
            label={t('championships.import.failed', { count: refused.problems.length })}
            hint={t('championships.import.failedHint')}
          />
        ) : null}

        {/* A file the user wrote that would not load is not the same as the read
            failing - the rest of the library is fine - so it is said here rather
            than replacing the list with an error. */}
        <ProblemList
          problems={championships.problems}
          label={t('championships.problems.label', { count: championships.problems.length })}
          hint={t('championships.problems.hint')}
        />

        {championships.loading && view === 'cards' ? (
          <Loading className={SEASON_GRID}>
            {slots(SEASON_SKELETON).map((at) => <SeasonCardSkeleton key={at} />)}
          </Loading>
        ) : null}
        {championships.loading && view === 'list' ? (
          <Loading>
            <LibraryTable
              listings={[]}
              commands={commands}
              criteria={criteria}
              onCriteria={browser.setCriteria}
              loading
            />
          </Loading>
        ) : null}

        {offered.length > 0 && browser.shown.length === 0 ? <NoneMatch onClear={browser.clear} /> : null}

        {browser.shown.length > 0 && view === 'cards' ? (
          <div className={SEASON_GRID}>
            {browser.shown.map((listing) => (
              <SeasonCard key={listing.series.id} listing={listing} commands={commands} />
            ))}
          </div>
        ) : null}
        {browser.shown.length > 0 && view === 'list' ? (
          <LibraryTable
            listings={browser.shown}
            commands={commands}
            criteria={criteria}
            onCriteria={browser.setCriteria}
          />
        ) : null}
      </div>
    </BrowserLayout>
  );
};

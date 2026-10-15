import { PlusIcon, UploadIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { HISTORIC_MEMORY, HISTORIC_SKELETON, HISTORIC_VIEW_MEMORY } from './constants.ts';
import { HistoricCard } from './HistoricCard.tsx';
import { HistoricCardSkeleton } from './HistoricCardSkeleton.tsx';
import { HistoricTable } from './HistoricTable.tsx';
import { historicSwitches, offeredHere } from './utils.ts';
import type { SeriesImportResult } from '../../../../shared/types';
import { useSettings } from '@/app';
import {
  ActiveFilters, BrowserLayout, ErrorCard, Loading, ProblemList, SearchField, SortMenu, TOOLBAR_SEARCH,
  ViewToggle,
} from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { useChampionshipBrowser, useChampionships, useSeriesCommands } from '@/hooks';
import { WordingKind } from '@/i18n';
import { readBrowserView } from '@/lib/browser-memory';
import type { BrowserView } from '@/lib/browser-memory';
import { newPath } from '@/lib/series-kind';
import { slots } from '@/lib/slots.ts';
import { readPreference, writePreference } from '@/lib/stored-preference';
import {
  CHAMPIONSHIP_SORTS, championshipFilters, championshipPills, ChampionshipRail, NoneMatch,
} from '@/screens/championships';

/**
 * The cards' grid, the championship library's own.
 */
const GRID = 'grid grid-cols-[repeat(auto-fill,minmax(19rem,1fr))] gap-4';

export const HistoricLibrary = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const events = useChampionships('historic');
  const commands = useSeriesCommands('historic');
  const { settings } = useSettings();
  const [refused, setRefused] = useState<SeriesImportResult | null>(null);
  const [view, setView] = useState<BrowserView>(() => readBrowserView(readPreference(HISTORIC_VIEW_MEMORY)));

  const error = events.error ?? commands.error;
  // Ours only where this install has what each needs; the user's own always.
  const offered = useMemo(
    () => events.listings.filter((listing) => offeredHere(listing, settings.hiddenContentSources)),
    [events.listings, settings.hiddenContentSources],
  );
  // The championship list's own filters over the historic events' switches,
  // which are kept the same way.
  const filters = useMemo(
    () => championshipFilters(historicSwitches(settings)),
    [settings],
  );
  const browser = useChampionshipBrowser(offered, filters, HISTORIC_MEMORY, !events.loading);
  const { criteria } = browser;

  /**
   * Shows the pool as cards or a table, and keeps that for next time.
   * @param next Which
   */
  const changeView = (next: BrowserView): void => {
    setView(next);
    writePreference(HISTORIC_VIEW_MEMORY, next);
  };

  return (
    <WordingKind.Provider value="historic">
      <BrowserLayout
        rail={<ChampionshipRail browser={browser} filters={filters} loading={events.loading} />}
        toolbar={(
          <>
            <div className="flex items-center gap-2">
              <SearchField
                value={browser.search}
                placeholder={t('historicLibrary.search')}
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

              {/* Nothing is written until the editor's first Save. */}
              <Button variant="outline" onClick={() => navigate(newPath('historic'))}>
                <PlusIcon />
                {t('common.new')}
              </Button>

              <Button
                variant="outline"
                disabled={commands.busy}
                onClick={() => {
                  commands.importSeries().then((result) => {
                    if (!result) return;
                    if (result.id === null) { setRefused(result); return; }

                    setRefused(null);
                  }, () => undefined);
                }}
              >
                <UploadIcon />
                {t('championships.actions.import')}
              </Button>

              <ViewToggle value={view} onChange={changeView} />
            </div>

            <ActiveFilters
              filters={championshipPills(browser, filters, t)}
              shown={browser.shown.length}
              total={browser.total}
              stale={false}
              loading={events.loading}
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
              onDismiss={() => { events.dismissError(); commands.dismissError(); }}
            />
          ) : null}

          {refused ? (
            <ProblemList
              problems={refused.problems}
              label={t('championships.import.failed', { count: refused.problems.length })}
              hint={t('championships.import.failedHint')}
            />
          ) : null}

          <ProblemList
            problems={events.problems}
            label={t('historicLibrary.problems', { count: events.problems.length })}
            hint={t('championships.problems.hint')}
          />

          {events.loading && view === 'cards' ? (
            <Loading className={GRID}>
              {slots(HISTORIC_SKELETON).map((at) => <HistoricCardSkeleton key={at} />)}
            </Loading>
          ) : null}
          {events.loading && view === 'list' ? (
            <Loading>
              <HistoricTable listings={[]} commands={commands} loading />
            </Loading>
          ) : null}

          {offered.length > 0 && browser.shown.length === 0 ? <NoneMatch onClear={browser.clear} /> : null}

          {browser.shown.length > 0 && view === 'cards' ? (
            <div className={GRID}>
              {browser.shown.map((listing) => (
                <HistoricCard key={listing.series.id} listing={listing} commands={commands} />
              ))}
            </div>
          ) : null}
          {browser.shown.length > 0 && view === 'list' ? (
            <HistoricTable listings={browser.shown} commands={commands} />
          ) : null}
        </div>
      </BrowserLayout>
    </WordingKind.Provider>
  );
};

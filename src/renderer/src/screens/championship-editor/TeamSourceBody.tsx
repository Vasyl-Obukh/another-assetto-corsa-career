import { ChevronLeftIcon } from 'lucide-react';
import { useContext, useMemo, useState } from 'react';

import { SOURCE_SKELETONS, TEAM_SOURCE_GRID } from './constants.ts';
import { TeamSourceClass } from './TeamSourceClass.tsx';
import { TeamSourceTile } from './TeamSourceTile.tsx';
import { TeamSourceTileSkeleton } from './TeamSourceTileSkeleton.tsx';
import type { TeamSource } from './types.ts';
import { teamNameKey } from './utils.ts';
import type { Championship, SeriesListing, Team } from '../../../../shared/types';
import { matchesTerms, searchTerms } from '../../../../shared/utils/search';
import {
  BrowserLayout, ErrorCard, Loading, SearchField, TOOLBAR_SEARCH,
} from '@/components';
import { Button } from '@/components/ui/button.tsx';
import {
  championshipFacets, filterChampionships, isChampionshipFiltered, useChampionships,
} from '@/hooks';
import type { ChampionshipBrowser, ChampionshipCriteria } from '@/hooks';
import { useKindTranslation, WordingKind } from '@/i18n';
import type { SeriesKind } from '@/lib/series-kind';
import { slots } from '@/lib/slots.ts';
import {
  championshipFilters, ChampionshipRail, NoneMatch, RAIL_KEY, teamGroups,
} from '@/screens/championships';
import type { ChampionshipFilter } from '@/screens/championships';

interface TeamSourceBodyProps {
  /**
   * The championship being edited.
   */
  series: Championship;
  /**
   * Called with the class picked.
   * @param source The class and where it is from
   */
  onPick: (source: TeamSource) => void;
}

/**
 * The filters a picker starts from: nothing picked, in ladder order.
 */
const NO_CRITERIA: ChampionshipCriteria = { picked: {}, sort: 'ladder', direction: 'asc' };

/**
 * Remembers nothing: a picker's filters start fresh, and its scroll with them.
 */
const forgetScroll = (): void => {};

/**
 * Every team a championship's seats name, each once, class by class.
 * @param series The championship
 * @returns The teams
 */
const fieldedTeams = (series: Championship): Team[] => [
  ...new Map(series.entries
    .flatMap((entry) => teamGroups(entry.seats, series.teams ?? []))
    .flatMap(({ team }) => (team ? [[team.id, team] as const] : []))).values(),
];

/**
 * The team picker's filter column, search and tiles - the Championships
 * page's own, over both libraries - and over them the classes of the
 * championship opened. Mounted only while the dialog is open, so the
 * libraries are read when it opens and not before.
 */
export const TeamSourceBody = ({ series, onPick }: TeamSourceBodyProps) => {
  const { t } = useKindTranslation();
  const kind = useContext(WordingKind);
  const championships = useChampionships('series');
  const historic = useChampionships('historic');
  const [search, setSearch] = useState('');
  const [criteria, setCriteria] = useState(NO_CRITERIA);
  const [opened, setOpened] = useState<SeriesListing | null>(null);
  const loading = championships.loading || historic.loading;
  const ownNames = useMemo(() => new Set((series.teams ?? []).map((team) => teamNameKey(team.name))), [series.teams]);

  // Every championship and event that fields a team, each with its library and
  // its teams. Not the one being edited: the select offers its classes.
  const {
    listings, kindOf, teamsOf, teamNamesOf,
  } = useMemo(() => {
    const kinds = new Map<SeriesListing, SeriesKind>();
    const teams = new Map<SeriesListing, readonly Team[]>();

    /**
     * Lists a championship, unless it is the one being edited or fields no team.
     * @param from The library it is in
     * @param listing The championship
     */
    const add = (from: SeriesKind, listing: SeriesListing): void => {
      if (from === kind && listing.series.id === series.id) return;
      const fielded = fieldedTeams(listing.series);
      if (fielded.length === 0) return;
      kinds.set(listing, from);
      teams.set(listing, fielded);
    };
    championships.listings.forEach((listing) => add('series', listing));
    historic.listings.forEach((listing) => add('historic', listing));

    return {
      listings: [...kinds.keys()],
      kindOf: (listing: SeriesListing): SeriesKind => kinds.get(listing) ?? 'series',
      teamsOf: (listing: SeriesListing): readonly Team[] => teams.get(listing) ?? [],
      teamNamesOf: (listing: SeriesListing): string[] => (teams.get(listing) ?? []).map((team) => team.name),
    };
  }, [championships.listings, historic.listings, kind, series.id]);

  const filters = useMemo((): ChampionshipFilter[] => [
    {
      key: RAIL_KEY.library,
      label: 'championships.filter.library',
      values: (listing) => [kindOf(listing)],
      format: (value, tr) => (value === 'historic'
        ? tr('championships.filter.libraryHistoric')
        : tr('championships.filter.libraryChampionships')),
    },
    ...championshipFilters(),
  ], [kindOf]);

  const shown = useMemo(
    () => filterChampionships(listings, filters, criteria, search, teamNamesOf),
    [listings, filters, criteria, search, teamNamesOf],
  );
  const facets = useMemo(
    () => championshipFacets(listings, filters, criteria, search, teamNamesOf),
    [listings, filters, criteria, search, teamNamesOf],
  );
  const terms = searchTerms(search);
  const error = championships.error ?? historic.error;

  const browser: ChampionshipBrowser = {
    search,
    criteria,
    facets,
    shown,
    total: listings.length,
    filtered: isChampionshipFiltered(criteria, search),
    setSearch,
    setCriteria,
    clear: () => { setSearch(''); setCriteria(NO_CRITERIA); },
    scrollRef: forgetScroll,
  };

  /**
   * Picks one class of a championship.
   * @param listing The championship
   * @param entry The class's id
   */
  const pick = (listing: SeriesListing, entry: string): void => {
    onPick({ series: listing.series, entry, own: false });
  };

  /**
   * Opens a championship: one class is picked at once, several are laid out.
   * @param listing The championship
   */
  const choose = (listing: SeriesListing): void => {
    const [only] = listing.series.entries;
    if (listing.series.entries.length === 1 && only) pick(listing, only.id);
    else setOpened(listing);
  };

  let results;
  if (loading) {
    results = (
      <Loading className={TEAM_SOURCE_GRID}>
        {slots(SOURCE_SKELETONS).map((at) => <TeamSourceTileSkeleton key={at} />)}
      </Loading>
    );
  } else if (shown.length === 0) {
    results = error ? null : <NoneMatch onClear={browser.clear} />;
  } else {
    results = (
      <div className={TEAM_SOURCE_GRID}>
        {shown.map((listing) => (
          <TeamSourceTile
            key={`${kindOf(listing)}:${listing.series.id}`}
            series={listing.series}
            origin={listing.origin}
            teams={teamsOf(listing)}
            found={terms.length > 0 ? teamsOf(listing).filter((team) => matchesTerms(terms, [team.name])) : null}
            onChoose={() => choose(listing)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative min-h-0 flex-1">
      <div className="h-full" inert={opened !== null}>
        <BrowserLayout
          rail={<ChampionshipRail browser={browser} filters={filters} loading={loading} />}
          toolbar={(
            <div className="flex items-center gap-3">
              <SearchField
                value={search}
                placeholder={t('editor.teamSource.search')}
                inputClassName={TOOLBAR_SEARCH}
                onChange={setSearch}
              />
              {loading ? null : (
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {t('editor.teamSource.count', { count: shown.length })}
                </span>
              )}
            </div>
          )}
          scrollRef={forgetScroll}
          backToTop={false}
        >
          <div className="flex flex-col gap-4 pb-6">
            {error ? (
              <ErrorCard
                error={error}
                onDismiss={() => { championships.dismissError(); historic.dismissError(); }}
              />
            ) : null}
            {results}
          </div>
        </BrowserLayout>
      </div>

      {opened === null ? null : (
        <div className="absolute inset-0 z-20 flex flex-col bg-background">
          <div className="flex items-center gap-3 border-b px-6 pb-3">
            <Button variant="ghost" size="sm" onClick={() => setOpened(null)}>
              <ChevronLeftIcon />
              {t('editor.teamSource.back')}
            </Button>
            <span className="min-w-0 truncate font-semibold">{opened.series.name}</span>
          </div>
          <div className="flex min-h-0 flex-col gap-3 overflow-y-auto px-6 py-4">
            {opened.series.entries.map((entry) => (
              <TeamSourceClass
                key={entry.id}
                series={opened.series}
                entry={entry}
                ownNames={ownNames}
                onPick={() => pick(opened, entry.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

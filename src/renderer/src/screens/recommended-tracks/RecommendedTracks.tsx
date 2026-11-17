import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';

import { TRACK_SORT_ITEMS, TRACK_STATES, TRACKS_MEMORY } from './constants.ts';
import { TrackList } from './TrackList.tsx';
import { TracksIntro } from './TracksIntro.tsx';
import { TracksRail } from './TracksRail.tsx';
import type { TrackSortKey, TrackState } from './types.ts';
import {
  countUnder, matchesSearch, readTracksCriteria, sortCircuits, underDisciplines, underStates,
} from './utils.ts';
import { DISCIPLINES, RECOMMENDED_CIRCUITS } from '../../../../shared/constants';
import type { Discipline } from '../../../../shared/types';
import { recommendedLayout } from '../../../../shared/utils/recommended-tracks';
import { searchTerms } from '../../../../shared/utils/search';
import {
  BrowserLayout, SearchField, SortMenu, TOOLBAR_SEARCH,
} from '@/components';
import {
  useChampionships, usePreference, useRecommendedTracks, useRememberedSearch,
} from '@/hooks';
import { useFormat } from '@/i18n';
import { circuitUsage } from '@/lib/circuit-usage';
import { RECOMMENDED_PARAM } from '@/lib/routes';

/**
 * The settings screen's Tracks tab: every recommended circuit and the track
 * each of its layouts races, filtered down a rail as the browsers are.
 */
export const RecommendedTracks = () => {
  const { t } = useTranslation();
  const { formatNation } = useFormat();
  const tracks = useRecommendedTracks();
  const { listings } = useChampionships();
  const { states } = tracks;
  const [params] = useSearchParams();

  const [search, setSearch] = useRememberedSearch(TRACKS_MEMORY);
  const [criteria, setCriteria] = usePreference(TRACKS_MEMORY, readTracksCriteria);
  // Opened on a layout by a link from a round: the circuit searched for, and
  // the filters cleared, so it is listed whatever the tab was left showing.
  const asked = params.get(RECOMMENDED_PARAM);
  const [marked, setMarked] = useState<string | null>(null);
  if (asked !== null && asked !== marked) {
    setMarked(asked);
    const entry = recommendedLayout(asked);
    if (entry) {
      setSearch(entry.circuit.name);
      setCriteria({ ...criteria, states: [], disciplines: [] });
    }
  }
  const {
    states: picked, disciplines, sort, direction,
  } = criteria;
  // The scroller is the layout's own; nothing here pages, so nothing watches it.
  const scrollRef = useCallback(() => undefined, []);

  const usage = useMemo(() => circuitUsage(listings), [listings]);

  const stateCounts = useMemo(() => (states ? Object.fromEntries(TRACK_STATES.map((state) => [
    state, countUnder(states, state),
  ])) as Record<TrackState, number> : null), [states]);
  const disciplineCounts = useMemo(() => Object.fromEntries(DISCIPLINES.map((discipline) => [
    discipline, RECOMMENDED_CIRCUITS.filter((circuit) => underDisciplines(usage.get(circuit.id), [discipline])).length,
  ])) as Record<Discipline, number>, [usage]);

  const terms = searchTerms(search);
  const shown = sortCircuits(
    RECOMMENDED_CIRCUITS.filter((circuit) => (
      (states === null || underStates(circuit, states, picked))
      && underDisciplines(usage.get(circuit.id), disciplines)
      && matchesSearch(circuit, states, terms)
    )),
    usage,
    sort,
    direction,
    formatNation,
  );

  return (
    <BrowserLayout
      heading={<div className="pt-6"><TracksIntro states={states} /></div>}
      rail={(
        <TracksRail
          states={picked}
          disciplines={disciplines}
          stateCounts={stateCounts}
          disciplineCounts={disciplineCounts}
          onStates={(next) => setCriteria({ ...criteria, states: next })}
          onDisciplines={(next) => setCriteria({ ...criteria, disciplines: next })}
        />
      )}
      toolbar={(
        <div className="flex items-center gap-2">
          <SearchField
            value={search}
            placeholder={t('recommendedTracks.search')}
            inputClassName={TOOLBAR_SEARCH}
            onChange={setSearch}
          />
          <SortMenu<TrackSortKey>
            items={TRACK_SORT_ITEMS}
            value={sort}
            direction={direction}
            onChange={(next) => setCriteria({ ...criteria, sort: next })}
            onDirectionChange={(next) => setCriteria({ ...criteria, direction: next })}
          />
        </div>
      )}
      scrollRef={scrollRef}
      backToTop
    >
      <TrackList
        circuits={shown}
        usage={usage}
        tracks={tracks}
        marked={marked ?? undefined}
      />
    </BrowserLayout>
  );
};

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TRACK_FILTERS } from './constants.ts';
import { TrackList } from './TrackList.tsx';
import { TracksIntro } from './TracksIntro.tsx';
import type { TrackFilter } from './types.ts';
import {
  countUnder, matchesSearch, sortCircuits, underFilter,
} from './utils.ts';
import { RECOMMENDED_CIRCUITS } from '../../../../shared/constants';
import { searchTerms } from '../../../../shared/utils/search';
import { SearchField, Segments, TOOLBAR_SEARCH } from '@/components';
import { useChampionships, useRecommendedTracks } from '@/hooks';
import { useFormat } from '@/i18n';
import { TRACK_STATE_DOT } from '@/lib/accents';
import { circuitUsage } from '@/lib/circuit-usage';
import { cn } from '@/lib/utils.ts';

/**
 * Every recommended circuit and the track each of its layouts races, as a step
 * of first-run setup: the Tracks tab's list with a row of filters in place of
 * its rail, which the wizard has no room for. Opens on what wants looking at -
 * the guesses while there are any, else what is not installed, else everything.
 */
export const RecommendedTracksBody = () => {
  const { t } = useTranslation();
  const { formatNation } = useFormat();
  const tracks = useRecommendedTracks();
  const { listings } = useChampionships();
  const { states } = tracks;

  const [search, setSearch] = useState('');
  const [picked, setPicked] = useState<TrackFilter | null>(null);

  const usage = useMemo(() => circuitUsage(listings), [listings]);

  const count = (filter: TrackFilter): number | null => (states ? countUnder(states, filter) : null);
  // Decided once, as the states first arrive, so taking the last guess leaves
  // the list where it is.
  if (picked === null && states) {
    setPicked((['guess', 'missing'] as const).find((one) => countUnder(states, one) > 0) ?? 'all');
  }
  const filter = picked ?? 'all';

  const terms = searchTerms(search);
  const shown = sortCircuits(
    RECOMMENDED_CIRCUITS.filter((circuit) => (
      (states === null || underFilter(circuit, states, filter)) && matchesSearch(circuit, states, terms)
    )),
    usage,
    'championships',
    'desc',
    formatNation,
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Pinned to the top of the step's scroller. */}
      <div className="sticky top-0 z-10 flex flex-col gap-4 bg-card pb-1">
        <TracksIntro states={states} />

        <div className="flex flex-wrap items-center gap-2.5">
          <SearchField
            value={search}
            placeholder={t('recommendedTracks.search')}
            inputClassName={TOOLBAR_SEARCH}
            onChange={setSearch}
          />
          <Segments
            label={t('recommendedTracks.filter.state')}
            value={filter}
            onChange={setPicked}
            items={TRACK_FILTERS.map(({ id, label }) => ({
            id,
            label: t(label),
            count: count(id),
            icon: id === 'all' ? undefined : <span className={cn('size-2 rounded-full', TRACK_STATE_DOT[id])} />,
          }))}
          />
        </div>
      </div>

      <TrackList circuits={shown} usage={usage} tracks={tracks} trackPages={false} />
    </div>
  );
};

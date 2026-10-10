import { useCallback, useEffect, useState } from 'react';

import type { ChampionshipResultsDetail, ChampionshipResultsState } from './types.ts';
import type { ChampionshipResults, ChampionshipRun } from '../../../../shared/types';
import { invoke, subscribe, toDisplayableError } from '@/lib/ipc';

export type { ChampionshipResultsDetail } from './types.ts';

/**
 * Loads one edition of a championship so far - the career's own rounds, or
 * every round behind the clock simulated when the career is not in it.
 *
 * Read again whenever the career or the library changes: an event scored,
 * the clock moved or the championship edited each change what it says.
 * @param series The championship, by its id
 * @param run Which season and edition, where the page names one; otherwise the
 * current season and the edition the career is racing, or else the one still
 * to come
 * @returns The season and what is stopping it loading
 */
export const useChampionshipResults = (
  series: string,
  run: Partial<ChampionshipRun> = {},
): ChampionshipResultsDetail => {
  const [state, setState] = useState<ChampionshipResultsState>({ key: '', results: null, error: null });
  const { season, edition } = run;
  // What the results were read for, so a page moving to another edition shows
  // the skeleton rather than the edition it left.
  const key = `${series}\u0000${season ?? ''}\u0000${edition ?? ''}`;

  const load = useCallback((): (() => void) => {
    let live = true;

    invoke('career:results', { series, season, edition }).then(
      (results: ChampionshipResults) => {
        if (live) setState({ key, results, error: null });
      },
      (thrown: unknown) => {
        if (live) setState({ key, results: null, error: toDisplayableError(thrown) });
      },
    );

    return () => { live = false; };
  }, [series, season, edition, key]);

  useEffect(load, [load]);
  useEffect(() => subscribe('career:changed', () => { load(); }), [load]);
  useEffect(() => subscribe('series:changed', () => { load(); }), [load]);

  return {
    results: state.key === key ? state.results : null,
    loading: state.key !== key,
    error: state.error,
    dismissError: () => setState((prev) => ({ ...prev, error: null })),
  };
};

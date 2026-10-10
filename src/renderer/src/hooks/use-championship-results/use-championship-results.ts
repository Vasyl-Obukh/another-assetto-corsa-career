import { useCallback, useEffect, useState } from 'react';

import type { ChampionshipResultsDetail, ChampionshipResultsState } from './types.ts';
import type { ChampionshipResults } from '../../../../shared/types';
import { invoke, subscribe, toDisplayableError } from '@/lib/ipc';

export type { ChampionshipResultsDetail } from './types.ts';

/**
 * Loads a championship's season so far - the career's own rounds, or every
 * round behind the clock simulated when the career is not in it.
 *
 * Read again whenever the career or the library changes: an event scored,
 * the clock moved or the championship edited each change what it says.
 * @param series The championship, by its id
 * @returns The season and what is stopping it loading
 */
export const useChampionshipResults = (series: string): ChampionshipResultsDetail => {
  const [state, setState] = useState<ChampionshipResultsState>({ key: '', results: null, error: null });

  const load = useCallback((): (() => void) => {
    let live = true;

    invoke('career:results', { series }).then(
      (results: ChampionshipResults) => {
        if (live) setState({ key: series, results, error: null });
      },
      (thrown: unknown) => {
        if (live) setState({ key: series, results: null, error: toDisplayableError(thrown) });
      },
    );

    return () => { live = false; };
  }, [series]);

  useEffect(load, [load]);
  useEffect(() => subscribe('career:changed', () => { load(); }), [load]);
  useEffect(() => subscribe('series:changed', () => { load(); }), [load]);

  return {
    results: state.key === series ? state.results : null,
    loading: state.key !== series,
    error: state.error,
    dismissError: () => setState((prev) => ({ ...prev, error: null })),
  };
};

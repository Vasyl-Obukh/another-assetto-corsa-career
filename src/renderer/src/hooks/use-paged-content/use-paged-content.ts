import {
  useCallback, useEffect, useRef, useState,
} from 'react';

import { PAGE_SIZE } from './constants.ts';
import type { PagedList, PagedState } from './types.ts';
import { appendPage, emptyState, firstPage } from './utils.ts';
import type { Page } from '../../../../shared/types';
import { toDisplayableError } from '@/lib/ipc';

export type { PagedList } from './types.ts';

/**
 * Loads a filtered list one page at a time, appending as it goes.
 *
 * The accumulated state carries the key it was built from, so `loading` is
 * derived during render as "the state does not belong to the query being asked
 * for now" rather than written by an effect. That matters: clearing the list
 * with a synchronous setState in an effect body is what react-hooks forbids, and
 * deriving it means there is no reset write to get wrong in the first place.
 * @param load Fetches one page; must be memoised against the query
 * @param key A stable identity for the query, which starts the list over
 * @param idOf Reads an entry's identity, so appended pages can be de-duplicated
 * @returns The list, and the actions that extend it
 */
export const usePagedContent = <T>(
  load: (offset: number, limit: number) => Promise<Page<T>>,
  key: string,
  idOf: (item: T) => string,
): PagedList<T> => {
  const [nonce, setNonce] = useState(0);
  const stateKey = `${nonce}:${key}`;

  const [state, setState] = useState<PagedState<T>>(() => emptyState<T>(stateKey));
  // Guards against the observer firing again before the state that would have
  // stopped it has been committed. Written only from effects and callbacks.
  const inFlight = useRef(false);

  const settled = state.key === stateKey;

  useEffect(() => {
    let live = true;
    inFlight.current = true;

    load(0, PAGE_SIZE).then(
      (page) => {
        if (!live) return;
        inFlight.current = false;
        setState(firstPage(stateKey, page));
      },
      (thrown: unknown) => {
        if (!live) return;
        inFlight.current = false;
        setState({
          ...emptyState<T>(stateKey),
          exhausted: true,
          error: toDisplayableError(thrown),
        });
      },
    );

    return () => {
      live = false;
      inFlight.current = false;
    };
  }, [stateKey, load]);

  const loadMore = useCallback(() => {
    if (inFlight.current || !settled) return;
    if (state.exhausted || state.loadingMore || state.items.length >= state.total) return;

    inFlight.current = true;
    setState((prev) => (prev.key === stateKey ? { ...prev, loadingMore: true } : prev));

    load(state.items.length, PAGE_SIZE).then(
      (page) => {
        inFlight.current = false;
        setState((prev) => appendPage(prev, page, stateKey, idOf));
      },
      (thrown: unknown) => {
        inFlight.current = false;
        setState((prev) => (prev.key === stateKey
          ? { ...prev, loadingMore: false, error: toDisplayableError(thrown) }
          : prev));
      },
    );
  }, [stateKey, settled, state, load, idOf]);

  const reload = useCallback(() => setNonce((current) => current + 1), []);

  const dismissError = useCallback(() => {
    setState((prev) => (prev.error === null ? prev : { ...prev, error: null }));
  }, []);

  return {
    items: settled ? state.items : [],
    total: settled ? state.total : 0,
    loading: !settled,
    loadingMore: settled && state.loadingMore,
    exhausted: settled && state.exhausted,
    error: state.error,
    loadMore,
    reload,
    dismissError,
  };
};

import { Loader2Icon } from 'lucide-react';
import { Fragment } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { SKELETON_COUNT } from './constants.ts';
import { ErrorCard } from '@/components/ErrorCard.tsx';
import { Loading } from '@/components/Loading.tsx';
import { Button } from '@/components/ui/button.tsx';
import type { PagedList } from '@/hooks';
import type { BrowserView } from '@/lib/browser-memory';
import { path } from '@/lib/routes';
import { slots } from '@/lib/slots.ts';

interface BrowserGridProps<T> {
  /**
   * The list being rendered, for its loading, empty and error states.
   */
  list: PagedList<T>;
  /**
   * Whether any filter is set, so an empty result can offer to clear them.
   */
  filtered: boolean;
  /**
   * The cards themselves, or the table, already rendered by the screen.
   */
  children: ReactNode;
  /**
   * Whether the screen hands over cards to lay out or a table of its own.
   */
  view: BrowserView;
  /**
   * One card as it looks while the library is read, repeated to fill the
   * grid. A table draws its own skeleton rows, so it is handed in as the
   * children as usual.
   */
  cardSkeleton: ReactNode;
  /**
   * Ref for the marker that asks for the next page when it scrolls into view.
   * @param node The element, or null as it unmounts
   */
  sentinelRef(node: HTMLDivElement | null): void;
  /**
   * Drops every filter and the search text.
   */
  onClear(): void;
}

/**
 * The one grid definition, shared so skeletons land exactly where cards will.
 * As many columns as fit rather than a count per breakpoint, since the filter
 * rail takes its share of the width.
 */
const GRID = 'grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4';

export const BrowserGrid = <T, >({
  list,
  filtered,
  children,
  view,
  cardSkeleton,
  sentinelRef,
  onClear,
}: BrowserGridProps<T>) => {
  const { t } = useTranslation();

  // The one failure with somewhere better to send the user than an error card.
  if (list.error?.code === 'ipc.pathsNotLocated') {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-sm text-muted-foreground">{t('browse.locateFirst')}</p>
        <Button asChild size="sm">
          <Link to={path.diagnostics()}>{t('browse.goToDiagnostics')}</Link>
        </Button>
      </div>
    );
  }

  if (list.loading) {
    return view === 'cards' ? (
      <Loading className={GRID}>
        {slots(SKELETON_COUNT).map((at) => <Fragment key={at}>{cardSkeleton}</Fragment>)}
      </Loading>
    ) : <Loading>{children}</Loading>;
  }

  return (
    <>
      {list.error ? (
        <div className="pb-4">
          <ErrorCard error={list.error} onDismiss={list.dismissError} />
        </div>
      ) : null}

      {list.total === 0 ? (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <p className="text-sm text-muted-foreground">
            {filtered ? t('browse.noneFiltered') : t('browse.none')}
          </p>
          {filtered ? (
            <Button variant="outline" size="sm" onClick={onClear}>{t('browse.clearAll')}</Button>
          ) : null}
        </div>
      ) : (
        <div className={view === 'cards' ? GRID : undefined}>{children}</div>
      )}

      <div ref={sentinelRef} aria-hidden />

      {list.loadingMore ? (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" />
          {t('browse.loading')}
        </div>
      ) : null}

      {list.exhausted && list.total > 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">{t('browse.end')}</p>
      ) : null}
    </>
  );
};

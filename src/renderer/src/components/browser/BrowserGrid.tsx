import { Loader2Icon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { SKELETON_COUNT } from './constants.ts';
import { ROUTES } from '@/app';
import { ErrorCard } from '@/components/ErrorCard.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import type { PagedList } from '@/hooks';

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
   * The cards themselves, already rendered by the screen.
   */
  children: ReactNode;
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
 */
const GRID = 'grid grid-cols-1 gap-4 py-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4';

export const BrowserGrid = <T, >({
  list,
  filtered,
  children,
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
          <Link to={ROUTES.diagnostics}>{t('browse.goToDiagnostics')}</Link>
        </Button>
      </div>
    );
  }

  if (list.loading) {
    return (
      <div className={GRID}>
        {Array.from({ length: SKELETON_COUNT }, (unused, index) => index).map((index) => (
          <Skeleton key={index} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      {list.error ? (
        <div className="pt-4">
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
        <div className={GRID}>{children}</div>
      )}

      <div ref={sentinelRef} aria-hidden />

      {list.loadingMore ? (
        <div className="flex items-center justify-center gap-2 pb-8 text-sm text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" />
          {t('browse.loading')}
        </div>
      ) : null}

      {list.exhausted && list.total > 0 ? (
        <p className="pb-8 text-center text-xs text-muted-foreground">{t('browse.end')}</p>
      ) : null}
    </>
  );
};

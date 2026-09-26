import { RefreshCwIcon, XIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { ActiveFilter } from './types.ts';
import { Shimmer } from '@/components/Shimmer.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useFormat } from '@/i18n';

interface ActiveFiltersProps {
  /**
   * Every filter in force.
   */
  filters: readonly ActiveFilter[];
  /**
   * How many entries are loaded, for the running count.
   */
  shown: number;
  /**
   * How many matched in total.
   */
  total: number;
  /**
   * Whether content changed under a list the user has already scrolled.
   */
  stale: boolean;
  /**
   * Whether the first answer is still being read, which holds the count's
   * place rather than reporting nothing found.
   */
  loading?: boolean;
  /**
   * Drops every filter.
   */
  onClear(): void;
  /**
   * Loads the list again from the first page.
   */
  onRefresh(): void;
}

/**
 * What is narrowing the results, one removable pill each, beside how many
 * matched - so nothing filters the list unseen.
 */
export const ActiveFilters = ({
  filters, shown, total, stale, loading = false, onClear, onRefresh,
}: ActiveFiltersProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();

  return (
    <div className="flex min-h-7 flex-wrap items-center gap-1.5 text-sm">
      {filters.map((filter) => (
        <span
          key={filter.key}
          className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/8 py-0.5 pr-0.5 pl-2.5 text-xs"
        >
          {filter.name === undefined ? null : (
            <span className="text-muted-foreground">{t('browse.pillName', { name: filter.name })}</span>
          )}
          <span className="font-medium">{filter.value}</span>
          <button
            type="button"
            aria-label={t('browse.remove', { filter: filter.value })}
            className="grid size-5 place-items-center rounded-full text-muted-foreground hover:bg-primary/15 hover:text-foreground"
            onClick={filter.onRemove}
          >
            <XIcon className="size-3" />
          </button>
        </span>
      ))}

      {filters.length > 1 ? (
        <Button variant="link" size="sm" className="h-auto px-1" onClick={onClear}>{t('browse.clearAll')}</Button>
      ) : null}

      {loading ? <Shimmer className="ml-1 h-2.5 w-14" /> : (
        <span className="ml-1 text-xs text-muted-foreground">
          {t('browse.showing', { shown: formatNumber(shown), total: formatNumber(total) })}
        </span>
      )}

      {stale ? (
        <Button variant="outline" size="sm" className="ml-auto h-7" onClick={onRefresh}>
          <RefreshCwIcon />
          {t('browse.stale')}
        </Button>
      ) : null}
    </div>
  );
};

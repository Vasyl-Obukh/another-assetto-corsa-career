import { RefreshCwIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { SearchField } from './SearchField.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useFormat } from '@/i18n';

interface BrowserToolbarProps {
  /**
   * What the user has typed so far.
   */
  search: string;
  /**
   * The already-translated placeholder for the search box.
   */
  placeholder: string;
  /**
   * How many entries are loaded, for the running count.
   */
  shown: number;
  /**
   * How many matched in total.
   */
  total: number;
  /**
   * Whether any filter is set, so clearing is worth offering.
   */
  filtered: boolean;
  /**
   * Whether content changed under a list the user has already scrolled.
   */
  stale: boolean;
  /**
   * The sort control and the filter controls for this collection.
   */
  children: ReactNode;
  /**
   * Replaces the search text.
   * @param next What the user has typed
   */
  onSearchChange(next: string): void;
  /**
   * Drops every filter and the search text.
   */
  onClear(): void;
  /**
   * Loads the list again from the first page.
   */
  onRefresh(): void;
}

export const BrowserToolbar = ({
  search,
  placeholder,
  shown,
  total,
  filtered,
  stale,
  children,
  onSearchChange,
  onClear,
  onRefresh,
}: BrowserToolbarProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();

  return (
    <div className="sticky top-0 z-10 flex flex-col gap-3 border-b bg-background/95 py-4 backdrop-blur">
      <div className="flex flex-wrap items-center gap-3">
        <SearchField value={search} placeholder={placeholder} onChange={onSearchChange} />
        {children}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs text-muted-foreground">
          {t('browse.showing', { shown: formatNumber(shown), total: formatNumber(total) })}
        </span>

        {filtered ? (
          <Button variant="ghost" size="sm" onClick={onClear}>{t('browse.clearAll')}</Button>
        ) : null}

        {stale ? (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCwIcon />
            {t('browse.stale')}
          </Button>
        ) : null}
      </div>
    </div>
  );
};

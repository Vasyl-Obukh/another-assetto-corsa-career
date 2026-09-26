import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button.tsx';
import { cn } from '@/lib/utils.ts';

interface FilterRailProps {
  /**
   * Whether any filter is set, so clearing them is worth offering.
   */
  filtered: boolean;
  /**
   * Drops every filter.
   */
  onClear(): void;
  /**
   * The sections.
   */
  children: ReactNode;
}

/**
 * The column of filters beside a browser's results. It is as tall as its
 * sections up to the height it is given, and scrolls inside itself past that.
 */
export const FilterRail = ({ filtered, onClear, children }: FilterRailProps) => {
  const { t } = useTranslation();

  return (
    <aside
      aria-label={t('browse.filters')}
      className="flex max-h-full min-h-0 flex-col self-start overflow-hidden rounded-xl border bg-card"
    >
      <div className="flex items-center justify-between border-b py-1.5 pr-1 pl-4">
        <h2 className="text-sm font-semibold">{t('browse.filters')}</h2>
        {/* Kept in the layout while hidden, so the heading does not jump. */}
        <Button variant="link" size="sm" className={cn(!filtered && 'invisible')} onClick={onClear}>
          {t('browse.clearAll')}
        </Button>
      </div>
      <div className="min-h-0 overflow-y-auto [scrollbar-gutter:stable]">{children}</div>
    </aside>
  );
};

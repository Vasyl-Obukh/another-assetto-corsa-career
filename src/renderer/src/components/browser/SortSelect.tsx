import { ArrowDownNarrowWideIcon, ArrowUpNarrowWideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { SortItem } from './types.ts';
import type { SortDirection } from '../../../../shared/types';
import { Button } from '@/components/ui/button.tsx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';

interface SortSelectProps<K extends string> {
  /**
   * Every key this list can be sorted by.
   */
  items: readonly SortItem<K>[];
  /**
   * The key currently sorted on.
   */
  value: K;
  /**
   * Which way the sort runs.
   */
  direction: SortDirection;
  /**
   * Sorts by a different key.
   * @param next The key to sort by
   */
  onChange(next: K): void;
  /**
   * Reverses the sort.
   * @param next The direction to sort in
   */
  onDirectionChange(next: SortDirection): void;
}

export const SortSelect = <K extends string>({
  items,
  value,
  direction,
  onChange,
  onDirectionChange,
}: SortSelectProps<K>) => {
  const { t } = useTranslation();
  const ascending = direction === 'asc';

  return (
    <div className="flex shrink-0 items-center gap-1">
      <Select value={value} onValueChange={(next) => onChange(next as K)}>
        <SelectTrigger size="sm" aria-label={t('browse.sort')} className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.key} value={item.key}>{t(item.label)}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        aria-pressed={!ascending}
        aria-label={ascending ? t('browse.ascending') : t('browse.descending')}
        title={ascending ? t('browse.ascending') : t('browse.descending')}
        onClick={() => onDirectionChange(ascending ? 'desc' : 'asc')}
      >
        {ascending ? <ArrowUpNarrowWideIcon /> : <ArrowDownNarrowWideIcon />}
      </Button>
    </div>
  );
};

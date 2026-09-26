import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { SortItem } from './types.ts';
import type { SortDirection } from '../../../../shared/types';
import { Button } from '@/components/ui/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';

interface SortMenuProps<K extends string> {
  /**
   * Every key the list can be sorted by.
   */
  items: readonly SortItem<K>[];
  /**
   * The key sorted by now.
   */
  value: K;
  /**
   * Which way it runs.
   */
  direction: SortDirection;
  /**
   * Re-sorts by another key.
   * @param next The key
   */
  onChange(next: K): void;
  /**
   * Turns the order round.
   * @param next Which way it now runs
   */
  onDirectionChange(next: SortDirection): void;
}

/**
 * What a browser is sorted by and which way, as one button the size of the
 * search box beside it.
 */
export const SortMenu = <K extends string>({
  items, value, direction, onChange, onDirectionChange,
}: SortMenuProps<K>) => {
  const { t } = useTranslation();
  const current = items.find((item) => item.key === value) ?? items[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-9 shrink-0 gap-1.5 rounded-lg bg-card px-3 font-normal">
          <ArrowUpDownIcon className="text-muted-foreground" />
          {current === undefined ? null : t('browse.sortBy', { key: t(current.label) })}
          {direction === 'asc'
            ? <ArrowUpIcon className="size-3.5 text-muted-foreground" aria-label={t('browse.ascending')} />
            : <ArrowDownIcon className="size-3.5 text-muted-foreground" aria-label={t('browse.descending')} />}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>{t('browse.sort')}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={value} onValueChange={(next) => onChange(next as K)}>
          {items.map((item) => (
            <DropdownMenuRadioItem key={item.key} value={item.key}>{t(item.label)}</DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={direction} onValueChange={(next) => onDirectionChange(next as SortDirection)}>
          <DropdownMenuRadioItem value="asc">{t('browse.ascending')}</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="desc">{t('browse.descending')}</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

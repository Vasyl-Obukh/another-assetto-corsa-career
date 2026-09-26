import { ChevronRightIcon, SearchIcon, XIcon } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { RAIL_LETTERS } from './constants.ts';
import { RailOption } from './RailOption.tsx';
import type { RailItem } from './types.ts';
import { letterGroups } from './utils.ts';
import { matchesTerms, searchTerms } from '../../../../shared/utils/search';
import { Button } from '@/components/ui/button.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { useFormat } from '@/i18n';

interface RailFlyoutProps {
  /**
   * What the trigger and the panel's heading read, already translated - "All
   * 77 brands".
   */
  title: string;
  /**
   * The whole list.
   */
  items: readonly RailItem[];
  /**
   * The values picked.
   */
  selected: readonly string[];
  /**
   * Picks a value, or lifts the pick.
   * @param value The value
   */
  onToggle(value: string): void;
  /**
   * Lifts every pick in this list.
   */
  onClear(): void;
}

/**
 * The whole of a long list, laid out beside the rail in A to Z columns, so the
 * rail itself never grows to hold it.
 */
export const RailFlyout = ({
  title, items, selected, onToggle, onClear,
}: RailFlyoutProps) => {
  const { t } = useTranslation();
  const { compare, formatNumber } = useFormat();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const base = useId();

  const terms = searchTerms(query);
  const groups = letterGroups(items
    .filter((item) => matchesTerms(terms, [item.label, item.value]))
    .sort((a, b) => compare(a.label, b.label)));

  /**
   * Opens or closes the panel, starting its search afresh each time.
   * @param next Whether it is open
   */
  const toggle = (next: boolean): void => {
    setOpen(next);
    setQuery('');
  };

  return (
    <Popover open={open} onOpenChange={toggle}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="mt-1.5 h-7 w-full justify-between px-2 text-xs font-normal">
          {title}
          <ChevronRightIcon />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side="right"
        align="start"
        sideOffset={16}
        collisionPadding={16}
        className="flex max-h-[min(80dvh,40rem)] w-[min(42rem,calc(100vw-20rem))] flex-col p-0"
      >
        <div className="flex items-center gap-3 border-b px-4 py-2.5">
          <h3 className="shrink-0 text-sm font-semibold">{title}</h3>
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border bg-background px-2.5 text-muted-foreground">
            <SearchIcon className="size-3.5 shrink-0" />
            <input
              // Typing straight away is what the panel is opened for.
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              aria-label={t('browse.facetSearch')}
              placeholder={t('browse.facetSearch')}
              className="h-8 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Button variant="ghost" size="icon" className="size-8" aria-label={t('browse.close')} onClick={() => toggle(false)}>
            <XIcon />
          </Button>
        </div>

        <nav aria-label={t('browse.letters')} className="flex flex-wrap gap-0.5 border-b px-3 py-1.5 text-xs font-semibold">
          {RAIL_LETTERS.map((letter) => (groups.has(letter) ? (
            <button
              key={letter}
              type="button"
              className="w-5 rounded py-0.5 text-primary hover:bg-accent"
              onClick={() => document.getElementById(`${base}-${letter}`)?.scrollIntoView({ block: 'start' })}
            >
              {letter}
            </button>
          ) : (
            <span key={letter} className="w-5 py-0.5 text-center text-muted-foreground/40">{letter}</span>
          )))}
        </nav>

        <div className="min-h-0 flex-1 columns-3 gap-5 overflow-y-auto px-4 pt-1 pb-3 [column-width:11rem]">
          {groups.size === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t('browse.facetEmpty')}</p>
          ) : [...groups].map(([letter, members]) => (
            <div key={letter} id={`${base}-${letter}`} className="break-inside-avoid-column">
              <p className="px-1 pt-2 pb-0.5 text-[11px] font-bold text-muted-foreground">{letter}</p>
              {members.map((item) => (
                <RailOption
                  key={item.value}
                  label={item.label}
                  count={item.count}
                  lead={item.lead}
                  checked={selected.includes(item.value)}
                  onToggle={() => onToggle(item.value)}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t px-4 py-2.5">
          <span className="text-xs text-muted-foreground">
            {selected.length === 0
              ? t('browse.nonePicked')
              : t('browse.picked', { count: selected.length, shown: formatNumber(selected.length) })}
          </span>
          {selected.length === 0 ? null : (
            <Button variant="link" size="sm" className="h-auto px-1" onClick={onClear}>{t('browse.clear')}</Button>
          )}
          <Button size="sm" className="ml-auto" onClick={() => toggle(false)}>{t('browse.done')}</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

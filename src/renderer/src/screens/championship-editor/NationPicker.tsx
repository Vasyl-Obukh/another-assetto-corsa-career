import { ChevronDownIcon, SearchIcon } from 'lucide-react';
import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { NationOption } from './NationOption.tsx';
import { NATION_CODES } from '../../../../shared/constants';
import { matchesTerms, searchTerms } from '../../../../shared/utils/search';
import { NationFlag } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';

/**
 * One line of the list: a nation, the option that clears the pick, or a
 * heading over a group of them.
 */
type Line =
  | { kind: 'heading'; label: string }
  | { kind: 'nation'; code: string | undefined; count?: number };

interface NationPickerProps {
  /**
   * The control's id, which is what ties a label to it.
   */
  id: string;
  /**
   * What the control is, already translated, for a picker with no label of
   * its own.
   */
  label?: string;
  /**
   * The nation picked, or undefined for none.
   */
  value: string | undefined;
  /**
   * What it races under with none picked - a seat's team's nation - shown
   * faded in its place. Undefined where nothing stands in.
   */
  fallback?: string;
  /**
   * The nations the championship already uses, most used first, with how many
   * teams and seats use each. Listed ahead of the rest.
   */
  used: readonly (readonly [string, number])[];
  /**
   * Whether it reads as a flag and a code alone, for a sheet with no room for
   * a name. The name is still in the list and on hover.
   */
  compact?: boolean;
  /**
   * Whether it may not change just now.
   */
  disabled: boolean;
  /**
   * Called with the nation picked, or undefined when it was cleared.
   * @param next The nation's code
   */
  onChange: (next: string | undefined) => void;
}

/**
 * Picks a nation out of the flags Assetto Corsa ships, by name in the user's
 * language or by code - the only way a nation is set, so nothing can name one
 * the game has no flag for.
 */
export const NationPicker = ({
  id, label, value, fallback, used, compact = false, disabled, onChange,
}: NationPickerProps) => {
  const { t } = useTranslation();
  const { compare, formatNation } = useFormat();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const shown = value ?? fallback;
  const terms = searchTerms(query);
  const all = [...NATION_CODES].sort((a, b) => compare(formatNation(a), formatNation(b)));
  const clearing = fallback === undefined ? t('editor.nation.none') : t('editor.nation.sameAsTeam');

  // Searching flattens the list: the groups are there to be read down, and a
  // search is already narrow enough to read at once.
  const lines: Line[] = terms.length > 0
    ? all
      .filter((code) => matchesTerms(terms, [formatNation(code), code]))
      .map((code) => ({ kind: 'nation', code }))
    : [
      { kind: 'nation', code: undefined },
      ...(used.length === 0 ? [] : [
        { kind: 'heading', label: t('editor.nation.used') } as const,
        ...used.map(([code, count]) => ({ kind: 'nation', code, count }) as const),
      ]),
      { kind: 'heading', label: t('editor.nation.all') },
      ...all.map((code) => ({ kind: 'nation', code }) as const),
    ];
  const options = lines.filter((line) => line.kind === 'nation');
  const at = Math.min(active, options.length - 1);

  /**
   * Opens or closes the list, starting it afresh each time it opens.
   * @param next Whether it is open
   */
  const toggle = (next: boolean): void => {
    setOpen(next);
    setQuery('');
    setActive(0);
  };

  /**
   * Picks a nation and closes the list.
   * @param code The nation, or undefined to clear the pick
   */
  const pick = (code: string | undefined): void => {
    onChange(code);
    toggle(false);
  };

  /**
   * Moves through the list with the arrow keys and picks with Enter.
   * @param event The key pressed in the search box
   */
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      const next = Math.max(0, Math.min(options.length - 1, at + step));
      setActive(next);
      document.getElementById(`${id}-option-${next}`)?.scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'Enter' && options[at] !== undefined) {
      event.preventDefault();
      pick(options[at].code);
    }
  };

  let index = -1;

  return (
    <Popover open={open} onOpenChange={toggle}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          aria-label={label}
          // The name where the trigger has no room for it, and where it only
          // stands in for the team's.
          title={shown === undefined ? undefined : formatNation(shown)}
          disabled={disabled}
          className={cn('w-full min-w-0 justify-start gap-2 px-2.5 font-normal', value === undefined && 'text-muted-foreground')}
        >
          <NationFlag code={shown} dim={value === undefined} />
          {compact ? (
            <span className="text-xs font-semibold tracking-wide">{shown ?? t('editor.nation.noneShort')}</span>
          ) : (
            <>
              <span className="min-w-0 truncate">{shown === undefined ? t('editor.nation.none') : formatNation(shown)}</span>
              {shown === undefined ? null : (
                <span className="text-xs font-semibold tracking-wide text-muted-foreground">{shown}</span>
              )}
            </>
          )}
          <ChevronDownIcon className="ml-auto opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="flex w-80 flex-col p-0">
        <div className="flex items-center gap-2 border-b px-3">
          <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
          <input
            // Typing straight away is what the list is opened for.
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            role="combobox"
            aria-expanded
            aria-controls={`${id}-list`}
            aria-activedescendant={options.length === 0 ? undefined : `${id}-option-${at}`}
            aria-label={t('editor.nation.search')}
            placeholder={t('editor.nation.search')}
            className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
          />
        </div>

        <div id={`${id}-list`} role="listbox" className="max-h-80 overflow-y-auto p-1">
          {options.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">{t('editor.nation.nothing')}</p>
          ) : lines.map((line) => {
            if (line.kind === 'heading') {
              return (
                <p key={line.label} className="px-2 pt-2.5 pb-1 text-xs font-semibold text-muted-foreground">
                  {line.label}
                </p>
              );
            }

            index += 1;
            const own = index;

            return (
              <NationOption
                // A nation may be listed twice, once among those in use.
                key={`${line.count === undefined ? 'all' : 'used'}-${line.code ?? 'none'}`}
                id={`${id}-option-${own}`}
                code={line.code}
                label={line.code === undefined ? clearing : formatNation(line.code)}
                count={line.count}
                fallback={fallback}
                selected={line.code === value}
                active={own === at}
                onHover={() => setActive(own)}
                onPick={() => pick(line.code)}
              />
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

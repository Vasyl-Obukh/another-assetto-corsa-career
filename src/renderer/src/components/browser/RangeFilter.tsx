import { ChevronDownIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { RangeValue } from './types.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';

interface RangeFilterProps {
  /**
   * The already-translated name of the dimension.
   */
  label: string;
  /**
   * The bounds currently set; either end may be absent.
   */
  value: RangeValue;
  /**
   * Whether the query drops entries with no value once a bound is set, which is
   * surprising enough on a modded library that it has to be said out loud.
   */
  excludesUnknown: boolean;
  /**
   * Replaces the bounds.
   * @param next The bounds now set
   */
  onChange(next: RangeValue): void;
}

/**
 * Reads a bound out of an input, treating anything unparsable as unset.
 * @param raw What the user typed
 * @returns The number, or undefined for no bound
 */
const toBound = (raw: string): number | undefined => {
  if (raw.trim() === '') return undefined;
  const parsed = Number(raw);

  return Number.isFinite(parsed) ? parsed : undefined;
};

export const RangeFilter = ({
  label,
  value,
  excludesUnknown,
  onChange,
}: RangeFilterProps) => {
  const { t } = useTranslation();
  const set = value.from !== undefined || value.to !== undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          {label}
          {set ? <Badge variant="secondary">{t('browse.rangeSet')}</Badge> : null}
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-64 p-3">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            value={value.from ?? ''}
            placeholder={t('browse.rangeFrom')}
            aria-label={t('browse.rangeFrom')}
            className="h-8"
            onChange={(event) => onChange({ ...value, from: toBound(event.target.value) })}
          />
          <Input
            type="number"
            inputMode="numeric"
            value={value.to ?? ''}
            placeholder={t('browse.rangeTo')}
            aria-label={t('browse.rangeTo')}
            className="h-8"
            onChange={(event) => onChange({ ...value, to: toBound(event.target.value) })}
          />
        </div>

        {set && excludesUnknown ? (
          <p className="mt-2 text-xs text-muted-foreground">{t('browse.rangeExcludesUnknown')}</p>
        ) : null}

        {set ? (
          <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => onChange({})}>
            {t('browse.clear')}
          </Button>
        ) : null}
      </PopoverContent>
    </Popover>
  );
};

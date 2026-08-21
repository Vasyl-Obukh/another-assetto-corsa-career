import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FACET_LIST_HEIGHT } from './constants.ts';
import { FacetOption } from './FacetOption.tsx';
import type { Facet } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';

interface FacetFilterProps {
  /**
   * The already-translated name of the dimension.
   */
  label: string;
  /**
   * Every value and how many entries carry it, as main counted them.
   */
  facets: Facet[];
  /**
   * The values currently picked.
   */
  selected: string[];
  /**
   * Replaces the picked values.
   * @param next The values now picked
   */
  onChange(next: string[]): void;
}

export const FacetFilter = ({
  label,
  facets,
  selected,
  onChange,
}: FacetFilterProps) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('');

  const needle = filter.trim().toLowerCase();
  const shown = needle === ''
    ? facets
    : facets.filter((facet) => facet.value.toLowerCase().includes(needle));

  const toggle = (value: string): void => {
    onChange(selected.includes(value)
      ? selected.filter((current) => current !== value)
      : [...selected, value]);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={facets.length === 0}>
          {label}
          {selected.length > 0 ? (
            <Badge variant="secondary">{selected.length}</Badge>
          ) : null}
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-64 p-2">
        <Input
          value={filter}
          placeholder={t('browse.facetSearch')}
          aria-label={t('browse.facetSearch')}
          className="mb-2 h-8"
          onChange={(event) => setFilter(event.target.value)}
        />

        {/* Order comes from main, which counts against every other filter but
            this one - re-sorting here would undo that drill-down. */}
        <div role="listbox" aria-multiselectable className={`overflow-y-auto ${FACET_LIST_HEIGHT}`}>
          {shown.length === 0 ? (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">
              {t('browse.facetEmpty')}
            </p>
          ) : shown.map((facet) => (
            <FacetOption
              key={facet.value}
              value={facet.value}
              count={facet.count}
              selected={selected.includes(facet.value)}
              onToggle={toggle}
            />
          ))}
        </div>

        {selected.length > 0 ? (
          <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => onChange([])}>
            {t('browse.clear')}
          </Button>
        ) : null}
      </PopoverContent>
    </Popover>
  );
};

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { ChampionshipFilter } from './types.ts';
import type { Facet } from '../../../../shared/types';
import { RailOption, toggledIn } from '@/components';

interface FacetListProps {
  /**
   * The filter the list picks values of.
   */
  filter: ChampionshipFilter;
  /**
   * How many championships carry each value, under the other filters.
   */
  facets: readonly Facet[];
  /**
   * The values picked.
   */
  picked: readonly string[];
  /**
   * The order to list values in, or none to sort them as numbers.
   */
  order?: readonly string[];
  /**
   * Something to draw before a value's name - a dot, a medal.
   * @param value The value
   * @returns What to draw
   */
  lead?: (value: string) => ReactNode;
  /**
   * Picks or drops a value.
   * @param next The values now picked
   */
  onChange(next: string[]): void;
  /**
   * Whether the library is still being read: every value in `order` is listed,
   * its count still to come.
   */
  loading?: boolean;
}

/**
 * A closed list of a filter's values, a checkbox each. A pick the other filters
 * have counted down to nothing stays listed, or there would be no way to lift it.
 */
export const FacetList = ({
  filter, facets, picked, order, lead, onChange, loading = false,
}: FacetListProps) => {
  const { t } = useTranslation();
  const present = new Set([...facets.map((facet) => facet.value), ...picked]);
  const values = order
    ? order.filter((value) => loading || present.has(value))
    : [...present].sort((a, b) => Number(a) - Number(b));

  return (
    <>
      {values.map((value) => (
        <RailOption
          key={value}
          label={filter.format(value, t)}
          count={loading ? null : facets.find((facet) => facet.value === value)?.count ?? 0}
          checked={picked.includes(value)}
          lead={lead?.(value)}
          onToggle={() => onChange(toggledIn(picked, value))}
        />
      ))}
    </>
  );
};

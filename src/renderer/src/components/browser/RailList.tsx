import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { RAIL_LONG, RAIL_TOP } from './constants.ts';
import { RailFlyout } from './RailFlyout.tsx';
import { RailOption } from './RailOption.tsx';
import { RailSearch } from './RailSearch.tsx';
import type { RailItem } from './types.ts';
import { matchesTerms, searchTerms } from '../../../../shared/utils/search';

interface RailListProps {
  /**
   * Every value, biggest first, as the facet counted them.
   */
  items: readonly RailItem[];
  /**
   * The values picked.
   */
  selected: readonly string[];
  /**
   * What the search box asks for, already translated - "Find a brand".
   */
  placeholder: string;
  /**
   * What opens the whole list, already translated - "All 77 brands".
   */
  all: string;
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
 * A filter list that may run to dozens of values.
 *
 * A short one is shown whole. A long one shows what is picked, pinned so it
 * never scrolls out of sight, then its biggest few, then a way into the rest -
 * and its search box searches all of it at once.
 */
export const RailList = ({
  items, selected, placeholder, all, onToggle, onClear,
}: RailListProps) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const option = (item: RailItem) => (
    <RailOption
      key={item.value}
      label={item.label}
      count={item.count}
      lead={item.lead}
      checked={selected.includes(item.value)}
      onToggle={() => onToggle(item.value)}
    />
  );

  if (items.length === 0 && selected.length === 0) {
    return <p className="text-xs text-muted-foreground">{t('browse.facetEmpty')}</p>;
  }

  if (items.length <= RAIL_LONG) return <>{items.map(option)}</>;

  const terms = searchTerms(query);
  // A pick the other filters have counted down to nothing is still listed,
  // or there would be no way to lift it from here.
  const pinned = selected.map((value) => (
    items.find((item) => item.value === value) ?? { value, label: value, count: 0 }
  ));
  const rest = items.filter((item) => !selected.includes(item.value));

  return (
    <>
      <RailSearch value={query} placeholder={placeholder} onChange={setQuery} />

      {terms.length > 0 ? (
        <div className="max-h-56 overflow-y-auto">
          {items.filter((item) => matchesTerms(terms, [item.label, item.value])).map(option)}
        </div>
      ) : (
        <>
          {pinned.length > 0 ? <div className="mb-1 border-b border-dashed pb-1">{pinned.map(option)}</div> : null}
          {rest.slice(0, RAIL_TOP).map(option)}
          <RailFlyout title={all} items={items} selected={selected} onToggle={onToggle} onClear={onClear} />
        </>
      )}
    </>
  );
};

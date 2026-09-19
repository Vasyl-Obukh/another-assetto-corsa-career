import { useTranslation } from 'react-i18next';

import { CHAMPIONSHIP_SORTS } from './constants.ts';
import type { ChampionshipFilter } from './types.ts';
import { BrowserToolbar, FacetFilter, SortSelect } from '@/components';
import type { ChampionshipBrowser } from '@/hooks';

interface ChampionshipToolbarProps {
  /**
   * The list's search, filters and sort.
   */
  browser: ChampionshipBrowser;
  /**
   * What the list can be narrowed by, one filter each.
   */
  filters: readonly ChampionshipFilter[];
}

export const ChampionshipToolbar = ({ browser, filters }: ChampionshipToolbarProps) => {
  const { t } = useTranslation();
  const { criteria } = browser;

  return (
    <BrowserToolbar
      search={browser.search}
      placeholder={t('championships.filter.search')}
      shown={browser.shown.length}
      total={browser.total}
      filtered={browser.filtered}
      onSearchChange={browser.setSearch}
      onClear={browser.clear}
    >
      <SortSelect
        items={CHAMPIONSHIP_SORTS}
        value={criteria.sort}
        direction={criteria.direction}
        onChange={(sort) => browser.setCriteria({ ...criteria, sort })}
        onDirectionChange={(direction) => browser.setCriteria({ ...criteria, direction })}
      />

      {filters.map((filter) => (
        <FacetFilter
          key={filter.key}
          label={t(filter.label)}
          facets={browser.facets[filter.key] ?? []}
          selected={[...(criteria.picked[filter.key] ?? [])]}
          format={(value) => filter.format(value, t)}
          onChange={(next) => browser.setCriteria({
            ...criteria,
            picked: { ...criteria.picked, [filter.key]: next },
          })}
        />
      ))}
    </BrowserToolbar>
  );
};

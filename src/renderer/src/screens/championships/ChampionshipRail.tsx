import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { ALL_TIERS, LIST_ORDER, RAIL_KEY } from './constants.ts';
import { FacetList } from './FacetList.tsx';
import { TierMedal } from './TierMedal.tsx';
import type { ChampionshipFilter } from './types.ts';
import {
  contentFacets, contentPicks, contentValues, withPicked,
} from './utils.ts';
import type { Discipline } from '../../../../shared/types';
import {
  FilterRail, provenanceNames, RailSection, RailSwitch, SourceTree,
} from '@/components';
import type { ChampionshipBrowser } from '@/hooks';
import { DISCIPLINE_DOT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface ChampionshipRailProps {
  /**
   * The browser the column narrows.
   */
  browser: ChampionshipBrowser;
  /**
   * What it can be narrowed by.
   */
  filters: readonly ChampionshipFilter[];
  /**
   * Whether the library is still being read, which lists every fixed value
   * with its count still to come.
   */
  loading?: boolean;
}

/**
 * A championship list's filters, laid out as the car and track browsers lay
 * theirs out: a section per filter, with what each needs as the browsers' own
 * source tree. A filter the list was not handed has no section - the
 * Championships page has neither the switch nor availability.
 */
export const ChampionshipRail = ({ browser, filters, loading = false }: ChampionshipRailProps) => {
  const { t } = useTranslation();
  const { criteria, facets } = browser;

  const pickedOf = (key: string): string[] => [...(criteria.picked[key] ?? [])];
  const setPicked = (key: string, next: readonly string[]): void => {
    browser.setCriteria(withPicked(criteria, key, next));
  };
  const filterOf = (key: string): ChampionshipFilter | undefined => filters.find((filter) => filter.key === key);
  const namesOf = (key: string): string[] => {
    const filter = filterOf(key);
    return filter ? pickedOf(key).map((value) => filter.format(value, t)) : [];
  };

  /**
   * One closed list as a section of the column.
   * @param key The filter's key
   * @param lead What to draw before each value's name
   * @param order The values in the order listed, when they are a fixed set
   * @returns The section, or nothing for a filter this column was not handed
   */
  const listSection = (key: string, lead?: (value: string) => ReactNode, order = LIST_ORDER[key]) => {
    const filter = filterOf(key);
    if (!filter) return null;

    return (
      <RailSection title={t(filter.label)} picked={namesOf(key)}>
        <FacetList
          filter={filter}
          facets={facets[key] ?? []}
          picked={pickedOf(key)}
          order={order}
          lead={lead}
          loading={loading}
          onChange={(next) => setPicked(key, next)}
        />
      </RailSection>
    );
  };

  const content = contentPicks(pickedOf(RAIL_KEY.content));

  return (
    <FilterRail filtered={browser.filtered} onClear={browser.clear}>
      {filterOf(RAIL_KEY.switched) ? (
        <RailSection>
          <RailSwitch
            label={t('championships.filter.switchedOnOnly')}
            checked={pickedOf(RAIL_KEY.switched).includes('on')}
            onChange={(on) => setPicked(RAIL_KEY.switched, on ? ['on'] : [])}
          />
        </RailSection>
      ) : null}

      {listSection(RAIL_KEY.disciplines, (value) => (
        <i aria-hidden className={cn('size-2 shrink-0 rounded-full', DISCIPLINE_DOT[value as Discipline])} />
      ))}

      {listSection(RAIL_KEY.tiers, (value) => (
        <TierMedal tier={Number(value)} className="size-4.5 text-[10px]" />
      ), loading ? [...ALL_TIERS].reverse().map(String) : undefined)}

      <RailSection title={t('championships.filter.sources')} picked={provenanceNames(content, t).map((pick) => pick.label)}>
        <SourceTree
          facets={loading ? null : contentFacets(facets[RAIL_KEY.content] ?? [])}
          picked={content}
          onChange={(next) => setPicked(RAIL_KEY.content, contentValues(next))}
        />
      </RailSection>

      {listSection(RAIL_KEY.origins)}
      {listSection(RAIL_KEY.availability)}
    </FilterRail>
  );
};

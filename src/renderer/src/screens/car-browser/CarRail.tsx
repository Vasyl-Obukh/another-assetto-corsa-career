import { useTranslation } from 'react-i18next';

import { ClassTree } from './ClassTree.tsx';
import { carRanges } from './pills.ts';
import type { CarFacets } from '../../../../shared/types';
import { carClassName, carSpecName } from '../../../../shared/utils/car-classes';
import { useClasses } from '@/app';
import {
  FilterRail, NationFlag, provenanceNames, RailList, RailRange, RailSection, RailSkeleton, RailSwitch, RangeSkeleton,
  SourceTree, toggledIn,
} from '@/components';
import type { CarCriteria } from '@/hooks';
import { useFormat } from '@/i18n';

interface CarRailProps {
  /**
   * The filters currently applied.
   */
  criteria: CarCriteria;
  /**
   * Counts behind each list, or null before the first response.
   */
  facets: CarFacets | null;
  /**
   * Whether any filter is set, so clearing them is worth offering.
   */
  filtered: boolean;
  /**
   * Replaces the filters.
   * @param next The criteria to apply
   */
  onChange(next: CarCriteria): void;
  /**
   * Drops every filter and the search text.
   */
  onClear(): void;
}

/**
 * Every filter the car browser offers, open beside the results.
 */
export const CarRail = ({
  criteria, facets, filtered, onChange, onClear,
}: CarRailProps) => {
  const { t } = useTranslation();
  const format = useFormat();
  const { formatNation, formatNumber, formatYear } = format;
  const { catalogue } = useClasses();

  const pickedClasses = criteria.classes ?? [];
  const pickedSpecs = criteria.specs ?? [];
  const brands = criteria.brands ?? [];
  const countries = criteria.countries ?? [];
  const { formatPower, years, power } = carRanges(criteria, facets, t, format);

  return (
    <FilterRail filtered={filtered} onClear={onClear}>
      <RailSection>
        <RailSwitch
          label={t('browse.raced')}
          checked={criteria.raced === true}
          onChange={(raced) => onChange({ ...criteria, raced: raced || undefined })}
        />
      </RailSection>

      <RailSection
        title={t('cars.filter.classes')}
        picked={[
          ...pickedClasses.map((one) => carClassName(one, catalogue)),
          ...pickedSpecs.map((one) => carSpecName(one, catalogue)),
        ]}
      >
        {facets === null ? <RailSkeleton /> : (
          <ClassTree
            classes={facets.classes}
            specs={facets.specs}
            pickedClasses={pickedClasses}
            pickedSpecs={pickedSpecs}
            catalogue={catalogue}
            onChange={(classes, specs) => onChange({ ...criteria, classes, specs })}
          />
        )}
      </RailSection>

      <RailSection title={t('browse.source')} picked={provenanceNames(criteria, t).map((pick) => pick.label)}>
        <SourceTree facets={facets} picked={criteria} onChange={(next) => onChange({ ...criteria, ...next })} />
      </RailSection>

      <RailSection title={t('cars.filter.brands')} picked={brands}>
        {facets === null ? <RailSkeleton /> : (
          <RailList
            items={facets.brands.map(({ value, count }) => ({ value, label: value, count }))}
            selected={brands}
            placeholder={t('cars.filter.findBrand')}
            all={t('cars.filter.allBrands', { count: facets.brands.length, shown: formatNumber(facets.brands.length) })}
            onToggle={(value) => onChange({ ...criteria, brands: toggledIn(brands, value) })}
            onClear={() => onChange({ ...criteria, brands: undefined })}
          />
        )}
      </RailSection>

      <RailSection title={t('cars.filter.countries')} picked={countries.map(formatNation)}>
        {facets === null ? <RailSkeleton /> : (
          <RailList
            items={facets.countries.map((facet) => ({
              value: facet.value,
              label: formatNation(facet.value),
              count: facet.count,
              lead: <NationFlag code={facet.value} />,
            }))}
            selected={countries}
            placeholder={t('cars.filter.findCountry')}
            all={t('cars.filter.allCountries', {
              count: facets.countries.length, shown: formatNumber(facets.countries.length),
            })}
            onToggle={(value) => onChange({ ...criteria, countries: toggledIn(countries, value) })}
            onClear={() => onChange({ ...criteria, countries: undefined })}
          />
        )}
      </RailSection>

      <RailSection
        title={t('cars.filter.years')}
        picked={years === null ? [] : [years]}
      >
        {facets === null ? <RangeSkeleton /> : (
          <RailRange
            spread={facets.years}
            value={{ from: criteria.yearFrom, to: criteria.yearTo }}
            step={1}
            label={t('cars.filter.years')}
            format={formatYear}
            onChange={(range) => onChange({ ...criteria, yearFrom: range.from, yearTo: range.to })}
          />
        )}
      </RailSection>

      <RailSection
        title={t('cars.filter.power')}
        picked={power === null ? [] : [power]}
      >
        {facets === null ? <RangeSkeleton /> : (
          <RailRange
            spread={facets.power}
            value={{ from: criteria.bhpFrom, to: criteria.bhpTo }}
            step={10}
            label={t('cars.filter.power')}
            format={formatPower}
            onChange={(range) => onChange({ ...criteria, bhpFrom: range.from, bhpTo: range.to })}
          />
        )}
      </RailSection>
    </FilterRail>
  );
};

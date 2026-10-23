import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { ClassTree } from './ClassTree.tsx';
import { carRanges, fromPriceScale, toPriceScale } from './pills.ts';
import type { CarFacets } from '../../../../shared/types';
import { carClassName, carSpecName } from '../../../../shared/utils/car-classes';
import { useClasses } from '@/app';
import {
  FilterRail, NationFlag, provenanceNames, RailList, RailOption, RailRange, RailSection, RailSkeleton, RailSwitch,
  RangeSkeleton, SourceTree, toggledIn,
} from '@/components';
import type { CarCriteria } from '@/hooks';
import { useFormat } from '@/i18n';
import { PRICE_ORIGIN_DOT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface CarRailProps {
  /**
   * Filters of the page's own, ahead of the rest.
   */
  top?: ReactNode;
  /**
   * Whether the browser prices its cars, which adds a price range.
   */
  priced?: boolean;
  /**
   * Whether the browser prices the cars the user added, which adds a filter
   * on where each price comes from.
   */
  appraised?: boolean;
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
  top, priced = false, appraised = false, criteria, facets, filtered, onChange, onClear,
}: CarRailProps) => {
  const { t } = useTranslation();
  const format = useFormat();
  const { formatNation, formatNumber, formatYear } = format;
  const { catalogue } = useClasses();

  const pickedClasses = criteria.classes ?? [];
  const pickedSpecs = criteria.specs ?? [];
  const brands = criteria.brands ?? [];
  const countries = criteria.countries ?? [];
  const origins = criteria.priceOrigins ?? [];
  const {
    formatPower, formatPrice, years, power, price,
  } = carRanges(criteria, facets, t, format);

  return (
    <FilterRail filtered={filtered} onClear={onClear}>
      {top}

      {priced ? (
        <RailSection title={t('cars.filter.price')} picked={price === null ? [] : [price]}>
          {facets === null ? <RangeSkeleton /> : (
            // Over the price's logarithm, the scale the spread is drawn on.
            <RailRange
              spread={facets.prices}
              value={{ from: toPriceScale(criteria.priceFrom), to: toPriceScale(criteria.priceTo) }}
              step={0.01}
              label={t('cars.filter.price')}
              format={formatPrice}
              onChange={(range) => onChange({
                ...criteria, priceFrom: fromPriceScale(range.from), priceTo: fromPriceScale(range.to),
              })}
            />
          )}
        </RailSection>
      ) : null}

      {appraised ? (
        <RailSection title={t('cars.filter.price')} picked={origins.map((one) => t(`prices.origin.${one}`))}>
          {(['suggested', 'yours'] as const).map((origin) => (
            <RailOption
              key={origin}
              label={t(`prices.origin.${origin}`)}
              lead={<span aria-hidden className={cn('size-2 rounded-full', PRICE_ORIGIN_DOT[origin])} />}
              count={facets === null ? null : facets.priceOrigins.find((one) => one.value === origin)?.count ?? 0}
              checked={origins.includes(origin)}
              onToggle={() => onChange({ ...criteria, priceOrigins: toggledIn(origins, origin) })}
            />
          ))}
        </RailSection>
      ) : null}

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

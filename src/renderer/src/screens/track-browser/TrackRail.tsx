import { useTranslation } from 'react-i18next';

import { trackRanges } from './pills.ts';
import type { TrackFacets } from '../../../../shared/types';
import {
  FilterRail, NationFlag, provenanceNames, RailList, RailRange, RailSection, RailSkeleton, RailSwitch, RangeSkeleton,
  SourceTree, toggledIn,
} from '@/components';
import type { TrackCriteria } from '@/hooks';
import { useUnits } from '@/hooks';
import { useFormat } from '@/i18n';

interface TrackRailProps {
  /**
   * The filters currently applied.
   */
  criteria: TrackCriteria;
  /**
   * Counts behind each list, or null before the first response.
   */
  facets: TrackFacets | null;
  /**
   * Whether any filter is set, so clearing them is worth offering.
   */
  filtered: boolean;
  /**
   * Replaces the filters.
   * @param next The criteria to apply
   */
  onChange(next: TrackCriteria): void;
  /**
   * Drops every filter and the search text.
   */
  onClear(): void;
}

/**
 * Every filter the track browser offers, open beside the results.
 */
export const TrackRail = ({
  criteria, facets, filtered, onChange, onClear,
}: TrackRailProps) => {
  const { t } = useTranslation();
  const format = useFormat();
  const { formatNation, formatNumber } = format;

  const countries = criteria.countries ?? [];
  const units = useUnits();
  const { formatLength, length, pitboxes } = trackRanges(criteria, facets, format, units);

  return (
    <FilterRail filtered={filtered} onClear={onClear}>
      <RailSection>
        <RailSwitch
          label={t('browse.raced')}
          checked={criteria.raced === true}
          onChange={(raced) => onChange({ ...criteria, raced: raced || undefined })}
        />
        <RailSwitch
          label={t('tracks.filter.hasGeotags')}
          checked={criteria.hasGeotags === true}
          onChange={(hasGeotags) => onChange({ ...criteria, hasGeotags: hasGeotags || undefined })}
        />
      </RailSection>

      <RailSection title={t('browse.source')} picked={provenanceNames(criteria, t).map((pick) => pick.label)}>
        <SourceTree facets={facets} picked={criteria} onChange={(next) => onChange({ ...criteria, ...next })} />
      </RailSection>

      <RailSection title={t('tracks.filter.countries')} picked={countries.map(formatNation)}>
        {facets === null ? <RailSkeleton /> : (
          <RailList
            items={facets.countries.map((facet) => ({
              value: facet.value,
              label: formatNation(facet.value),
              count: facet.count,
              lead: <NationFlag code={facet.value} />,
            }))}
            selected={countries}
            placeholder={t('tracks.filter.findCountry')}
            all={t('tracks.filter.allCountries', {
              count: facets.countries.length, shown: formatNumber(facets.countries.length),
            })}
            onToggle={(value) => onChange({
              ...criteria,
              countries: toggledIn(countries, value),
            })}
            onClear={() => onChange({ ...criteria, countries: undefined })}
          />
        )}
      </RailSection>

      <RailSection title={t('tracks.filter.length')} picked={length === null ? [] : [length]}>
        {facets === null ? <RangeSkeleton /> : (
          <RailRange
            spread={facets.length}
            value={{ from: criteria.lengthFrom, to: criteria.lengthTo }}
            step={100}
            label={t('tracks.filter.length')}
            format={formatLength}
            onChange={(range) => onChange({ ...criteria, lengthFrom: range.from, lengthTo: range.to })}
          />
        )}
      </RailSection>

      <RailSection title={t('tracks.filter.pitboxes')} picked={pitboxes === null ? [] : [pitboxes]}>
        {facets === null ? <RangeSkeleton /> : (
          <RailRange
            spread={facets.pitboxes}
            value={{ from: criteria.pitboxesFrom, to: criteria.pitboxesTo }}
            step={1}
            label={t('tracks.filter.pitboxes')}
            format={formatNumber}
            onChange={(range) => onChange({ ...criteria, pitboxesFrom: range.from, pitboxesTo: range.to })}
          />
        )}
      </RailSection>
    </FilterRail>
  );
};

import { useTranslation } from 'react-i18next';

import type { TrackFacets } from '../../../../shared/types';
import { FacetFilter, RangeFilter, ToggleFilter } from '@/components';
import type { TrackCriteria } from '@/hooks';

interface TrackFiltersProps {
  /**
   * The filters currently applied.
   */
  criteria: TrackCriteria;
  /**
   * Counts behind each list, or null before the first response.
   */
  facets: TrackFacets | null;
  /**
   * Replaces the filters.
   * @param next The criteria to apply
   */
  onChange(next: TrackCriteria): void;
}

export const TrackFilters = ({ criteria, facets, onChange }: TrackFiltersProps) => {
  const { t } = useTranslation();

  return (
    <>
      <FacetFilter
        label={t('tracks.filter.countries')}
        facets={facets?.countries ?? []}
        selected={criteria.countries ?? []}
        onChange={(countries) => onChange({ ...criteria, countries })}
      />

      <RangeFilter
        label={t('tracks.filter.pitboxes')}
        value={{ from: criteria.pitboxesFrom, to: criteria.pitboxesTo }}
        excludesUnknown
        onChange={(range) => onChange({
          ...criteria, pitboxesFrom: range.from, pitboxesTo: range.to,
        })}
      />

      <ToggleFilter
        label={t('tracks.filter.hasGeotags')}
        value={criteria.hasGeotags === true}
        onChange={(hasGeotags) => onChange({ ...criteria, hasGeotags: hasGeotags || undefined })}
      />
    </>
  );
};

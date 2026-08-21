import { useTranslation } from 'react-i18next';

import type { CarFacets } from '../../../../shared/types';
import { FacetFilter, RangeFilter, ToggleFilter } from '@/components';
import type { CarCriteria } from '@/hooks';

interface CarFiltersProps {
  /**
   * The filters currently applied.
   */
  criteria: CarCriteria;
  /**
   * Counts behind each list, or null before the first response.
   */
  facets: CarFacets | null;
  /**
   * Replaces the filters.
   * @param next The criteria to apply
   */
  onChange(next: CarCriteria): void;
}

export const CarFilters = ({ criteria, facets, onChange }: CarFiltersProps) => {
  const { t } = useTranslation();

  return (
    <>
      <FacetFilter
        label={t('cars.filter.brands')}
        facets={facets?.brands ?? []}
        selected={criteria.brands ?? []}
        onChange={(brands) => onChange({ ...criteria, brands })}
      />

      {/* Tags and it alone narrow by intersection: picking gt3 and dlc means
          both, since a tag list describes one car rather than partitioning. */}
      <FacetFilter
        label={t('cars.filter.tags')}
        facets={facets?.tags ?? []}
        selected={criteria.tags ?? []}
        onChange={(tags) => onChange({ ...criteria, tags })}
      />

      <FacetFilter
        label={t('cars.filter.classes')}
        facets={facets?.classes ?? []}
        selected={criteria.classes ?? []}
        onChange={(classes) => onChange({ ...criteria, classes })}
      />

      <FacetFilter
        label={t('cars.filter.countries')}
        facets={facets?.countries ?? []}
        selected={criteria.countries ?? []}
        onChange={(countries) => onChange({ ...criteria, countries })}
      />

      <RangeFilter
        label={t('cars.filter.years')}
        value={{ from: criteria.yearFrom, to: criteria.yearTo }}
        excludesUnknown
        onChange={(range) => onChange({ ...criteria, yearFrom: range.from, yearTo: range.to })}
      />

      <RangeFilter
        label={t('cars.filter.power')}
        value={{ from: criteria.bhpFrom, to: criteria.bhpTo }}
        excludesUnknown
        onChange={(range) => onChange({ ...criteria, bhpFrom: range.from, bhpTo: range.to })}
      />

      <ToggleFilter
        label={t('cars.filter.hasSkins')}
        value={criteria.hasSkins === true}
        onChange={(hasSkins) => onChange({ ...criteria, hasSkins: hasSkins || undefined })}
      />
    </>
  );
};

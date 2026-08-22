import { useTranslation } from 'react-i18next';

import type {
  CarFacets, ContentSource, DLCPack, ModDistributor, ModMaker,
} from '../../../../shared/types';
import { FacetFilter, RangeFilter, ToggleFilter } from '@/components';
import {
  distributorKey, makerKey, packKey, sourceKey,
} from '@/components/provenance-badges';
import type { ProvenanceLabelKey } from '@/components/provenance-badges';
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

  // Facet values are raw catalogue IDs; a key we do not have yet falls back to
  // the ID rather than rendering as a missing translation.
  const translate = (key: ProvenanceLabelKey | null, fallback: string): string => (
    key === null ? fallback : t(key)
  );

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


      <FacetFilter
        label={t('cars.filter.sources')}
        facets={facets?.sources ?? []}
        selected={criteria.sources ?? []}
        format={(value) => translate(sourceKey(value), value)}
        onChange={(sources) => onChange({ ...criteria, sources: sources as ContentSource[] })}
      />

      <FacetFilter
        label={t('cars.filter.packs')}
        facets={facets?.packs ?? []}
        selected={criteria.packs ?? []}
        format={(value) => translate(packKey(value), value)}
        onChange={(packs) => onChange({ ...criteria, packs: packs as DLCPack[] })}
      />

      <FacetFilter
        label={t('cars.filter.makers')}
        facets={facets?.makers ?? []}
        selected={criteria.makers ?? []}
        format={(value) => translate(makerKey(value), value)}
        onChange={(makers) => onChange({ ...criteria, makers: makers as ModMaker[] })}
      />

      <FacetFilter
        label={t('cars.filter.distributors')}
        facets={facets?.distributors ?? []}
        selected={criteria.distributors ?? []}
        format={(value) => translate(distributorKey(value), value)}
        onChange={(distributors) => onChange({
          ...criteria, distributors: distributors as ModDistributor[],
        })}
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

import { useTranslation } from 'react-i18next';

import type {
  ContentSource, DLCPack, ModDistributor, ModMaker, TrackFacets,
} from '../../../../shared/types';
import { FacetFilter, RangeFilter, ToggleFilter } from '@/components';
import {
  distributorKey, makerKey, packKey, sourceKey,
} from '@/components/provenance-badges';
import type { ProvenanceLabelKey } from '@/components/provenance-badges';
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

  // Facet values are raw catalogue IDs; a key we do not have yet falls back to
  // the ID rather than rendering as a missing translation.
  const translate = (key: ProvenanceLabelKey | null, fallback: string): string => (
    key === null ? fallback : t(key)
  );

  return (
    <>
      <FacetFilter
        label={t('tracks.filter.countries')}
        facets={facets?.countries ?? []}
        selected={criteria.countries ?? []}
        onChange={(countries) => onChange({ ...criteria, countries })}
      />


      <FacetFilter
        label={t('tracks.filter.sources')}
        facets={facets?.sources ?? []}
        selected={criteria.sources ?? []}
        format={(value) => translate(sourceKey(value), value)}
        onChange={(sources) => onChange({ ...criteria, sources: sources as ContentSource[] })}
      />

      <FacetFilter
        label={t('tracks.filter.packs')}
        facets={facets?.packs ?? []}
        selected={criteria.packs ?? []}
        format={(value) => translate(packKey(value), value)}
        onChange={(packs) => onChange({ ...criteria, packs: packs as DLCPack[] })}
      />

      <FacetFilter
        label={t('tracks.filter.makers')}
        facets={facets?.makers ?? []}
        selected={criteria.makers ?? []}
        format={(value) => translate(makerKey(value), value)}
        onChange={(makers) => onChange({ ...criteria, makers: makers as ModMaker[] })}
      />

      <FacetFilter
        label={t('tracks.filter.distributors')}
        facets={facets?.distributors ?? []}
        selected={criteria.distributors ?? []}
        format={(value) => translate(distributorKey(value), value)}
        onChange={(distributors) => onChange({
          ...criteria, distributors: distributors as ModDistributor[],
        })}
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

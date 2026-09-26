import { useTranslation } from 'react-i18next';

import { firstOf } from './utils.ts';
import type { TrackGroup } from '../../../../shared/types';
import { DetailPanel, distributorNameKey, ProvenanceBadges } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { ProvenanceLinks } from '@/screens/content-sources';

interface TrackSourceProps {
  /**
   * The circuit.
   */
  circuit: TrackGroup;
}

/**
 * Where a circuit comes from - the base game, a pack or a mod team, and who
 * redistributes which of its layouts - with what the author says of it.
 */
export const TrackSource = ({ circuit }: TrackSourceProps) => {
  const { t } = useTranslation();
  const { formatNumber, formatYear } = useFormat();
  const { distributor } = circuit.provenance;

  const author = firstOf(circuit.layouts, (layout) => layout.author);
  const version = firstOf(circuit.layouts, (layout) => layout.version);
  const year = firstOf(circuit.layouts, (layout) => layout.year);
  const redistributed = circuit.layouts.filter((layout) => layout.provenance.distributor !== null).length;
  const tags = [...new Set(circuit.layouts.flatMap((layout) => layout.tags))];

  const facts = [
    author === null ? null : { label: t('tracks.detail.author'), value: author },
    version === null ? null : { label: t('tracks.detail.version'), value: version },
    year === null ? null : { label: t('tracks.detail.year'), value: formatYear(year) },
    distributor === null || circuit.layouts.length < 2 ? null : {
      label: t('tracks.detail.redistributed', { name: t(distributorNameKey(distributor)) }),
      value: t('tracks.detail.ofLayouts', {
        count: redistributed, shown: formatNumber(redistributed), total: formatNumber(circuit.layouts.length),
      }),
    },
  ].filter((fact) => fact !== null);

  return (
    <DetailPanel title={t('cars.detail.source')} className="flex flex-col gap-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <ProvenanceBadges provenance={circuit.provenance} trackId={circuit.id} />
        <span>{t(`cars.detail.from.${circuit.provenance.source}`)}</span>
      </div>

      {facts.length > 0 ? (
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5">
          {facts.map((fact) => [
            <dt key={`${fact.label}-label`} className="text-muted-foreground">{fact.label}</dt>,
            <dd key={`${fact.label}-value`} className="truncate text-right font-medium tabular-nums" title={fact.value}>
              {fact.value}
            </dd>,
          ])}
        </dl>
      ) : null}

      <ProvenanceLinks provenance={circuit.provenance} />

      <div className="flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
        <span>{t('cars.detail.folder')}</span>
        <code className="truncate font-mono" title={circuit.id}>{circuit.id}</code>
      </div>

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {/* The author's own words, an open set, so neutral. */}
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="font-normal text-muted-foreground">{tag}</Badge>
          ))}
        </div>
      ) : null}
    </DetailPanel>
  );
};

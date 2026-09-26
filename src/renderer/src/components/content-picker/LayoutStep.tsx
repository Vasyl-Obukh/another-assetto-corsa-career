import { ChevronLeftIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { LayoutTile } from './LayoutTile.tsx';
import type { Track, TrackGroup } from '../../../../shared/types';
import { useSettings } from '@/app';
import { ContentImage } from '@/components/content-image/index.ts';
import { NationFlag } from '@/components/NationFlag.tsx';
import { ProvenanceBadges } from '@/components/provenance-badges/index.ts';
import { Button } from '@/components/ui/button.tsx';
import { Card } from '@/components/ui/card.tsx';
import { useChampionships } from '@/hooks';
import { useFormat } from '@/i18n';
import { isListed } from '@/screens/championships';
import { layoutImageSources } from '@/screens/track-browser';
import {
  circuitChampionships, circuitPlace, layoutShortName, racingOn,
} from '@/screens/track-detail';

interface LayoutStepProps {
  /**
   * The circuit whose layouts are being chosen between.
   */
  group: TrackGroup;
  /**
   * The key of the layout already chosen, when there is one.
   */
  selectedKey?: string;
  /**
   * How many cars the race puts on the grid, when the caller knows.
   */
  gridSize?: number;
  /**
   * Called to go back to the list of circuits.
   */
  onBack: () => void;
  /**
   * Called with the layout that was picked.
   * @param layout The chosen layout
   */
  onPick: (layout: Track) => void;
}

export const LayoutStep = ({
  group, selectedKey, gridSize, onBack, onPick,
}: LayoutStepProps) => {
  const { t } = useTranslation();
  const { formatNation, formatNumber } = useFormat();
  const { settings } = useSettings();
  const { listings, loading } = useChampionships();

  const championships = useMemo(
    () => (loading ? null : circuitChampionships(group.id, listings.filter((listing) => isListed(listing, settings)))),
    [group.id, listings, loading, settings],
  );
  const { nation, place } = circuitPlace(group, formatNation, t);
  const [first] = group.layouts;
  const fits = gridSize === undefined ? 0 : group.layouts.filter(
    (layout) => layout.pitboxes === null || layout.pitboxes >= gridSize,
  ).length;
  const tile = (layout: Track) => (
    <LayoutTile
      key={layout.key}
      layout={layout}
      name={layoutShortName(layout, group.name)}
      racing={championships === null ? null : racingOn(championships, layout.layout)}
      gridSize={gridSize}
      selected={layout.key === selectedKey}
      onPick={() => onPick(layout)}
    />
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-3 px-6 pb-3">
        <Button type="button" size="sm" variant="ghost" onClick={onBack}>
          <ChevronLeftIcon />
          {t('race.pick.allTracks')}
        </Button>

        <Card className="min-w-0 flex-1 flex-row items-center gap-3 py-2 pr-3 pl-2">
          <span className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-md bg-muted">
            {first === undefined ? null : (
              <ContentImage sources={layoutImageSources(first)} alt="" className="object-cover" fallback={null} />
            )}
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate text-sm font-semibold">{group.name}</span>
            <span className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              {nation === null ? null : <NationFlag code={nation} />}
              {place === null ? null : <span>{place}</span>}
              <ProvenanceBadges provenance={group.provenance} trackId={group.id} />
            </span>
          </div>
          {gridSize === undefined ? null : (
            <div className="ml-auto flex shrink-0 flex-col items-end gap-0.5 text-xs text-muted-foreground">
              <span className="text-sm font-semibold text-foreground tabular-nums">
                {t('race.pick.grid', { count: gridSize })}
              </span>
              <span>
                {fits === group.layouts.length
                  ? t('race.pick.fitsAll')
                  : t('race.pick.fitsSome', { fits: formatNumber(fits), total: formatNumber(group.layouts.length) })}
              </span>
            </div>
          )}
        </Card>
      </div>

      {/* Vertical room for a tile's hover halo, which is a 22px bloom and gets
          clipped against the top of the scroller without it. */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-2 pb-6">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-4">
          {group.layouts.map(tile)}
        </div>
      </div>
    </div>
  );
};

import { MapPinIcon, MapPinOffIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { COORDINATE_PRECISION } from './constants.ts';
import { firstOf } from './utils.ts';
import type { Track, TrackGroup } from '../../../../shared/types';
import { nationOfCountry } from '../../../../shared/utils/nations';
import { DetailPanel, NationFlag } from '@/components';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';
import { coordinatesOf } from '@/screens/track-browser';

interface TrackLocationProps {
  /**
   * The circuit.
   */
  circuit: TrackGroup;
  /**
   * The layouts in view: the one the page is turned to, or all of them.
   */
  layouts: readonly Track[];
}

/**
 * Where a circuit is, and whether it says so precisely enough for Custom
 * Shaders Patch to light it for the real place.
 */
export const TrackLocation = ({ circuit, layouts }: TrackLocationProps) => {
  const { t } = useTranslation();
  const { formatNation, formatNumber } = useFormat();

  const nation = nationOfCountry(circuit.country);
  const city = firstOf(circuit.layouts, (layout) => layout.city);
  const at = coordinatesOf(layouts);
  const degrees = (value: number, positive: string, negative: string): string => t('tracks.detail.degrees', {
    value: formatNumber(Math.abs(Math.round(value * COORDINATE_PRECISION) / COORDINATE_PRECISION)),
    hemisphere: value < 0 ? negative : positive,
  });

  return (
    <DetailPanel title={t('tracks.detail.where')} className="flex flex-col gap-3 text-sm">
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5">
        <dt className="text-muted-foreground">{t('tracks.detail.country')}</dt>
        <dd className="flex items-center justify-end gap-1.5 text-right font-medium">
          {nation === null ? null : <NationFlag code={nation} />}
          <span className="truncate">{nation === null ? (circuit.country ?? t('common.dash')) : formatNation(nation)}</span>
        </dd>
        <dt className="text-muted-foreground">{t('tracks.detail.town')}</dt>
        <dd className="truncate text-right font-medium">{city ?? t('common.dash')}</dd>
      </dl>

      <div className="flex items-start gap-2.5">
        {/* Located is a state worth noticing, so it wears the success colour;
            unlocated is merely the default and stays neutral. */}
        <span className={cn(
          'grid size-8 shrink-0 place-items-center rounded-lg',
          at === null ? 'bg-secondary text-muted-foreground' : 'bg-success/15 text-success',
        )}
        >
          {at === null ? <MapPinOffIcon className="size-4" /> : <MapPinIcon className="size-4" />}
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="font-semibold tabular-nums">
            {at === null
              ? t('tracks.detail.unlocated')
              : t('tracks.detail.coordinates', {
                lat: degrees(at.lat, t('tracks.detail.north'), t('tracks.detail.south')),
                lon: degrees(at.lon, t('tracks.detail.east'), t('tracks.detail.west')),
              })}
          </span>
          <span className="text-xs text-muted-foreground">
            {at === null ? t('tracks.detail.unlocatedHint') : t('tracks.detail.locatedHint')}
          </span>
        </div>
      </div>
    </DetailPanel>
  );
};

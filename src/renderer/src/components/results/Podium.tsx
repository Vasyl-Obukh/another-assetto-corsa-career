import { CarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { DriverName } from './DriverName.tsx';
import { ResultCell } from './ResultCell.tsx';
import { formatGap, formatLapTime } from '../../../../shared/utils/lap-time';
import { carPictureSources, ContentImage } from '../content-image/index.ts';
import type { ClassifiedRow } from '@/lib/classification';

interface PodiumProps {
  /**
   * The session's rows, in finishing order; the first three are shown.
   */
  rows: readonly ClassifiedRow[];
  /**
   * What the player is called.
   */
  playerName: string;
}

/**
 * How many places a podium shows.
 */
const PLACES = 3;

/**
 * The top three of a session, each with the livery they raced in - the
 * picture a results page opens on.
 */
export const Podium = ({ rows, playerName }: PodiumProps) => {
  const { t } = useTranslation();

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {rows.slice(0, PLACES).map((row) => (
        <div key={row.key} className="relative overflow-hidden rounded-lg border bg-card">
          <div className="relative aspect-[16/7] bg-muted">
            <ContentImage
              sources={row.car ? carPictureSources(row.car.model, row.car.skin) : []}
              alt=""
              className="object-cover"
              fallback={(
                <div className="absolute inset-0 flex items-center justify-center">
                  <CarIcon className="size-6 text-muted-foreground/40" />
                </div>
              )}
            />
            <ResultCell position={row.position} scored prefixed className="absolute top-2 left-2" />
          </div>
          <div className="flex flex-col gap-0.5 px-3 py-2">
            <DriverName name={row.player ? playerName : row.driver} nation={row.nation} player={row.player} />
            <span className="flex justify-between gap-2 text-xs text-muted-foreground">
              <span className="truncate">{row.team}</span>
              <span className="tabular-nums">
                {row.total !== null ? formatLapTime(row.total) : null}
                {row.gap && 'ms' in row.gap
                  ? t('results.gap', { time: formatGap(row.gap.ms) })
                  : null}
              </span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

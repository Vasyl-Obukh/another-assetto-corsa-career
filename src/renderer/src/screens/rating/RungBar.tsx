import { useTranslation } from 'react-i18next';

import {
  dropRating, ratingFloor, rungWidth,
} from '../../../../shared/utils/career-eligibility';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';
import { tierAccent } from '@/screens/championships';

interface RungBarProps {
  /**
   * The rating.
   */
  rating: number;
  /**
   * The rung its discipline holds, 1 being the top.
   */
  tier: number;
}

/**
 * Where a rating stands on its rung: from where a season closing would drop it
 * - hatched - through the rung's floor to the next one up, filled in the
 * rung's metal as far as the rating reaches.
 */
export const RungBar = ({ rating, tier }: RungBarProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const floor = ratingFloor(tier);
  const drop = dropRating(tier);
  const low = drop ?? floor;
  const high = floor + rungWidth(tier);
  const at = (value: number): number => Math.max(0, Math.min(100, ((value - low) / (high - low)) * 100));
  const zone = at(floor);
  const reach = at(rating);

  return (
    <div className="relative h-7" role="img" aria-label={t('rating.bar', { rating: formatNumber(rating) })}>
      <div className="absolute inset-x-0 top-1 flex h-2 overflow-hidden rounded-full bg-muted">
        {drop === null ? null : (
          <span
            className="h-full bg-[repeating-linear-gradient(135deg,color-mix(in_oklch,var(--destructive)_30%,transparent)_0_4px,transparent_4px_7px)]"
            style={{ width: `${zone}%` }}
          />
        )}
        <span className={cn('h-full', tierAccent(tier))} style={{ width: `${Math.max(0, reach - zone)}%` }} />
      </div>
      <span
        className="absolute top-0 -ml-0.5 h-4 w-1 rounded-sm bg-foreground shadow-[0_0_0_2px_var(--card)]"
        style={{ left: `${reach}%` }}
      />
      <span className="absolute top-3.5 left-0 text-[0.65rem] text-muted-foreground tabular-nums">{formatNumber(low)}</span>
      {drop === null ? null : (
        <span
          className="absolute top-3.5 -translate-x-1/2 text-[0.65rem] text-muted-foreground tabular-nums"
          style={{ left: `${zone}%` }}
        >
          {formatNumber(floor)}
        </span>
      )}
      <span className="absolute top-3.5 right-0 text-[0.65rem] text-muted-foreground tabular-nums">{formatNumber(high)}</span>
    </div>
  );
};

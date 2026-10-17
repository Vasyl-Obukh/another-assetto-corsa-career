import { useTranslation } from 'react-i18next';

import { LEVEL_GRID } from './constants.ts';
import { LevelTilesSkeleton } from './LevelTilesSkeleton.tsx';
import type { LevelOption } from './types.ts';
import { ratingFloor } from '../../../../shared/utils/career-eligibility';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';
import { tierAccent } from '@/screens/championships';

interface LevelTilesProps {
  /**
   * The rungs on offer, the lowest first, or null while the library is read.
   */
  options: readonly LevelOption[] | null;
  /**
   * The rung picked.
   */
  value: number | null;
  /**
   * Called with the rung picked.
   */
  onChange: (tier: number) => void;
}

/**
 * The rung every discipline of a new career starts on, as a row of tiles: each
 * says how many championships it opens, names a few it races at, and the
 * rating it starts from.
 */
export const LevelTiles = ({ options, value, onChange }: LevelTilesProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();

  if (options === null) return <LevelTilesSkeleton />;

  return (
    <div role="radiogroup" aria-label={t('newCareer.level')} className={LEVEL_GRID}>
      {options.map((option) => {
        const on = option.tier === value;

        return (
          <button
            key={option.tier}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(option.tier)}
            className={cn(
              'flex flex-col gap-1.5 rounded-lg border bg-card p-2.5 text-left transition-colors hover:bg-accent',
              on && 'border-primary ring-3 ring-primary/20 hover:bg-card',
            )}
          >
            <span className="flex items-center gap-2">
              <Badge className={tierAccent(option.tier)}>{t('championships.tier', { tier: option.tier })}</Badge>
              <span className="text-xs text-muted-foreground">{t('newCareer.toEnter', { count: option.count })}</span>
            </span>
            <span className="text-xs leading-snug text-muted-foreground">{option.examples.join(', ')}</span>
            <span className="mt-auto pt-1 text-xs">
              {t('newCareer.ratingFrom', { rating: formatNumber(ratingFloor(option.tier)) })}
            </span>
          </button>
        );
      })}
    </div>
  );
};

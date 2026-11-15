import { useTranslation } from 'react-i18next';

import { LayoutRow } from './LayoutRow.tsx';
import { DISCIPLINES } from '../../../../shared/constants';
import type { RecommendedCircuit, RecommendedLayout, RecommendedTrackState } from '../../../../shared/types';
import { NationFlag } from '@/components/NationFlag.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import type { RecommendedTracks } from '@/hooks';
import { useFormat } from '@/i18n';
import { DISCIPLINE_ACCENT } from '@/lib/accents';
import type { CircuitUsage } from '@/lib/circuit-usage';
import { cn } from '@/lib/utils.ts';

interface RecommendedTrackCardProps {
  /**
   * The circuit.
   */
  circuit: RecommendedCircuit;
  /**
   * How much of the library races it, when anything does.
   */
  usage?: CircuitUsage;
  /**
   * Each layout's state by its id, or null while it is being read.
   */
  states: ReadonlyMap<string, RecommendedTrackState> | null;
  /**
   * The actions its rows take.
   */
  tracks: RecommendedTracks;
  /**
   * Called to choose a track for one of its layouts.
   * @param layout The layout
   */
  onChoose: (layout: RecommendedLayout) => void;
  /**
   * Whether its rows' menus may open a track's page; first-run setup says not.
   */
  trackPages?: boolean;
  /**
   * Classes for the card itself.
   */
  className?: string;
}

/**
 * A recommended circuit as the Tracks tab lists it, and as a round whose track
 * is not installed opens it: where it is, how many championships race it, and
 * a row per layout.
 */
export const RecommendedTrackCard = ({
  circuit, usage, states, tracks, onChoose, trackPages = true, className,
}: RecommendedTrackCardProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const championships = usage?.championships ?? 0;

  return (
    <article className={cn('rounded-xl border bg-card', className)}>
      <header className="flex flex-wrap items-center gap-x-3.5 gap-y-2 border-b px-4 py-3">
        <span className="flex min-w-0 items-center gap-2.5">
          <NationFlag code={circuit.nation} className="h-3.5 w-5" />
          <span className="font-semibold">{circuit.name}</span>
        </span>
        <span className="flex flex-wrap items-center gap-1">
          <span className="mr-1 text-xs text-muted-foreground">
            {t('recommendedTracks.championships', { count: championships, shown: formatNumber(championships) })}
          </span>
          {DISCIPLINES.flatMap((discipline) => {
            const count = usage?.disciplines.get(discipline) ?? 0;

            return count === 0 ? [] : [(
              <Badge key={discipline} className={DISCIPLINE_ACCENT[discipline]}>
                {t(`championships.discipline.${discipline}`)}
                <span className="tabular-nums opacity-80">{formatNumber(count)}</span>
              </Badge>
            )];
          })}
        </span>
      </header>

      <div>
        {circuit.layouts.map((layout) => (
          <LayoutRow
            key={layout.id}
            layout={layout}
            state={states?.get(layout.id) ?? null}
            tracks={tracks}
            onChoose={() => onChoose(layout)}
            trackPages={trackPages}
          />
        ))}
      </div>
    </article>
  );
};

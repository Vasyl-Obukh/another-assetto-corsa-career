import { PlusIcon } from 'lucide-react';
import { useState } from 'react';


import { PointsSparkline } from './PointsSparkline.tsx';
import { PointsSystemEditor } from './PointsSystemEditor.tsx';
import { nextPoints, racesPaying } from './utils.ts';
import type { Championship } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { Card } from '@/components/ui/card.tsx';
import { useKindTranslation } from '@/i18n';
import { cn } from '@/lib/utils.ts';

interface PointsSystemsProps {
  /**
   * The championship being edited.
   */
  series: Championship;
  /**
   * Whether an event is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Called with the championship whenever a system changes.
   * @param next The championship
   */
  onChange: (next: Championship) => void;
}

/**
 * The points systems down the side, each with a sketch of its curve, and the
 * one picked opened beside them.
 */
export const PointsSystems = ({ series, locked, onChange }: PointsSystemsProps) => {
  const { t } = useKindTranslation();
  const [picked, setPicked] = useState<string | null>(null);
  const systems = series.pointsSystems;
  const points = systems.find((one) => one.id === picked) ?? systems[0];

  return (
    <Card className="grid gap-0 overflow-hidden py-0 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <div className="flex gap-1.5 overflow-x-auto border-b bg-muted/30 p-2.5 lg:flex-col lg:overflow-visible lg:border-r lg:border-b-0">
        <span className="hidden px-1 text-xs text-muted-foreground lg:block">{t('editor.points.pick')}</span>
        {systems.map((one) => (
          <button
            key={one.id}
            type="button"
            aria-pressed={one.id === points?.id}
            className={cn(
              'flex min-w-56 shrink-0 items-center gap-2 rounded-lg border bg-card px-3 py-2 text-left lg:min-w-0 lg:shrink',
              one.id === points?.id ? 'border-primary text-primary ring-1 ring-primary' : 'text-muted-foreground hover:bg-accent/50',
            )}
            onClick={() => setPicked(one.id)}
          >
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <span className="truncate">{one.name}</span>
                {/* Filled: most races pay this one. */}
                {series.defaultPointsSystem === one.id ? <Badge className="px-1.5 py-0 text-[10px]">{t('championships.points.default')}</Badge> : null}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {t('editor.points.listLine', { races: racesPaying(series, one.id), count: one.positions.length })}
              </span>
            </span>
            <PointsSparkline values={one.positions} />
          </button>
        ))}
        <button
          type="button"
          className="flex min-w-48 shrink-0 items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60 lg:min-w-0"
          disabled={locked}
          onClick={() => {
            const next = nextPoints(series);
            onChange({ ...series, pointsSystems: [...systems, next] });
            setPicked(next.id);
          }}
        >
          <PlusIcon className="size-4" />
          {t('editor.points.add')}
        </button>
      </div>

      {points === undefined ? null : (
        <PointsSystemEditor
          key={points.id}
          series={series}
          points={points}
          locked={locked}
          onChange={onChange}
          onPick={setPicked}
        />
      )}
    </Card>
  );
};

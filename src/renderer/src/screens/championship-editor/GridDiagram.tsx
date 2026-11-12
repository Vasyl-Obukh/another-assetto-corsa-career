import { ArrowRightIcon } from 'lucide-react';

import type { DiagramCar } from './types.ts';
import { diagramField } from './utils.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { useKindTranslation } from '@/i18n';
import { classAccent } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface GridDiagramProps {
  /**
   * The event's classes, fastest first.
   */
  classes: readonly { id: string; name: string }[];
  /**
   * The name of the session the grid follows.
   */
  from: string;
  /**
   * Whether that session ran each class apart.
   */
  apart: boolean;
  /**
   * Whether the race mixes its classes on times.
   */
  mixed: boolean;
}

/**
 * What a race's grid comes to off an example field of the event's classes:
 * the session it follows, then the grid - beside ReverseDiagram, and drawn the
 * same way, each car in its class's colour and one with no time dashed.
 */
export const GridDiagram = ({
  classes, from, apart, mixed,
}: GridDiagramProps) => {
  const { t } = useKindTranslation();
  const field = diagramField(classes.length);
  const byClass = [...field].sort((left, right) => left.slot - right.slot || left.classPlace - right.classPlace);
  // Run apart, every car is known by its place in its own class.
  const labelOf = (car: DiagramCar): number => (apart ? car.classPlace : car.place);

  const line = (cars: readonly DiagramCar[], split: boolean) => (
    <span className="flex flex-wrap gap-0.5">
      {cars.map((car, at) => (
        <span
          key={`${car.slot}-${car.classPlace}`}
          className={cn(
            'grid h-5 min-w-4 place-items-center rounded-sm px-0.5 text-[10px] font-semibold tabular-nums',
            classAccent(car.slot).chip,
            !car.timed && 'outline-1 -outline-offset-1 outline-current outline-dashed',
            split && at > 0 && cars[at - 1]?.slot !== car.slot && 'ml-1.5',
          )}
        >
          {labelOf(car)}
        </span>
      ))}
    </span>
  );

  return (
    <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-32 shrink-0">
          {apart ? t('editor.sessions.byClassLine', { name: from }) : t('editor.sessions.finish', { name: from })}
        </span>
        {apart ? line(byClass, true) : line(field, false)}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex w-32 shrink-0 items-center gap-1">
          <ArrowRightIcon className="size-3.5" aria-hidden />
          {t('editor.sessions.gridBecomes')}
        </span>
        {line(mixed && !apart ? field : byClass, false)}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {classes.map((one, slot) => (
          <Badge key={one.id} className={classAccent(slot).chip}>{one.name}</Badge>
        ))}
        <span>{t('editor.sessions.noTime')}</span>
      </div>
    </div>
  );
};

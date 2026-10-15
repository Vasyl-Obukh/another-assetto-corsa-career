import { ArrowRightIcon } from 'lucide-react';

import { useKindTranslation } from '@/i18n';
import { SESSION_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

/**
 * How many places past the reversed ones the diagram draws, to show the rest
 * of the grid starting where it finished.
 */
const TAIL = 2;

interface ReverseDiagramProps {
  /**
   * The session whose order the grid is taken from, already named.
   */
  from: string;
  /**
   * How many of its front runners start in reverse.
   */
  reverse: number;
}

/**
 * What a reversed grid does, drawn: the order the earlier session finished in,
 * and the grid it makes, the reversed places in qualifying's colour.
 */
export const ReverseDiagram = ({ from, reverse }: ReverseDiagramProps) => {
  const { t } = useKindTranslation();
  const places = Array.from({ length: reverse + TAIL }, (_, at) => at + 1);
  const grid = places.map((place) => (place <= reverse ? reverse + 1 - place : place));

  /**
   * One line of places.
   * @param order The places, in grid order
   * @returns The line
   */
  const line = (order: readonly number[]) => (
    <span className="flex flex-wrap gap-0.5">
      {order.map((place, at) => (
        <span
          key={place}
          className={cn(
            'grid h-5 min-w-4 place-items-center rounded-sm px-0.5 text-[10px] tabular-nums',
            at < reverse ? SESSION_ACCENT.qualify : 'bg-muted text-muted-foreground',
          )}
        >
          {place}
        </span>
      ))}
    </span>
  );

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <span>{t('editor.sessions.finish', { name: from })}</span>
      {line(places)}
      <ArrowRightIcon className="size-3.5" aria-hidden />
      <span>{t('editor.sessions.gridBecomes')}</span>
      {line(grid)}
    </div>
  );
};

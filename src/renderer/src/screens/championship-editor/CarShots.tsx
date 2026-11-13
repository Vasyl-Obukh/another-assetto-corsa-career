import { CarIcon, PlusIcon, XIcon } from 'lucide-react';


import { ContentImage } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useCars, useRowDrag } from '@/hooks';
import { useKindTranslation } from '@/i18n';
import { cn } from '@/lib/utils.ts';
import { carImageSources } from '@/screens/car-browser';

interface CarShotsProps {
  /**
   * The cars to show, by folder ID.
   */
  cars: readonly string[];
  /**
   * Names a car the library could not resolve.
   * @param model The car folder ID
   * @returns What to show for it
   */
  nameOf: (model: string) => string;
  /**
   * Whether an event is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Called to take a car off, for a list the author wrote. Left out for a
   * catalogued grid, whose cars are the catalogue's to name.
   * @param model The car folder ID
   */
  onRemove?: (model: string) => void;
  /**
   * Called to add a car, for a list the author writes - which puts an "Add a
   * car" tile first, the size of a car.
   */
  onAdd?: () => void;
  /**
   * Called as a car is dragged to another place, for a list the author
   * writes - its order is the one the field draws from, so the first car is
   * the one most of the field races in.
   * @param from The index it was dragged from
   * @param to The index it was dropped at
   */
  onMove?: (from: number, to: number) => void;
}

/**
 * The cars a class fields, as pictures: what a class is driven in is easier
 * to check by eye than by folder name.
 */
export const CarShots = ({
  cars, nameOf, locked, onRemove, onAdd, onMove,
}: CarShotsProps) => {
  const { t } = useKindTranslation();
  const installed = useCars(cars);
  const drag = useRowDrag({
    count: cars.length,
    locked: locked || onMove === undefined,
    onMove: (from, to) => onMove?.(from, to),
  });
  const placeholder = (
    <div className="absolute inset-0 flex items-center justify-center">
      <CarIcon className="size-6 text-muted-foreground/40" />
    </div>
  );

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-2">
      {onAdd ? (
        <li className="flex">
          {/* Sized like a car's tile - a 16:9 picture over a caption line, both
              kept empty - so it is the same height alone as beside cars, with
              its one line centred over them. */}
          <button
            type="button"
            disabled={locked}
            onClick={onAdd}
            className="relative flex flex-1 flex-col overflow-hidden rounded-md border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span aria-hidden className="aspect-[16/9] w-full" />
            <span aria-hidden className="invisible px-2 py-1.5 text-xs">{t('editor.eligibility.addCar')}</span>
            <span className="absolute inset-0 flex items-center justify-center gap-1.5 text-sm font-medium">
              <PlusIcon className="size-4" />
              {t('editor.eligibility.addCar')}
            </span>
          </button>
        </li>
      ) : null}
      {cars.map((model, index) => {
        const car = installed.get(model);
        const edge = drag.edgeOf(index);

        return (
          <li
            key={model}
            draggable={drag.enabled}
            className={cn(
              'relative flex flex-col overflow-hidden rounded-md border bg-card',
              drag.enabled && 'cursor-grab',
              drag.dragging === index && 'opacity-50',
              edge === 'before' && 'shadow-[-3px_0_0_0_var(--color-primary)]',
              edge === 'after' && 'shadow-[3px_0_0_0_var(--color-primary)]',
            )}
            onDragStart={(event) => drag.onRowDragStart(index, event)}
            onDragOver={(event) => drag.onRowDragOver(index, event)}
            onDrop={(event) => drag.onRowDrop(index, event)}
            onDragEnd={drag.onRowDragEnd}
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
              {car === undefined ? placeholder : (
                <ContentImage sources={carImageSources(car)} alt={car.name} className="object-cover" fallback={placeholder} />
              )}
            </div>
            <div className="flex min-w-0 items-center gap-1 px-2 py-1.5">
              <span className="min-w-0 flex-1 truncate text-xs font-medium" title={car?.name ?? nameOf(model)}>
                {car?.name ?? nameOf(model)}
              </span>
              {car === undefined ? <Badge variant="destructive" className="shrink-0">{t('editor.eligibility.notInstalled')}</Badge> : null}
            </div>
            {onRemove === undefined ? null : (
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute top-1 right-1 size-6 opacity-90"
                aria-label={t('editor.eligibility.removeCar', { car: car?.name ?? nameOf(model) })}
                disabled={locked}
                onClick={() => onRemove(model)}
              >
                <XIcon />
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
};

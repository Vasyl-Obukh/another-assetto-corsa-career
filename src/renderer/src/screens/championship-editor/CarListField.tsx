import { PlusIcon, XIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button.tsx';
import { useRowDrag } from '@/hooks';
import { cn } from '@/lib/utils.ts';
import { moveTo } from '@/screens/race';

interface CarListFieldProps {
  /**
   * The cars named, in the order the field draws from them.
   */
  cars: readonly string[];
  /**
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Called with the whole list whenever it changes.
   * @param cars The cars to name
   */
  onChange: (cars: readonly string[]) => void;
  /**
   * Called to open the picker, which the eligibility field owns - one picker
   * per rule rather than one per row.
   */
  onAdd: () => void;
  /**
   * Names a car, for the ones a pick has resolved. Folder IDs otherwise.
   * @param car The car folder ID
   * @returns What to show for it
   */
  nameOf: (car: string) => string;
}

/**
 * The cars a one-make series names, listed in the order the field draws from
 * them.
 *
 * Order is data rather than presentation, which is why the chips drag: nextSkin
 * walks this list to fill a grid, so the first car named is the one most of the
 * field ends up in.
 */
export const CarListField = ({
  cars, locked, onChange, onAdd, nameOf,
}: CarListFieldProps) => {
  const { t } = useTranslation();
  const drag = useRowDrag({
    count: cars.length,
    locked,
    onMove: (from, to) => onChange(moveTo([...cars], from, to)),
  });

  return (
    <div className="flex flex-col gap-2">
      {cars.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('editor.eligibility.noCars')}</p>
      ) : null}

      <ol className="flex flex-wrap gap-1.5">
        {cars.map((car, index) => {
          const edge = drag.edgeOf(index);

          return (
            <li
              key={car}
              draggable={drag.enabled}
              className={cn(
                'flex cursor-grab items-center gap-1.5 rounded-md border bg-card py-0.5 pr-0.5 pl-2 text-sm',
                drag.dragging === index && 'opacity-50',
                edge === 'before' && 'shadow-[inset_2px_0_0_0_var(--color-primary)]',
                edge === 'after' && 'shadow-[inset_-2px_0_0_0_var(--color-primary)]',
              )}
              onDragStart={(event) => drag.onRowDragStart(index, event)}
              onDragOver={(event) => drag.onRowDragOver(index, event)}
              onDrop={(event) => drag.onRowDrop(index, event)}
              onDragEnd={drag.onRowDragEnd}
            >
              {/* The order is the one the field draws from, so it is shown. */}
              <span className="text-xs text-muted-foreground tabular-nums">{index + 1}</span>
              <span className="max-w-64 truncate">{nameOf(car)}</span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-6 text-muted-foreground"
                aria-label={t('editor.eligibility.removeCar', { car: nameOf(car) })}
                disabled={locked}
                onClick={() => onChange(cars.filter((one) => one !== car))}
              >
                <XIcon />
              </Button>
            </li>
          );
        })}
        <li>
          <Button type="button" size="sm" variant="outline" disabled={locked} onClick={onAdd}>
            <PlusIcon />
            {t('editor.eligibility.addCar')}
          </Button>
        </li>
      </ol>
    </div>
  );
};

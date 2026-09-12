import { PlusIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { RowActions } from './RowActions.tsx';
import { Button } from '@/components/ui/button.tsx';
import { moveAt } from '@/screens/race';

interface CarListFieldProps {
  /**
   * What makes these controls' ids unique on the page.
   */
  idPrefix: string;
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
 * Order is data rather than presentation, which is why these reorder: nextSkin
 * walks this list to fill a grid, so the first car named is the one most of the
 * field ends up in.
 */
export const CarListField = ({
  idPrefix, cars, locked, onChange, onAdd, nameOf,
}: CarListFieldProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2">
      {cars.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('editor.eligibility.noCars')}</p>
      ) : null}

      <ol className="flex flex-col">
        {cars.map((car, index) => (
          <li key={car} className="flex items-center gap-3 border-b py-1 last:border-b-0">
            <span className="w-6 shrink-0 text-right text-xs text-muted-foreground">
              {index + 1}
            </span>
            <span className="min-w-0 truncate text-sm">{nameOf(car)}</span>

            <RowActions
              label={nameOf(car)}
              first={index === 0}
              last={index === cars.length - 1}
              locked={locked}
              onMove={(by) => onChange(moveAt([...cars], index, by))}
              onRemove={() => onChange(cars.filter((one) => one !== car))}
            />
          </li>
        ))}
      </ol>

      <div>
        <Button
          id={`${idPrefix}-add-car`}
          type="button"
          size="sm"
          variant="outline"
          disabled={locked}
          onClick={onAdd}
        >
          <PlusIcon />
          {t('editor.eligibility.addCar')}
        </Button>
      </div>
    </div>
  );
};

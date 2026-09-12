import { PlusIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { BopForm } from './BopForm.tsx';
import { BopRow } from './BopRow.tsx';
import { ROW_LIST } from './constants.ts';
import type { BopEntry } from '../../../../shared/types';
import { Button } from '@/components/ui/button.tsx';
import type { RowEditState } from '@/hooks';

interface BopTableProps {
  /**
   * What makes these controls' ids unique on the page.
   */
  idPrefix: string;
  /**
   * Which scope the rows are edited under, since a class entry's table is its
   * own.
   */
  scope: string;
  /**
   * The adjustments as they stand, one per car.
   */
  bop: readonly BopEntry[];
  /**
   * Every car the class may field at some point in the season, in catalogue
   * order.
   *
   * The whole season rather than this round, because an adjustment is named
   * once and applies wherever that car runs.
   */
  fieldable: readonly string[];
  /**
   * Which row of the editor has its form open.
   */
  rows: RowEditState;
  /**
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Names a car, for the ones the library could resolve.
   * @param car The car folder ID
   * @returns What to show for it
   */
  nameOf: (car: string) => string;
  /**
   * Called with the whole table whenever any part of it changes.
   * @param next The adjustments to apply
   */
  onChange: (next: readonly BopEntry[]) => void;
}

/**
 * Ballast and intake restriction, per car, applied to the AI and the player
 * alike.
 */
export const BopTable = ({
  idPrefix, scope, bop, fieldable, rows, locked, nameOf, onChange,
}: BopTableProps) => {
  const { t } = useTranslation();

  const balanced = new Set(bop.map((one) => one.car));
  const unbalanced = fieldable.filter((car) => !balanced.has(car));
  const [first] = unbalanced;
  const adding = rows.adding(scope);

  return (
    <div className="flex flex-col gap-3">
      {/* Labelled, because the rows sit under the AI spread inside one section
          and "Lotus Evora GX, 90 kg" beside three AI numbers says nothing about
          which of the two it belongs to. */}
      <span className="text-xs text-muted-foreground">
        {t('championships.entries.bop')}
      </span>

      {bop.length === 0 && !adding ? (
        <p className="text-sm text-muted-foreground">{t('editor.bop.empty')}</p>
      ) : null}

      <div className={ROW_LIST}>
        {bop.map((one, index) => (rows.editing(scope, one.car) ? (
          <BopForm
            key={one.car}
            idPrefix={`${idPrefix}-bop-${index}`}
            bop={one}
            // Its own car first, then whatever is still unbalanced: a car cannot
            // be balanced twice, and the row it is on is the one holding it.
            offered={[one.car, ...unbalanced]}
            locked={locked}
            nameOf={nameOf}
            onConfirm={(next) => {
              // Matched on the car the row held rather than the one it now
              // names, because the car is itself an editable field.
              onChange(bop.map((row) => (row.car === one.car ? next : row)));
              rows.close();
            }}
            onCancel={rows.close}
          />
        ) : (
          <BopRow
            key={one.car}
            bop={one}
            index={index}
            locked={locked}
            editable={rows.editable}
            nameOf={nameOf}
            onEdit={() => rows.edit(scope, one.car)}
            onRemove={() => onChange(bop.filter((row) => row.car !== one.car))}
          />
        )))}

        {adding && first !== undefined ? (
          <BopForm
            idPrefix={`${idPrefix}-bop-new`}
            bop={{ car: first }}
            offered={unbalanced}
            locked={locked}
            nameOf={nameOf}
            onConfirm={(next) => {
              onChange([...bop, next]);
              rows.close();
            }}
            onCancel={rows.close}
          />
        ) : null}
      </div>

      {/* Nothing left to balance means no button rather than a disabled one:
          the row would have no car to name, and the whole table is optional. */}
      {first === undefined ? null : (
        <div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={locked || !rows.editable}
            onClick={() => rows.add(scope)}
          >
            <PlusIcon />
            {t('editor.bop.add')}
          </Button>
        </div>
      )}
    </div>
  );
};

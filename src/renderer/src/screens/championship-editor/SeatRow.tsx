import { useTranslation } from 'react-i18next';

import { ListRow } from './ListRow.tsx';
import type { Seat, Team } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import type { RowDrag } from '@/hooks';

interface SeatRowProps {
  /**
   * The seat the row stands for.
   */
  seat: Seat;
  /**
   * Where it sits in the class, counting from zero.
   */
  index: number;
  /**
   * How many seats the class has, which is what disables the last Move later.
   */
  count: number;
  /**
   * Every team the championship fields, for naming the one in this seat.
   */
  teams: readonly Team[];
  /**
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Whether the row may be acted on, which it may not while any row in the
   * editor has its form open.
   */
  editable: boolean;
  /**
   * The class's own drag state.
   */
  drag: RowDrag;
  /**
   * Names a car, for the ones the library could resolve.
   * @param model The car folder ID
   * @returns What to show for it
   */
  nameOf: (model: string) => string;
  /**
   * Called to open the seat's form.
   */
  onEdit: () => void;
  /**
   * Called to move the seat along the class.
   * @param by How far, positive being later
   */
  onMove: (by: number) => void;
  /**
   * Called to drop the seat from the class.
   */
  onRemove: () => void;
}

/**
 * One seat, read-only.
 *
 * Shows who is in the seat and what is unusual about it; the rest is behind
 * its form.
 */
export const SeatRow = ({
  seat, index, count, teams, locked, editable, drag, nameOf, onEdit, onMove, onRemove,
}: SeatRowProps) => {
  const { t } = useTranslation();

  const driver = seat.driver?.name;
  const unnamed = driver === undefined || driver === '';
  const team = teams.find((one) => one.id === seat.team);
  const model = seat.car?.model;
  // Either override is worth flagging, since a seat carrying one does not draw
  // the small spread every other driver does.
  const ai = seat.strength ?? seat.aggression;
  const position = t('editor.seats.number', { number: index + 1 });

  return (
    <ListRow
      index={index}
      number={index + 1}
      name={unnamed ? t('editor.seats.unnamed') : driver}
      muted={unnamed}
      // "Seat free" is what the row reads; "Seat 4" is what its menu is
      // announced as, because a screen reader needs to tell six free seats
      // apart and the number column it sits beside is not read out.
      label={unnamed ? position : driver}
      first={index === 0}
      last={index === count - 1}
      locked={locked}
      editable={editable}
      // The field size is the seat list's length, so a class with none is a
      // class nobody races in - which validateSeries refuses.
      removable={count > 1}
      drag={drag}
      onEdit={onEdit}
      onMove={onMove}
      onRemove={onRemove}
    >
      {/* Neutral on purpose: a car name and a flag, not one of a closed set. */}
      {model === undefined ? null : (
        <Badge variant="secondary" className="max-w-48 shrink-0 truncate">
          {seat.car?.skin === undefined
            ? nameOf(model)
            : t('editor.seats.pinned', { car: nameOf(model), skin: seat.car.skin })}
        </Badge>
      )}

      {ai === undefined ? null : (
        <Badge variant="outline" className="shrink-0 font-normal">
          {t('editor.seats.aiSet')}
        </Badge>
      )}

      <span className="w-10 shrink-0 text-right text-xs text-muted-foreground">
        {seat.driver?.nationCode ?? ''}
      </span>

      <span className="hidden w-48 shrink-0 truncate text-xs text-muted-foreground sm:block">
        {team?.name ?? ''}
      </span>
    </ListRow>
  );
};

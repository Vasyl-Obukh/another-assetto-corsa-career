import { useTranslation } from 'react-i18next';

import { RowList } from './RowList.tsx';
import { SeatForm } from './SeatForm.tsx';
import { SeatRow } from './SeatRow.tsx';
import { nextSeat, seatScope } from './utils.ts';
import type { Championship, ClassEntry, Seat, Team } from '../../../../shared/types';
import type { RowEditState } from '@/hooks';

interface SeatTableProps {
  /**
   * The championship, for the seat ids it already spends - a seat id is unique
   * across every class, not within one.
   */
  series: Championship;
  /**
   * The class entry whose seats these are.
   */
  entry: ClassEntry;
  /**
   * Every team the championship fields.
   */
  teams: readonly Team[];
  /**
   * Every car the class may field at some point in the season.
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
   * @param model The car folder ID
   * @returns What to show for it
   */
  nameOf: (model: string) => string;
  /**
   * Called with the whole class entry whenever its seats change.
   * @param next The entry to apply
   */
  onChange: (next: ClassEntry) => void;
}

/**
 * The grid of one class, one line per seat.
 *
 * Order matters: the player takes the last seat of the class they enter.
 */
export const SeatTable = ({
  series, entry, teams, fieldable, rows, locked, nameOf, onChange,
}: SeatTableProps) => {
  const { t } = useTranslation();
  const { seats } = entry;
  // Per entry, so two classes' seat lists do not answer for each other.
  const scope = seatScope(entry.id);

  /**
   * Puts the seats back on the class entry.
   * @param next The seats, in order
   */
  const apply = (next: readonly Seat[]): void => onChange({ ...entry, seats: next });

  return (
    <div className="flex flex-col gap-3">
      <RowList
        items={seats}
        scope={scope}
        rows={rows}
        locked={locked}
        idOf={(seat) => seat.id}
        addLabel={t('editor.seats.add')}
        onReorder={apply}
        renderRow={(seat, controls) => (
          <SeatRow
            {...controls}
            seat={seat}
            teams={teams}
            nameOf={nameOf}
            onRemove={() => apply(seats.filter((one) => one.id !== seat.id))}
          />
        )}
        renderForm={(seat) => (
          <SeatForm
            seat={seat ?? nextSeat(series, entry)}
            teams={teams}
            fieldable={fieldable}
            locked={locked}
            nameOf={nameOf}
            onConfirm={(next) => {
              apply(seat ? seats.map((one) => (one.id === seat.id ? next : one)) : [...seats, next]);
              rows.close();
            }}
            onCancel={rows.close}
          />
        )}
      />
    </div>
  );
};

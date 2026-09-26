import { GripVerticalIcon } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { NationPicker } from './NationPicker.tsx';
import { OffsetStepper } from './OffsetStepper.tsx';
import { RowActions } from './RowActions.tsx';
import { SeatCarField } from './SeatCarField.tsx';
import { offsetBounds } from './utils.ts';
import { DRIVER_AGGRESSION_SPREAD, DRIVER_STRENGTH_SPREAD } from '../../../../shared/constants';
import type {
  AiBase, Seat, SeatDriver, Team,
} from '../../../../shared/types';
import { aiFigure } from '../../../../shared/utils/ai-figure';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import type { RowDrag } from '@/hooks';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';
import { NOT_SET } from '@/screens/race';

interface SeatSheetRowProps {
  /**
   * What the class's drivers race at before a seat's own offset - the
   * player's difficulty with the championship's and the class's laid over it.
   */
  under: AiBase;
  /**
   * The seat the row edits.
   */
  seat: Seat;
  /**
   * Where it sits in the class, counting from zero.
   */
  index: number;
  /**
   * How many seats the class has.
   */
  count: number;
  /**
   * Every team the championship fields.
   */
  teams: readonly Team[];
  /**
   * Every car the class may field at some point in the season.
   */
  fieldable: readonly string[];
  /**
   * The nations the championship already uses, most used first, with how many
   * teams and seats use each.
   */
  used: readonly (readonly [string, number])[];
  /**
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * The class's drag state.
   */
  drag: RowDrag;
  /**
   * Names a car, for the ones the library could resolve.
   * @param model The car folder ID
   * @returns What to show for it
   */
  nameOf: (model: string) => string;
  /**
   * Called with the seat whenever any of it changes.
   * @param next The seat
   */
  onChange: (next: Seat) => void;
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
 * One seat as a line of the sheet, every field typed into where it stands.
 */
export const SeatSheetRow = ({
  under, seat, index, count, teams, fieldable, used, locked, drag, nameOf, onChange, onMove, onRemove,
}: SeatSheetRowProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const row = useRef<HTMLTableRowElement>(null);
  const edge = drag.edgeOf(index);
  const idPrefix = `seat-${seat.id}`;
  const name = seat.driver?.name ?? '';
  const label = name === '' ? t('editor.seats.number', { number: index + 1 }) : name;
  const strengthBounds = offsetBounds(under.strength);
  const aggressionBounds = offsetBounds(under.aggression);

  /**
   * What a seat races at: its own offset over the class where it states one,
   * and the band the season's draw spreads it across where it does not.
   * @param base What the class races at before the seat
   * @param offset The seat's own offset
   * @param spread How far the draw may move a seat either way
   * @returns The figure, or the band
   */
  const racesAt = (base: number, offset: number | undefined, spread: number): string => {
    if (offset !== undefined) return formatNumber(aiFigure(base, offset));

    return t('editor.seats.band', { low: formatNumber(aiFigure(base, -spread)), high: formatNumber(aiFigure(base, spread)) });
  };

  /**
   * Puts a change to the driver back on the seat.
   *
   * A driver with no name goes, nation and all: a file with an empty name
   * does not read, and a seat with no driver is filled with a generated one.
   * @param patch What changed
   */
  const driver = (patch: Partial<SeatDriver>): void => {
    const next: SeatDriver = { name: '', ...seat.driver, ...patch };
    onChange({ ...seat, driver: next.name === '' ? undefined : next });
  };

  return (
    <tr
      ref={row}
      className={cn(
        drag.dragging === index && 'opacity-50',
        edge === 'before' && 'shadow-[inset_0_2px_0_0_var(--color-primary)]',
        edge === 'after' && 'shadow-[inset_0_-2px_0_0_var(--color-primary)]',
      )}
      onDragOver={(event) => drag.onRowDragOver(index, event)}
      onDrop={(event) => drag.onRowDrop(index, event)}
    >
      <td className="w-8 py-0.5">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-8 text-muted-foreground"
          aria-label={t('editor.rows.drag', { label })}
          draggable={drag.enabled}
          disabled={locked || !drag.enabled}
          onDragStart={(event) => {
            if (row.current !== null) event.dataTransfer.setDragImage(row.current, 0, row.current.offsetHeight / 2);
            drag.onRowDragStart(index, event);
          }}
          onDragEnd={drag.onRowDragEnd}
        >
          <GripVerticalIcon />
        </Button>
      </td>

      <td className="w-7 py-0.5 pr-1 text-right text-xs text-muted-foreground tabular-nums">{index + 1}</td>

      <td className="min-w-40 py-0.5 pl-1">
        <Input
          id={`${idPrefix}-driver`}
          aria-label={t('editor.seats.driver')}
          className="h-8"
          placeholder={t('editor.seats.unnamed')}
          value={name}
          disabled={locked}
          onChange={(event) => driver({ name: event.target.value })}
        />
      </td>

      {/* Waits on a name: a driver with none is dropped, and would take the
          nation with it. With none of their own they race under the team's. */}
      <td className="w-24 py-0.5 pl-1">
        <NationPicker
          compact
          id={`${idPrefix}-nation`}
          label={t('editor.nation.nation')}
          value={seat.driver?.nationCode}
          fallback={teams.find((team) => team.id === seat.team)?.nationCode}
          used={used}
          disabled={locked || name === ''}
          onChange={(nationCode) => driver({ nationCode })}
        />
      </td>

      <td className="w-44 py-0.5 pl-1">
        <Select
          value={seat.team ?? NOT_SET}
          disabled={locked}
          onValueChange={(value) => onChange({ ...seat, team: value === NOT_SET ? undefined : value })}
        >
          <SelectTrigger id={`${idPrefix}-team`} aria-label={t('editor.seats.team')} className="h-8 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NOT_SET}>{t('editor.seats.noTeam')}</SelectItem>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>

      {/* A fixed width, since a table cell grows to its content: a long
          livery name is cut short rather than widening the whole column. */}
      <td className="py-0.5 pl-1 [&_button]:h-8">
        <div className="w-56">
          <SeatCarField
            bare
            id={`${idPrefix}-car`}
            car={seat.car}
            fieldable={fieldable}
            locked={locked}
            nameOf={nameOf}
            onChange={(car) => onChange({ ...seat, car })}
          />
        </div>
      </td>

      <td className="w-28 py-0.5 pl-1">
        <OffsetStepper
          id={`${idPrefix}-ai-strength`}
          label={t('editor.seats.strength')}
          value={seat.strength}
          min={strengthBounds.min}
          limit={strengthBounds.max}
          placeholder={t('editor.seats.drawn')}
          small
          disabled={locked}
          onChange={(strength) => onChange({ ...seat, strength })}
        />
      </td>
      <td className="w-16 py-0.5 pl-2 text-right text-sm font-semibold tabular-nums">
        {racesAt(under.strength, seat.strength, DRIVER_STRENGTH_SPREAD)}
      </td>

      <td className="w-28 py-0.5 pl-1">
        <OffsetStepper
          id={`${idPrefix}-ai-aggression`}
          label={t('editor.seats.aggression')}
          value={seat.aggression}
          min={aggressionBounds.min}
          limit={aggressionBounds.max}
          placeholder={t('editor.seats.drawn')}
          small
          disabled={locked}
          onChange={(aggression) => onChange({ ...seat, aggression })}
        />
      </td>
      <td className="w-16 py-0.5 pl-2 text-right text-sm font-semibold tabular-nums">
        {racesAt(under.aggression, seat.aggression, DRIVER_AGGRESSION_SPREAD)}
      </td>

      <td className="w-9 py-0.5">
        <RowActions
          label={label}
          first={index === 0}
          last={index === count - 1}
          locked={locked}
          // The field size is the seat list's length, so a class with none is
          // a class nobody races in - which validateSeries refuses.
          removable={count > 1}
          onMove={onMove}
          onRemove={onRemove}
        />
      </td>
    </tr>
  );
};

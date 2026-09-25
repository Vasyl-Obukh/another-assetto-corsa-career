import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { NationFields } from './NationFields.tsx';
import { NumberField } from './NumberField.tsx';
import { RowForm } from './RowForm.tsx';
import { SeatCarField } from './SeatCarField.tsx';
import { MAX_GRID_OFFSET } from '../../../../shared/constants';
import type { Seat, SeatDriver, Team } from '../../../../shared/types';
import { Input } from '@/components/ui/input.tsx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import { useFocusOnMount } from '@/hooks';
import { Field, NOT_SET } from '@/screens/race';

interface SeatFormProps {
  /**
   * The seat as it stands, which seeds the draft. Read once, on mount.
   */
  seat: Seat;
  /**
   * Every team the championship fields.
   */
  teams: readonly Team[];
  /**
   * Every car the class may field at some point in the season.
   */
  fieldable: readonly string[];
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
   * Called with the seat to commit.
   * @param next The seat as edited
   */
  onConfirm: (next: Seat) => void;
  /**
   * Called to leave the row as it was.
   */
  onCancel: () => void;
}

export const SeatForm = ({
  seat, teams, fieldable, locked, nameOf, onConfirm, onCancel,
}: SeatFormProps) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(seat);
  const name = useFocusOnMount<HTMLInputElement>();
  const idPrefix = `seat-${seat.id}`;
  const driver: SeatDriver = { name: '', ...draft.driver };

  /**
   * Puts a driver back on the seat.
   * @param next Who drives it now
   */
  const seated = (next: SeatDriver): void => setDraft({ ...draft, driver: next });

  return (
    <RowForm
      locked={locked}
      // A driver with no name is dropped on the way out, nationality and all: a
      // file with an empty name does not read, and a seat with no driver is
      // filled with a generated one.
      onConfirm={() => onConfirm({ ...draft, driver: driver.name === '' ? undefined : driver })}
      onCancel={onCancel}
    >
      <Field id={`${idPrefix}-driver`} label={t('editor.seats.driver')}>
        <Input
          id={`${idPrefix}-driver`}
          ref={name}
          value={driver.name}
          disabled={locked}
          onChange={(event) => seated({ ...driver, name: event.target.value })}
        />
      </Field>

      <Field id={`${idPrefix}-team`} label={t('editor.seats.team')}>
        <Select
          value={draft.team ?? NOT_SET}
          disabled={locked}
          onValueChange={(value) => setDraft({
            ...draft,
            team: value === NOT_SET ? undefined : value,
          })}
        >
          <SelectTrigger id={`${idPrefix}-team`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NOT_SET}>{t('editor.seats.noTeam')}</SelectItem>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <NationFields
        idPrefix={idPrefix}
        nation={driver}
        locked={locked}
        onChange={(nation) => seated({ ...driver, ...nation })}
      />

      <SeatCarField
        id={`${idPrefix}-car`}
        car={draft.car}
        fieldable={fieldable}
        locked={locked}
        nameOf={nameOf}
        onChange={(car) => setDraft({ ...draft, car })}
      />

      <div className="grid grid-cols-2 gap-4">
        <NumberField
          id={`${idPrefix}-ai-strength`}
          label={t('editor.seats.strength')}
          hint={t('editor.seats.strengthHint')}
          value={draft.strength}
          min={-MAX_GRID_OFFSET}
          max={MAX_GRID_OFFSET}
          placeholder={t('editor.seats.drawn')}
          disabled={locked}
          onChange={(strength) => setDraft({ ...draft, strength })}
        />

        <NumberField
          id={`${idPrefix}-ai-aggression`}
          label={t('editor.seats.aggression')}
          value={draft.aggression}
          min={-MAX_GRID_OFFSET}
          max={MAX_GRID_OFFSET}
          placeholder={t('editor.seats.drawn')}
          disabled={locked}
          onChange={(aggression) => setDraft({ ...draft, aggression })}
        />
      </div>
    </RowForm>
  );
};

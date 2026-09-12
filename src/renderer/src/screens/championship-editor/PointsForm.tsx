import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MIN_POINTS } from './constants.ts';
import { NumberField } from './NumberField.tsx';
import { PositionTable } from './PositionTable.tsx';
import { RowForm } from './RowForm.tsx';
import type { PointsSystem } from '../../../../shared/types';
import { Input } from '@/components/ui/input.tsx';
import { useFocusOnMount } from '@/hooks';
import { Field } from '@/screens/race';

interface PointsFormProps {
  /**
   * The system as it stands, which seeds the draft. Read once, on mount.
   */
  points: PointsSystem;
  /**
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Called with the system to commit.
   * @param next The system as edited
   */
  onConfirm: (next: PointsSystem) => void;
  /**
   * Called to leave the row as it was.
   */
  onCancel: () => void;
}

export const PointsForm = ({
  points, locked, onConfirm, onCancel,
}: PointsFormProps) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(points);
  const name = useFocusOnMount<HTMLInputElement>();
  const idPrefix = `points-${points.id}`;

  return (
    <RowForm locked={locked} onConfirm={() => onConfirm(draft)} onCancel={onCancel}>
      <Field id={`${idPrefix}-name`} label={t('editor.points.name')}>
        <Input
          id={`${idPrefix}-name`}
          ref={name}
          value={draft.name}
          disabled={locked}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
        />
      </Field>

      <NumberField
        id={`${idPrefix}-fastest-lap`}
        label={t('editor.points.fastestLap')}
        value={draft.fastestLap}
        min={MIN_POINTS}
        disabled={locked}
        onChange={(fastestLap) => setDraft({ ...draft, fastestLap })}
      />

      {/* Across every column: a ten-place table in one column would wrap three
          times as often. */}
      <div className="col-span-full">
        <PositionTable
          idPrefix={`${idPrefix}-position`}
          label={t('editor.points.table')}
          hint={t('editor.points.tableHint')}
          empty={t('editor.points.empty')}
          values={draft.positions}
          min={MIN_POINTS}
          disabled={locked}
          onChange={(positions) => setDraft({ ...draft, positions })}
        />
      </div>

      <div className="col-span-full">
        <PositionTable
          idPrefix={`${idPrefix}-qualifying`}
          label={t('editor.points.qualifying')}
          hint={t('editor.points.qualifyingHint')}
          empty={t('editor.points.qualifyingEmpty')}
          values={draft.qualifying ?? []}
          min={MIN_POINTS}
          disabled={locked}
          // An emptied table is left out of the file, the way an emptied prize
          // table is, rather than written as a bonus that pays nobody.
          onChange={(qualifying) => setDraft({
            ...draft,
            qualifying: qualifying.length === 0 ? undefined : qualifying,
          })}
        />
      </div>
    </RowForm>
  );
};

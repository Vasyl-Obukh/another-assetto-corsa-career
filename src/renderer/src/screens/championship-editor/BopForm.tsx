import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MIN_BOP } from './constants.ts';
import { NumberField } from './NumberField.tsx';
import { RowForm } from './RowForm.tsx';
import type { BopEntry } from '../../../../shared/types';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import { Field } from '@/screens/race';

interface BopFormProps {
  /**
   * What makes these controls' ids unique on the page.
   */
  idPrefix: string;
  /**
   * The adjustment as it stands, which seeds the draft. Read once, on mount.
   */
  bop: BopEntry;
  /**
   * The cars this row may name: its own, and whatever the class can field and
   * has not balanced already. A car cannot be balanced twice.
   */
  offered: readonly string[];
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
   * Called with the adjustment to commit.
   * @param next The adjustment as edited
   */
  onConfirm: (next: BopEntry) => void;
  /**
   * Called to leave the row as it was.
   */
  onCancel: () => void;
}

export const BopForm = ({
  idPrefix, bop, offered, locked, nameOf, onConfirm, onCancel,
}: BopFormProps) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(bop);

  return (
    <RowForm
      // A balance-of-performance row carries no grip and no number, so there is
      // no gutter for the fields to start after.
      inset={false}
      locked={locked}
      onConfirm={() => onConfirm(draft)}
      onCancel={onCancel}
    >
      <Field id={`${idPrefix}-car`} label={t('editor.bop.car')}>
        <Select
          value={draft.car}
          disabled={locked}
          onValueChange={(car) => setDraft({ ...draft, car })}
        >
          <SelectTrigger id={`${idPrefix}-car`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {offered.map((car) => (
              <SelectItem key={car} value={car}>{nameOf(car)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <NumberField
        id={`${idPrefix}-ballast`}
        label={t('editor.bop.ballast')}
        value={draft.ballast}
        min={MIN_BOP}
        disabled={locked}
        onChange={(ballast) => setDraft({ ...draft, ballast })}
      />

      <NumberField
        id={`${idPrefix}-restrictor`}
        label={t('editor.bop.restrictor')}
        value={draft.restrictor}
        min={MIN_BOP}
        disabled={locked}
        onChange={(restrictor) => setDraft({ ...draft, restrictor })}
      />
    </RowForm>
  );
};

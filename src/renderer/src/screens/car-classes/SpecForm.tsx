import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ClassId } from '../../../../shared/types';
import { useClasses } from '@/app';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import { useFocusOnMount } from '@/hooks';
import { Field } from '@/screens/race';

interface SpecFormProps {
  /**
   * What the spec is called now, or empty for a new one.
   */
  name: string;
  /**
   * The class it belongs to now, or the one the form was opened under.
   */
  carClass: ClassId;
  /**
   * Whether the save is running.
   */
  busy: boolean;
  /**
   * Called with the spec to save.
   * @param name The name as typed
   * @param carClass The class chosen
   */
  onSave: (name: string, carClass: ClassId) => void;
  /**
   * Called to close the form without saving.
   */
  onCancel: () => void;
}

export const SpecForm = ({
  name, carClass, busy, onSave, onCancel,
}: SpecFormProps) => {
  const { t } = useTranslation();
  const { catalogue } = useClasses();
  const [draft, setDraft] = useState(name);
  const [parent, setParent] = useState(carClass);
  const focus = useFocusOnMount<HTMLInputElement>();

  return (
    <form
      className="grid gap-3 sm:grid-cols-[1fr_16rem_auto] sm:items-end"
      onSubmit={(event) => { event.preventDefault(); onSave(draft, parent); }}
    >
      <Field id="spec-name" label={t('carClasses.specName')}>
        <Input
          id="spec-name"
          ref={focus}
          value={draft}
          disabled={busy}
          onChange={(event) => setDraft(event.target.value)}
        />
      </Field>

      {/* Moving a spec is allowed, since a class of the user's own is often
          made after the spec it should have held. */}
      <Field id="spec-class" label={t('carClasses.specClass')}>
        <Select value={parent} disabled={busy} onValueChange={setParent}>
          <SelectTrigger id="spec-class" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {catalogue.classes.map((one) => (
              <SelectItem key={one.id} value={one.id}>{one.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <div className="flex justify-end gap-2">
        <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={onCancel}>
          {t('confirm.cancel')}
        </Button>
        <Button type="submit" size="sm" disabled={busy || draft.trim() === ''}>
          {t('carClasses.save')}
        </Button>
      </div>
    </form>
  );
};

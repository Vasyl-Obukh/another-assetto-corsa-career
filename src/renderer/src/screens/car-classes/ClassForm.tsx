import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { useFocusOnMount } from '@/hooks';
import { Field } from '@/screens/race';

interface ClassFormProps {
  /**
   * What the class is called now, or empty for a new one.
   */
  name: string;
  /**
   * Whether the save is running.
   */
  busy: boolean;
  /**
   * Called with the name to save.
   * @param name The name as typed
   */
  onSave: (name: string) => void;
  /**
   * Called to close the form without saving.
   */
  onCancel: () => void;
}

export const ClassForm = ({
  name, busy, onSave, onCancel,
}: ClassFormProps) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(name);
  const focus = useFocusOnMount<HTMLInputElement>();

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
      onSubmit={(event) => { event.preventDefault(); onSave(draft); }}
    >
      <div className="min-w-0 flex-1">
        <Field id="class-name" label={t('carClasses.className')}>
          <Input
            id="class-name"
            ref={focus}
            value={draft}
            disabled={busy}
            onChange={(event) => setDraft(event.target.value)}
          />
        </Field>
      </div>

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

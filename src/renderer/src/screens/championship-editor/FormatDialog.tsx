import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ConfirmActions } from './ConfirmActions.tsx';
import type { WeekendFormat } from '../../../../shared/types';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Input } from '@/components/ui/input.tsx';
import { useFocusOnMount } from '@/hooks';
import { Field } from '@/screens/race';

interface FormatDialogProps {
  /**
   * The format as it stands, which seeds the draft. Read once, on mount.
   */
  format: WeekendFormat;
  /**
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Called with the format to commit - added, or put back in place.
   * @param next The format as edited
   */
  onConfirm: (next: WeekendFormat) => void;
  /**
   * Called to leave the championship as it was.
   */
  onCancel: () => void;
}

/**
 * What a weekend format is called.
 *
 * A dialog for the reason a class entry's is one: a format is a panel holding a
 * list of its own. Mounted only while open, so the draft seeds on every open,
 * and Confirm commits into the draft rather than the file.
 */
export const FormatDialog = ({
  format, locked, onConfirm, onCancel,
}: FormatDialogProps) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(format);
  const name = useFocusOnMount<HTMLInputElement>();
  const id = `format-${format.id}-name`;

  return (
    <Dialog open onOpenChange={(next) => { if (!next) onCancel(); }}>
      <DialogContent className="sm:max-w-md">
        {/* A form so Enter confirms, with no key handler anywhere. */}
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            onConfirm(draft);
          }}
        >
          <DialogHeader>
            <DialogTitle>{draft.name}</DialogTitle>
            <DialogDescription>{t('editor.formats.formHint')}</DialogDescription>
          </DialogHeader>

          <Field id={id} label={t('editor.formats.name')}>
            <Input
              id={id}
              ref={name}
              value={draft.name}
              disabled={locked}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            />
          </Field>

          <ConfirmActions locked={locked} onCancel={onCancel} />
        </form>
      </DialogContent>
    </Dialog>
  );
};

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ConfirmActions } from './ConfirmActions.tsx';
import { DISCIPLINES, MIN_TIER } from './constants.ts';
import { NumberField } from './NumberField.tsx';
import type { ClassEntry, Discipline } from '../../../../shared/types';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Input } from '@/components/ui/input.tsx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import { useFocusOnMount } from '@/hooks';
import { disciplineKey } from '@/screens/championships';
import { Field } from '@/screens/race';

interface EntryDialogProps {
  /**
   * The class entry as it stands, which seeds the draft. Read once, on mount.
   */
  entry: ClassEntry;
  /**
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Called with the class entry to commit - added, or put back in place.
   * @param next The entry as edited
   */
  onConfirm: (next: ClassEntry) => void;
  /**
   * Called to leave the championship as it was.
   */
  onCancel: () => void;
}

/**
 * What a class entry is called and where on the ladder it sits.
 *
 * A dialog where every other row is edited in place, because a class row is a
 * *container* for three sections of its own and a form expanded inside it would
 * nest one disclosure in another.
 *
 * Confirm commits into the draft and nothing else: the page's own Save is still
 * the only thing that reaches the file.
 */
export const EntryDialog = ({
  entry, locked, onConfirm, onCancel,
}: EntryDialogProps) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(entry);
  const name = useFocusOnMount<HTMLInputElement>();
  const idPrefix = `entry-${entry.id}`;

  return (
    <Dialog open onOpenChange={(next) => { if (!next) onCancel(); }}>
      <DialogContent className="max-w-2xl sm:max-w-2xl">
        {/* A form for the reason the inline rows are one: Enter confirms, with
            no key handler anywhere. */}
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            onConfirm(draft);
          }}
        >
          <DialogHeader>
            <DialogTitle>{draft.name}</DialogTitle>
            <DialogDescription>{t('editor.entries.formHint')}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id={`${idPrefix}-name`} label={t('editor.entries.name')}>
              <Input
                id={`${idPrefix}-name`}
                ref={name}
                value={draft.name}
                disabled={locked}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              />
            </Field>

            <Field id={`${idPrefix}-discipline`} label={t('editor.entries.discipline')}>
              <Select
                value={draft.ladder.discipline}
                disabled={locked}
                onValueChange={(value) => setDraft({
                  ...draft,
                  ladder: { ...draft.ladder, discipline: value as Discipline },
                })}
              >
                <SelectTrigger id={`${idPrefix}-discipline`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DISCIPLINES.map((discipline) => (
                    <SelectItem key={discipline} value={discipline}>
                      {t(disciplineKey(discipline))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <NumberField
              id={`${idPrefix}-tier`}
              label={t('editor.entries.tier')}
              hint={t('editor.entries.tierHint')}
              value={draft.ladder.tier}
              min={MIN_TIER}
              disabled={locked}
              onChange={(tier) => setDraft({
                // A tier is required, so an emptied box keeps the number rather
                // than writing a championship with no rung at all.
                ...draft,
                ladder: { ...draft.ladder, tier: tier ?? draft.ladder.tier },
              })}
            />
          </div>

          <ConfirmActions locked={locked} onCancel={onCancel} />
        </form>
      </DialogContent>
    </Dialog>
  );
};

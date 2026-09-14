import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ClassForm } from './ClassForm.tsx';
import { ClassItem } from './ClassItem.tsx';
import { NEW_CLASS } from './constants.ts';
import type { ClassDeleting, ClassEditing } from './types.ts';
import { useClasses } from '@/app';
import { ConfirmDialog, ErrorCard, ScreenBody } from '@/components';
import { Accordion } from '@/components/ui/accordion.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import { useClassCommands } from '@/hooks';
import type { DisplayableError } from '@/lib/ipc';

export const CarClasses = () => {
  const { t } = useTranslation();
  const { catalogue } = useClasses();
  const commands = useClassCommands();

  const [editing, setEditing] = useState<ClassEditing | null>(null);
  const [deleting, setDeleting] = useState<ClassDeleting | null>(null);
  // Collapsed to start with: the app ships over twenty classes and a hundred
  // specs, and one opened at a time is how anyone reads them.
  const [open, setOpen] = useState<string[]>([]);
  // Which class the last command came from, so a refusal is shown where it was
  // asked for rather than at the top of a long page.
  const [errorAt, setErrorAt] = useState<string | null>(null);

  const { dismissError } = commands;

  /**
   * Opens a form, or closes the open one, forgetting any earlier refusal.
   * @param next The form to open, or null
   */
  const edit = (next: ClassEditing | null): void => {
    dismissError();
    setEditing(next);
  };

  /**
   * Runs a command from one class, closing the form when it succeeds.
   * @param from The class it came from
   * @param command The command, answering null or false when it failed
   * @returns What the command answered
   */
  const runFrom = async <T, >(from: string, command: () => Promise<T>): Promise<T> => {
    setErrorAt(from);
    const answer = await command();
    if (answer !== null && answer !== false) setEditing(null);

    return answer;
  };

  /**
   * The refusal to show beside one class.
   * @param from The class
   * @returns The last command's error, when that command came from this class
   */
  const errorFor = (from: string): DisplayableError | null => (errorAt === from ? commands.error : null);
  const newClassError = errorFor(NEW_CLASS);

  return (
    <ScreenBody className="flex flex-col gap-4 py-6" backToTop>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-2xl text-sm text-muted-foreground">{t('carClasses.subtitle')}</p>

        <Button
          variant="outline"
          disabled={editing !== null || commands.busy}
          onClick={() => edit({ kind: 'class' })}
        >
          <PlusIcon />
          {t('carClasses.addClass')}
        </Button>
      </div>

      {editing?.kind === 'class' && editing.id === undefined ? (
        <Card>
          <CardContent className="flex flex-col gap-3">
            {newClassError !== null ? <ErrorCard error={newClassError} onDismiss={dismissError} /> : null}
            <ClassForm
              name=""
              busy={commands.busy}
              onSave={(name) => {
                void runFrom(NEW_CLASS, () => commands.saveClass({ name })).then((id) => {
                  // Opened straight away, since the next thing a new class wants
                  // is a spec in it.
                  if (id !== null) setOpen((current) => [...current, id]);
                });
              }}
              onCancel={() => edit(null)}
            />
          </CardContent>
        </Card>
      ) : null}

      <Card className="py-2">
        <CardContent>
          <Accordion type="multiple" value={open} onValueChange={setOpen}>
            {catalogue.classes.map((carClass) => (
              <ClassItem
                key={carClass.id}
                carClass={carClass}
                editing={editing}
                error={errorFor(carClass.id)}
                busy={commands.busy}
                onEditing={edit}
                onRename={(name) => {
                  void runFrom(carClass.id, () => commands.saveClass({ id: carClass.id, name }));
                }}
                onSaveSpec={(name, parent) => {
                  const id = editing?.kind === 'spec' ? editing.id : undefined;
                  void runFrom(carClass.id, () => commands.saveSpec({ id, name, class: parent })).then((saved) => {
                    // A spec moved to another class is followed there.
                    if (saved === null) return;
                    setOpen((current) => (current.includes(parent) ? current : [...current, parent]));
                  });
                }}
                onDelete={(kind, id, name) => {
                  dismissError();
                  setDeleting({
                    kind, id, name, carClass: carClass.id,
                  });
                }}
                onDismissError={dismissError}
              />
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleting !== null}
        title={t('carClasses.deleteTitle', { name: deleting?.name ?? '' })}
        description={deleting?.kind === 'class' ? t('carClasses.deleteClassBody') : t('carClasses.deleteSpecBody')}
        confirmLabel={t('carClasses.deleteConfirm')}
        busy={commands.busy}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting === null) return;
          const { kind, id, carClass } = deleting;
          setErrorAt(carClass);
          void (kind === 'class' ? commands.deleteClass(id) : commands.deleteSpec(id))
            .finally(() => setDeleting(null));
        }}
      />
    </ScreenBody>
  );
};

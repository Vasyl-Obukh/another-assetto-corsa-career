import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ClassItem } from './ClassItem.tsx';
import { MoveSpecDialog } from './MoveSpecDialog.tsx';
import { SpecSheet } from './SpecSheet.tsx';
import type { ClassDeleting, ClassDialog, SpecSheetTarget } from './types.ts';
import { useClasses } from '@/app';
import { ConfirmDialog, NameDialog, ScreenBody } from '@/components';
import { Accordion } from '@/components/ui/accordion.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import { useClassCommands } from '@/hooks';

export const CarClasses = () => {
  const { t } = useTranslation();
  const { catalogue } = useClasses();
  const commands = useClassCommands();

  const [dialog, setDialog] = useState<ClassDialog | null>(null);
  const [deleting, setDeleting] = useState<ClassDeleting | null>(null);
  const [sheet, setSheet] = useState<SpecSheetTarget | null>(null);
  // Collapsed to start with: the app ships over twenty classes and a hundred
  // specs, and one opened at a time is how anyone reads them.
  const [open, setOpen] = useState<string[]>([]);
  // Which class a refused delete came from. A dialog shows its own refusals,
  // but the delete confirmation closes, so its refusal is shown on the class.
  const [errorAt, setErrorAt] = useState<string | null>(null);

  const { dismissError } = commands;

  /**
   * Opens a class, keeping any already open.
   * @param id The class
   */
  const reveal = (id: string): void => {
    setOpen((current) => (current.includes(id) ? current : [...current, id]));
  };

  /**
   * Opens a dialog, or closes the open one, forgetting any earlier refusal.
   * @param next The dialog to open, or null
   */
  const show = (next: ClassDialog | null): void => {
    dismissError();
    setErrorAt(null);
    setDialog(next);
  };

  /**
   * Runs a command from the open dialog, closing it and opening the class it
   * left the user looking at once it succeeds. A refusal keeps it open.
   * @param command The command, answering null when it failed
   * @param landing The class to open, given the id the command answered
   */
  const runDialog = (command: () => Promise<string | null>, landing: (id: string) => string): void => {
    void command().then((id) => {
      if (id === null) return;
      setDialog(null);
      reveal(landing(id));
    });
  };

  /**
   * The open dialog.
   * @param current What is open
   * @returns The dialog
   */
  const renderDialog = (current: ClassDialog) => {
    const shared = {
      busy: commands.busy,
      error: commands.error,
      onDismissError: dismissError,
      open: true,
      onClose: () => show(null),
    };

    switch (current.kind) {
      case 'add-class':
        return (
          <NameDialog
            {...shared}
            title={t('carClasses.addClassTitle')}
            label={t('carClasses.className')}
            initial=""
            confirmLabel={t('carClasses.add')}
            // Opened straight away, since the next thing a new class wants is a
            // spec in it.
            onConfirm={(name) => runDialog(() => commands.saveClass({ name }), (id) => id)}
          />
        );
      case 'rename-class':
        return (
          <NameDialog
            {...shared}
            title={t('carClasses.renameTitle', { name: current.carClass.name })}
            label={t('carClasses.className')}
            initial={current.carClass.name}
            confirmLabel={t('carClasses.save')}
            onConfirm={(name) => runDialog(() => commands.saveClass({ id: current.carClass.id, name }), (id) => id)}
          />
        );
      case 'copy-class':
        return (
          <NameDialog
            {...shared}
            title={t('carClasses.copyTitle', { name: current.carClass.name })}
            description={t('carClasses.copyHint')}
            label={t('carClasses.className')}
            initial={t('carClasses.copyName', { name: current.carClass.name })}
            confirmLabel={t('carClasses.copy')}
            onConfirm={(name) => runDialog(() => commands.copyClass(current.carClass.id, name), (id) => id)}
          />
        );
      default:
        return (
          <MoveSpecDialog
            {...shared}
            spec={current.spec}
            // A spec moved to another class is followed there.
            onConfirm={(target) => runDialog(
              () => commands.saveSpec({ id: current.spec.id, name: current.spec.name, class: target }),
              () => target,
            )}
          />
        );
    }
  };

  return (
    <ScreenBody className="flex flex-col gap-4 py-6" backToTop>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-2xl text-sm text-muted-foreground">{t('carClasses.subtitle')}</p>

        <Button variant="outline" disabled={commands.busy} onClick={() => show({ kind: 'add-class' })}>
          <PlusIcon />
          {t('carClasses.addClass')}
        </Button>
      </div>

      <Card className="py-2">
        <CardContent>
          <Accordion type="multiple" value={open} onValueChange={setOpen}>
            {catalogue.classes.map((carClass) => (
              <ClassItem
                key={carClass.id}
                carClass={carClass}
                error={errorAt === carClass.id ? commands.error : null}
                busy={commands.busy}
                onDialog={show}
                onDelete={(next) => {
                  dismissError();
                  setDeleting(next);
                }}
                onSheet={(target) => {
                  dismissError();
                  setSheet(target);
                }}
                onDismissError={dismissError}
              />
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Mounted only while open, so each one starts from what it was opened on
          rather than from whatever the last one was left holding. */}
      {dialog !== null ? renderDialog(dialog) : null}

      {sheet !== null ? (
        <SpecSheet
          target={sheet}
          onClose={(saved) => {
            setSheet(null);
            if (saved !== null) reveal(saved);
          }}
        />
      ) : null}

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
            .then((deleted) => {
              // A class can be deleted from its heading while closed, so a
              // refusal opens it to be seen.
              if (!deleted) reveal(carClass);
            })
            .finally(() => setDeleting(null));
        }}
      />
    </ScreenBody>
  );
};

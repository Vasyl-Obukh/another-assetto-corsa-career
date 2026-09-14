import {
  PencilIcon, PlusIcon, Trash2Icon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ClassForm } from './ClassForm.tsx';
import { SpecForm } from './SpecForm.tsx';
import { SpecRow } from './SpecRow.tsx';
import type { ClassEditing } from './types.ts';
import type { CatalogueClass, ClassId } from '../../../../shared/types';
import { useClasses } from '@/app';
import { ErrorCard } from '@/components';
import {
  AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { ORIGIN_ACCENT } from '@/lib/accents';
import type { DisplayableError } from '@/lib/ipc';

interface ClassItemProps {
  /**
   * The class the item shows.
   */
  carClass: CatalogueClass;
  /**
   * Which form the page has open, if any.
   */
  editing: ClassEditing | null;
  /**
   * Why the last command from this class failed, or null.
   */
  error: DisplayableError | null;
  /**
   * Whether a command is running.
   */
  busy: boolean;
  /**
   * Opens a form, or closes the open one.
   * @param next The form to open, or null
   */
  onEditing: (next: ClassEditing | null) => void;
  /**
   * Renames the class.
   * @param name The name as typed
   */
  onRename: (name: string) => void;
  /**
   * Adds a spec, or saves the one being edited.
   * @param name The name as typed
   * @param carClass The class chosen for it
   */
  onSaveSpec: (name: string, carClass: ClassId) => void;
  /**
   * Asks whether to delete a class or a spec.
   * @param kind Which of the two
   * @param id Its id
   * @param name What it is called
   */
  onDelete: (kind: 'class' | 'spec', id: string, name: string) => void;
  /**
   * Clears the error.
   */
  onDismissError: () => void;
}

export const ClassItem = ({
  carClass, editing, error, busy, onEditing, onRename, onSaveSpec, onDelete, onDismissError,
}: ClassItemProps) => {
  const { t } = useTranslation();
  const { catalogue } = useClasses();
  const mine = carClass.origin === 'user';
  const idle = editing === null && !busy;

  const renaming = editing?.kind === 'class' && editing.id === carClass.id;
  const adding = editing?.kind === 'spec' && editing.id === undefined && editing.carClass === carClass.id;

  return (
    <AccordionItem value={carClass.id}>
      <AccordionTrigger className="items-center py-3 hover:no-underline">
        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <span className="truncate text-base">{carClass.name}</span>
          {/* Whose it is, in the hue that already means "yours"; the app's own
              wear nothing, as a shipped championship does. */}
          {mine ? <Badge className={ORIGIN_ACCENT.user}>{t('championships.origin.user')}</Badge> : null}
          {/* Neutral on purpose: a count of specs is not one of a closed set. */}
          <Badge variant="outline">{t('carClasses.specs', { count: carClass.specs.length })}</Badge>
        </span>
      </AccordionTrigger>

      <AccordionContent className="flex flex-col gap-3">
        {error !== null ? <ErrorCard error={error} onDismiss={onDismissError} /> : null}

        {/* The app's own are referenced by the championships it ships, so only
            a class of the user's may be renamed or deleted. Here rather than on
            the heading, which is itself a button. */}
        {mine && renaming ? (
          <ClassForm
            name={carClass.name}
            busy={busy}
            onSave={onRename}
            onCancel={() => onEditing(null)}
          />
        ) : null}

        {mine && !renaming ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              disabled={!idle}
              onClick={() => onEditing({ kind: 'class', id: carClass.id })}
            >
              <PencilIcon />
              {t('carClasses.rename')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={!idle}
              onClick={() => onDelete('class', carClass.id, carClass.name)}
            >
              <Trash2Icon />
              {t('carClasses.deleteClass')}
            </Button>
          </div>
        ) : null}

        {carClass.specs.length === 0 ? (
          <p className="text-muted-foreground">{t('carClasses.noSpecs')}</p>
        ) : (
          <ul className="flex flex-col">
            {carClass.specs.map((id) => {
              const spec = catalogue.specById.get(id);
              if (!spec) return null;

              return editing?.kind === 'spec' && editing.id === id ? (
                <li key={id} className="border-b py-2 last:border-b-0">
                  <SpecForm
                    name={spec.name}
                    carClass={spec.class}
                    busy={busy}
                    onSave={onSaveSpec}
                    onCancel={() => onEditing(null)}
                  />
                </li>
              ) : (
                <SpecRow
                  key={id}
                  spec={spec}
                  editable={idle}
                  onEdit={() => onEditing({ kind: 'spec', id, carClass: carClass.id })}
                  onDelete={() => onDelete('spec', id, spec.name)}
                />
              );
            })}
          </ul>
        )}

        {/* On every class, the app's own included: a grid the app does not
            know is most often another era of a family it does. */}
        {adding ? (
          <SpecForm
            name=""
            carClass={carClass.id}
            busy={busy}
            onSave={onSaveSpec}
            onCancel={() => onEditing(null)}
          />
        ) : (
          <div>
            <Button
              size="sm"
              variant="outline"
              disabled={!idle}
              onClick={() => onEditing({ kind: 'spec', carClass: carClass.id })}
            >
              <PlusIcon />
              {t('carClasses.addSpec')}
            </Button>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

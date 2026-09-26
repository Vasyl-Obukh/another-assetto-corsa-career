import { PlusIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ClassMenu } from './ClassMenu.tsx';
import { SpecCard } from './SpecCard.tsx';
import type { ClassDeleting, ClassDialog, SpecSheetTarget } from './types.ts';
import type { CatalogueClass } from '../../../../shared/types';
import { useClasses } from '@/app';
import { ErrorCard } from '@/components';
import {
  AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { ORIGIN_ACCENT } from '@/lib/accents';
import type { DisplayableError } from '@/lib/ipc';

interface ClassItemProps {
  /**
   * The class the item shows.
   */
  carClass: CatalogueClass;
  /**
   * Why the last delete from this class failed, or null.
   */
  error: DisplayableError | null;
  /**
   * Whether a command is running.
   */
  busy: boolean;
  /**
   * Opens a dialog.
   * @param dialog The dialog to open
   */
  onDialog: (dialog: ClassDialog) => void;
  /**
   * Asks whether to delete a class or a spec.
   * @param deleting What to delete
   */
  onDelete: (deleting: ClassDeleting) => void;
  /**
   * Opens the spec sheet, on a spec or on a new one in this class.
   * @param target What the sheet edits
   */
  onSheet: (target: SpecSheetTarget) => void;
  /**
   * Clears the error.
   */
  onDismissError: () => void;
}

export const ClassItem = ({
  carClass, error, busy, onDialog, onDelete, onSheet, onDismissError,
}: ClassItemProps) => {
  const { t } = useTranslation();
  const { catalogue } = useClasses();
  const mine = carClass.origin === 'user';

  return (
    <AccordionItem value={carClass.id}>
      {/* The menu sits beside the heading rather than in it, since the heading
          is itself a button. */}
      <div className="flex items-center gap-2 [&>h3]:min-w-0 [&>h3]:flex-1">
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

        <ClassMenu
          carClass={carClass}
          busy={busy}
          onRename={() => onDialog({ kind: 'rename-class', carClass })}
          onCopy={() => onDialog({ kind: 'copy-class', carClass })}
          onDelete={() => onDelete({
            kind: 'class', id: carClass.id, name: carClass.name, carClass: carClass.id,
          })}
        />
      </div>

      {/* A hair of room inside the accordion, which clips its content, so a
          card's hover outline at the edge is not cut off. */}
      <AccordionContent className="flex flex-col gap-3 px-0.5 pt-0.5">
        {error !== null ? <ErrorCard error={error} onDismiss={onDismissError} /> : null}

        <ul className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-3">
          {carClass.specs.map((id) => {
            const spec = catalogue.specById.get(id);
            if (!spec) return null;

            return (
              <SpecCard
                key={id}
                spec={spec}
                busy={busy}
                onOpen={() => onSheet({ kind: 'edit', spec })}
                onMove={() => onDialog({ kind: 'move-spec', spec })}
                onDelete={() => onDelete({
                  kind: 'spec', id, name: spec.name, carClass: carClass.id,
                })}
              />
            );
          })}

          {/* On every class, the app's own included: a grid the app does not
              know is most often another era of a family it does. */}
          <li>
            <button
              type="button"
              disabled={busy}
              className="flex size-full min-h-20 items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-primary/50 hover:bg-accent hover:text-accent-foreground disabled:opacity-50 [&_svg]:size-4"
              onClick={() => onSheet({ kind: 'new', carClass })}
            >
              <PlusIcon />
              {t('carClasses.addSpec')}
            </button>
          </li>
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
};

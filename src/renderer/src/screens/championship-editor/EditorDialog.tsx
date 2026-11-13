import type { ReactNode } from 'react';


import { Button } from '@/components/ui/button.tsx';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';
import { useKindTranslation } from '@/i18n';
import { cn } from '@/lib/utils.ts';

interface EditorDialogProps {
  /**
   * The heading, already translated.
   */
  title: string;
  /**
   * A small line above the heading, such as which round of how many.
   */
  caption?: string;
  /**
   * A line under the heading, already translated.
   */
  description?: string;
  /**
   * Tabs under the heading, for a dialog that edits more than fits one page.
   */
  tabs?: ReactNode;
  /**
   * A quiet line at the start of the footer.
   */
  note?: string;
  /**
   * What the confirming button says, already translated.
   */
  confirmLabel: string;
  /**
   * Whether nothing may change just now.
   */
  locked: boolean;
  /**
   * Whether what is drafted is not yet enough to keep, which holds the
   * confirming button back - the note says why.
   */
  incomplete?: boolean;
  /**
   * The dialog's width, as classes.
   */
  className?: string;
  /**
   * Called to keep what was edited.
   */
  onConfirm: () => void;
  /**
   * Called to throw it away.
   */
  onCancel: () => void;
  /**
   * The dialog's fields.
   */
  children: ReactNode;
}

/**
 * The frame every editor dialog shares: a heading, optional tabs, a body that
 * scrolls on its own, and a footer that stays in reach. A form, so Enter keeps
 * what was typed.
 */
export const EditorDialog = ({
  title, caption, description, tabs, note, confirmLabel, locked, incomplete = false, className,
  onConfirm, onCancel, children,
}: EditorDialogProps) => {
  const { t } = useKindTranslation();

  return (
    <Dialog open onOpenChange={(next) => { if (!next) onCancel(); }}>
      {/* Pinned from the top rather than centred, so a body that grows or
          shrinks moves only the bottom edge and nothing above it shifts. */}
      <DialogContent
        className={cn(
          'top-[max(1rem,6dvh)] flex max-h-[calc(100dvh_-_max(1rem,6dvh)_-_1rem)] translate-y-0 flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl',
          className,
        )}
      >
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            // Enter submits too, so the button being disabled is not enough.
            if (!incomplete) onConfirm();
          }}
        >
          <DialogHeader className={cn('gap-1 px-5 pt-5 pb-3 text-left sm:px-6', tabs && 'pb-0')}>
            {caption ? <span className="text-xs text-muted-foreground">{caption}</span> : null}
            <DialogTitle className="text-lg">{title}</DialogTitle>
            {description ? <DialogDescription>{description}</DialogDescription> : null}
            {tabs}
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto border-t px-5 py-4 sm:px-6">
            {children}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 border-t px-5 py-3 sm:px-6">
            {note ? <span className="mr-auto text-xs text-muted-foreground">{note}</span> : null}
            <Button type="button" variant="outline" onClick={onCancel}>{t('confirm.cancel')}</Button>
            <Button type="submit" disabled={locked || incomplete}>{confirmLabel}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

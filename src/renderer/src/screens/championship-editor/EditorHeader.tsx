
import type { SeriesOrigin } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useKindTranslation } from '@/i18n';
import { OriginBadge } from '@/screens/championships';

interface EditorHeaderProps {
  /**
   * What the library calls it, or what a championship being started is called
   * until it is written. Deliberately not the draft's name, which would rename
   * the heading as it is typed.
   */
  name: string;
  /**
   * Where it came from, or null for one that has never been written.
   */
  origin: SeriesOrigin | null;
  /**
   * Whether the draft differs from what is on disk.
   */
  dirty: boolean;
  /**
   * Whether a save is in flight.
   */
  busy: boolean;
  /**
   * Whether no row of the editor has its form open.
   *
   * Both buttons wait on it. Saving would write a document the open row's
   * typing is not in yet, and discarding while a form is open is a second way
   * of doing what that form's own Cancel does.
   */
  editable: boolean;
  /**
   * Called to write the draft.
   */
  onSave: () => void;
  /**
   * Called to throw the draft away.
   */
  onDiscard: () => void;
}

export const EditorHeader = ({
  name, origin, dirty, busy, editable, onSave, onDiscard,
}: EditorHeaderProps) => {
  const { t } = useKindTranslation();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <h1 className="text-2xl font-semibold">{name}</h1>
      {origin === null ? null : <OriginBadge origin={origin} />}

      {dirty ? <Badge variant="warning">{t('editor.unsaved')}</Badge> : null}

      <div className="ml-auto flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={!dirty || busy || !editable}
          onClick={onDiscard}
        >
          {t('editor.discard')}
        </Button>
        <Button type="button" disabled={!dirty || busy || !editable} onClick={onSave}>
          {t('editor.save')}
        </Button>
      </div>
    </div>
  );
};

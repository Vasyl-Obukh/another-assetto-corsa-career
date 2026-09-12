import { useTranslation } from 'react-i18next';

import type { SeriesListing } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { OriginBadge } from '@/screens/championships';

interface EditorHeaderProps {
  /**
   * The championship as the library holds it, for its name and where it came
   * from. The draft's name would rename the heading as it is typed.
   */
  listing: SeriesListing;
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
  listing, dirty, busy, editable, onSave, onDiscard,
}: EditorHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <h1 className="text-2xl font-semibold">{listing.series.name}</h1>
      <OriginBadge origin={listing.origin} />

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

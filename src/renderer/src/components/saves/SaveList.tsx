import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SAVE_ROWS } from './constants.ts';
import { SaveRow } from './SaveRow.tsx';
import { SaveRowSkeleton } from './SaveRowSkeleton.tsx';
import type { SaveFilter } from './types.ts';
import { filterSaves } from './utils.ts';
import type { SaveSummary } from '../../../../shared/types';
import { ConfirmDialog } from '@/components/ConfirmDialog.tsx';
import { Loading } from '@/components/Loading.tsx';
import { NameDialog } from '@/components/NameDialog.tsx';
import { slots } from '@/lib/slots.ts';

interface SaveListProps {
  /**
   * The career's saves, newest first, or null while they are read.
   */
  saves: readonly SaveSummary[] | null;
  /**
   * Which of them to show.
   */
  filter: SaveFilter;
  /**
   * Whether a command is in flight, which holds the buttons.
   */
  busy: boolean;
  /**
   * Loads a save.
   * @param save The save
   */
  onLoad(save: SaveSummary): void;
  /**
   * Renames a named save.
   * @param save The save's id
   * @param name Its new name
   * @returns Whether it was renamed
   */
  onRename(save: string, name: string): Promise<boolean>;
  /**
   * Deletes a named save.
   * @param save The save's id
   * @returns Whether it was deleted
   */
  onDelete(save: string): Promise<boolean>;
}

/**
 * A career's saves as rows, with the dialogs a named save's menu opens.
 */
export const SaveList = ({
  saves, filter, busy, onLoad, onRename, onDelete,
}: SaveListProps) => {
  const { t } = useTranslation();
  const [renaming, setRenaming] = useState<SaveSummary | null>(null);
  const [deleting, setDeleting] = useState<SaveSummary | null>(null);

  if (saves === null) return <Loading>{slots(SAVE_ROWS).map((at) => <SaveRowSkeleton key={at} />)}</Loading>;

  const shown = filterSaves(saves, filter);

  return (
    <>
      {shown.length === 0 ? (
        <p className="px-2 py-3 text-sm text-muted-foreground">
          {saves.length === 0 ? t('saves.empty') : t('saves.emptyKind')}
        </p>
      ) : (
        <div className="flex flex-col">
          {shown.map((one) => (
            <SaveRow
              key={one.id}
              save={one}
              busy={busy}
              onLoad={() => onLoad(one)}
              onRename={() => setRenaming(one)}
              onDelete={() => setDeleting(one)}
            />
          ))}
        </div>
      )}

      <NameDialog
        key={renaming?.id ?? 'none'}
        open={renaming !== null}
        title={t('saves.renameTitle')}
        label={t('saves.name')}
        initial={renaming?.name ?? ''}
        confirmLabel={t('saves.rename')}
        busy={busy}
        onConfirm={(name) => {
          if (renaming) void onRename(renaming.id, name).then((done) => { if (done) setRenaming(null); });
        }}
        onClose={() => setRenaming(null)}
      />

      <ConfirmDialog
        open={deleting !== null}
        title={t('saves.deleteTitle', { name: deleting?.name ?? '' })}
        description={t('saves.deleteHint')}
        confirmLabel={t('saves.delete')}
        busy={busy}
        onConfirm={() => {
          if (deleting) void onDelete(deleting.id);
          setDeleting(null);
        }}
        onClose={() => setDeleting(null)}
      />
    </>
  );
};

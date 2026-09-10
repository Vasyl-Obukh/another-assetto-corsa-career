import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ChampionshipMenu } from './ChampionshipMenu.tsx';
import { DuplicateDialog } from './DuplicateDialog.tsx';
import type { SeriesListing } from '../../../../shared/types';
import { ConfirmDialog } from '@/components';
import type { SeriesCommandsState } from '@/hooks';
import { path } from '@/lib/routes';

/**
 * Which destructive action is being confirmed, or null for none.
 */
type Confirming = 'revert' | 'delete' | null;

interface ChampionshipActionsProps {
  /**
   * The championship the menu acts on.
   */
  listing: SeriesListing;
  /**
   * The screen's commands. Passed in rather than held here, so a list of
   * twenty cards shares one busy flag and one error surface instead of twenty.
   */
  commands: SeriesCommandsState;
  /**
   * What to do once the championship has been deleted, or undefined to stay
   * where we are. The list needs nothing - the row simply goes - while the
   * detail page has to leave, since it is looking at something that is gone.
   */
  onDeleted?: () => void;
}

export const ChampionshipActions = ({ listing, commands, onDeleted }: ChampionshipActionsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [duplicating, setDuplicating] = useState(false);
  const [confirming, setConfirming] = useState<Confirming>(null);

  const { id, name } = listing.series;

  return (
    <>
      <ChampionshipMenu
        listing={listing}
        busy={commands.busy}
        onCustomise={() => {
          // Navigating afterwards even from the detail page, where it is a
          // no-op: customising is the first half of "edit this championship",
          // and the editor is where it will land once there is one.
          commands.customise(id).then((ok) => {
            if (ok) navigate(path.championship({ id }));
          }, () => undefined);
        }}
        onDuplicate={() => setDuplicating(true)}
        onRevert={() => setConfirming('revert')}
        onDelete={() => setConfirming('delete')}
        onExport={() => { void commands.exportSeries(id); }}
      />

      <DuplicateDialog
        key={duplicating ? 'duplicating' : 'idle'}
        open={duplicating}
        name={name}
        busy={commands.busy}
        onClose={() => setDuplicating(false)}
        onConfirm={(copyName) => {
          commands.duplicate(id, copyName).then((copied) => {
            setDuplicating(false);
            // Off the returned id rather than off the pushed library: the push
            // lands while this call is still resolving, so local state may not
            // hold the copy yet.
            if (copied) navigate(path.championship({ id: copied }));
          }, () => setDuplicating(false));
        }}
      />

      <ConfirmDialog
        open={confirming !== null}
        busy={commands.busy}
        title={t(`championships.${confirming ?? 'revert'}.title`)}
        description={t(`championships.${confirming ?? 'revert'}.body`, { name })}
        confirmLabel={t(`championships.actions.${confirming ?? 'revert'}`)}
        onClose={() => setConfirming(null)}
        onConfirm={() => {
          const wasDelete = confirming === 'delete';
          const done = wasDelete ? commands.remove(id) : commands.revert(id);

          done.then((ok) => {
            setConfirming(null);
            // Reverting leaves the shipped championship at the same id, so
            // there is still something to look at. Deleting does not.
            if (ok && wasDelete) onDeleted?.();
          }, () => setConfirming(null));
        }}
      />
    </>
  );
};

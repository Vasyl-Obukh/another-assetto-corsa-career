import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ChampionshipMenu } from './ChampionshipMenu.tsx';
import type { SeriesListing } from '../../../../shared/types';
import { ConfirmDialog, NameDialog } from '@/components';
import type { SeriesCommandsState } from '@/hooks';
import { path } from '@/lib/routes';
import type { ReturnState } from '@/lib/routes';

/**
 * Which destructive action is being confirmed, or null for none.
 */
type Confirming = 'revert' | 'delete' | null;

interface ChampionshipActionsProps {
  /**
   * The championship the actions act on.
   */
  listing: SeriesListing;
  /**
   * The screen's commands. Passed in rather than held here, so a list of
   * twenty cards shares one busy flag and one error surface instead of twenty.
   */
  commands: SeriesCommandsState;
  /**
   * Whether everything that manages the library is offered, or only Edit.
   */
  manage: boolean;
  /**
   * Where the editor's Back leads, which is wherever Edit was chosen.
   */
  returnTo: ReturnState;
  /**
   * Called once the championship has been deleted, for a screen that was
   * showing it and now has nothing to show.
   */
  onDeleted?: () => void;
}

export const ChampionshipActions = ({
  listing, commands, manage, returnTo, onDeleted,
}: ChampionshipActionsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [copying, setCopying] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [confirming, setConfirming] = useState<Confirming>(null);

  const { id, name } = listing.series;
  const editor = path.championshipEdit({ id });

  /**
   * Opens the editor, taking a copy of a shipped championship on the way.
   *
   * The copy keeps the id, so one navigation covers both ways in.
   */
  const customise = (): void => {
    commands.customise(id).then((ok) => {
      setCopying(false);
      if (ok) navigate(editor, { state: returnTo });
    }, () => setCopying(false));
  };

  return (
    <>
      <ChampionshipMenu
        listing={listing}
        manage={manage}
        busy={commands.busy}
        onEdit={() => {
          // The app's own is replaced until it is reverted, which is worth
          // saying out loud rather than discovering.
          if (listing.origin === 'shipped') setCopying(true);
          else navigate(editor, { state: returnTo });
        }}
        onDuplicate={() => setDuplicating(true)}
        onRevert={() => setConfirming('revert')}
        onDelete={() => setConfirming('delete')}
        onExport={() => { void commands.exportSeries(id); }}
      />

      <ConfirmDialog
        open={copying}
        busy={commands.busy}
        title={t('championships.edit.title', { name })}
        description={t('championships.edit.body')}
        confirmLabel={t('championships.edit.confirm')}
        onClose={() => setCopying(false)}
        onConfirm={customise}
      />

      {/* The name and nothing else. The copy's id is main's to pick, because
          only main knows what is taken - a file that failed to parse owns its
          name without appearing in the library at all. */}
      <NameDialog
        key={duplicating ? 'duplicating' : 'idle'}
        open={duplicating}
        title={t('championships.duplicate.title', { name })}
        description={t('championships.duplicate.hint')}
        label={t('championships.duplicate.name')}
        initial={t('championships.actions.copyName', { name })}
        confirmLabel={t('championships.duplicate.confirm')}
        busy={commands.busy}
        onClose={() => setDuplicating(false)}
        onConfirm={(copyName) => {
          commands.duplicate(id, copyName).then((copied) => {
            setDuplicating(false);
            // Off the returned id rather than off the pushed library: the push
            // lands while this call is still resolving, so local state may not
            // hold the copy yet.
            if (copied) navigate(path.championshipEdit({ id: copied }));
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
          const deleting = confirming === 'delete';
          const done = deleting ? commands.remove(id) : commands.revert(id);
          // A card simply goes, or comes back as the app's own. A page showing
          // a deleted championship is told, since it has nothing left to show.
          done.then((ok) => {
            setConfirming(null);
            if (ok && deleting) onDeleted?.();
          }, () => setConfirming(null));
        }}
      />
    </>
  );
};

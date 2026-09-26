import {
  CopyIcon, ExternalLinkIcon, PencilIcon, PowerIcon, PowerOffIcon, Trash2Icon, UndoIcon, UploadIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { MenuParts } from './types.ts';
import type { SeriesListing } from '../../../../shared/types';

interface ChampionshipMenuItemsProps {
  /**
   * The championship the items act on.
   */
  listing: SeriesListing;
  /**
   * Whether the items include everything that manages the library, or only Edit.
   */
  manage: boolean;
  /**
   * The menu primitive's own item and separator.
   */
  parts: MenuParts;
  /**
   * Called to open the championship's page. Left out where that page is
   * already open.
   */
  onOpen?: () => void;
  /**
   * Whether the championship is switched on, for the item that flips it. Left
   * out where there is no switch to flip.
   */
  active?: boolean;
  /**
   * Called to switch the championship on or off.
   */
  onToggle?: () => void;
  /**
   * Called to open the championship in the editor.
   */
  onEdit: () => void;
  /**
   * Called to copy this championship into a separate one.
   */
  onDuplicate: () => void;
  /**
   * Called to delete the user's version and put the app's own back.
   */
  onRevert: () => void;
  /**
   * Called to delete one of the user's own championships.
   */
  onDelete: () => void;
  /**
   * Called to write this championship out as a file.
   */
  onExport: () => void;
}

export const ChampionshipMenuItems = ({
  listing, manage, parts: { Item, Separator }, onOpen, active, onToggle,
  onEdit, onDuplicate, onRevert, onDelete, onExport,
}: ChampionshipMenuItemsProps) => {
  const { t } = useTranslation();
  const { origin } = listing;
  // A weekend under way is raced against the championship as it stood, so it
  // may not change until that weekend is over.
  const locked = listing.weekend !== null;

  return (
    <>
      {onOpen ? (
        <Item onSelect={onOpen}>
          <ExternalLinkIcon />
          {t('championships.actions.open')}
        </Item>
      ) : null}

      <Item
        disabled={locked}
        title={locked ? t('championships.actions.editLocked') : undefined}
        onSelect={onEdit}
      >
        <PencilIcon />
        {t('championships.actions.edit')}
      </Item>

      {manage ? (
        <>
          <Item onSelect={onDuplicate}>
            <CopyIcon />
            {t('championships.actions.duplicate')}
          </Item>

          <Item onSelect={onExport}>
            <UploadIcon />
            {t('championships.actions.export')}
          </Item>

          {onToggle ? (
            <>
              <Separator />
              <Item onSelect={onToggle}>
                {active ? <PowerOffIcon /> : <PowerIcon />}
                {active ? t('championships.actions.switchOff') : t('championships.actions.switchOn')}
              </Item>
            </>
          ) : null}

          {origin === 'shipped' ? null : <Separator />}

          {origin === 'adjusted' ? (
            <Item variant="destructive" onSelect={onRevert}>
              <UndoIcon />
              {t('championships.actions.revert')}
            </Item>
          ) : null}

          {origin === 'user' ? (
            <Item variant="destructive" onSelect={onDelete}>
              <Trash2Icon />
              {t('championships.actions.delete')}
            </Item>
          ) : null}
        </>
      ) : null}
    </>
  );
};

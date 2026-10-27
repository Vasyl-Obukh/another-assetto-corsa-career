import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { STATE_FOLDERS } from './constants.ts';
import { useFormat } from '@/i18n';
import { CONTRACT_DOT, HISTORIC_DOT } from '@/lib/accents';
import { inFolder } from '@/lib/inbox';
import type { InboxFolder, InboxItem } from '@/lib/inbox';
import { cn } from '@/lib/utils.ts';

interface InboxRailProps {
  /**
   * Every mail of the career.
   */
  items: readonly InboxItem[];
  /**
   * The folder listed.
   */
  folder: InboxFolder;
  /**
   * Called with the folder picked.
   * @param folder The folder
   */
  onFolder: (folder: InboxFolder) => void;
}

// The folders down the inbox's left: by where mail stands, then by kind, each
// with how much it holds. Unread is counted in the primary and Awaiting reply
// in the amber its chips wear, since those two are what asks for the player.
export const InboxRail = ({ items, folder, onFolder }: InboxRailProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const count = (one: InboxFolder): number => items.filter((item) => inFolder(item, one)).length;
  const pill: Partial<Record<InboxFolder, string>> = {
    unread: 'bg-primary text-primary-foreground',
    awaiting: 'bg-mail-awaiting text-mail-awaiting-foreground',
  };

  const row = (id: InboxFolder, icon: ReactNode, label: string) => {
    const held = count(id);

    return (
      <button
        key={id}
        type="button"
        onClick={() => onFolder(id)}
        aria-pressed={folder === id}
        className={cn(
          'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-accent',
          folder === id && 'bg-primary/10 font-medium text-primary hover:bg-primary/15',
        )}
      >
        {icon}
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <span className={cn(
          'rounded-full px-1.5 text-xs tabular-nums',
          held > 0 && pill[id] ? cn('font-semibold', pill[id]) : 'text-muted-foreground',
        )}
        >
          {formatNumber(held)}
        </span>
      </button>
    );
  };

  return (
    <nav aria-label={t('inbox.title')} className="flex flex-col gap-0.5">
      {STATE_FOLDERS.map(({ id, icon: Icon }) => row(id, <Icon className="size-4 shrink-0" />, t(`inbox.folder.${id}`)))}
      <span className="px-2.5 pt-4 pb-1 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
        {t('inbox.kinds')}
      </span>
      {row('invitation', <span className={cn('mx-1 size-2 shrink-0 rounded-full', HISTORIC_DOT)} />, t('inbox.kind.invitation'))}
      {row('offer', <span className={cn('mx-1 size-2 shrink-0 rounded-full', CONTRACT_DOT)} />, t('inbox.kind.offer'))}
    </nav>
  );
};

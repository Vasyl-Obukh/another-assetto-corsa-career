import { InboxIcon, MailWarningIcon, ReplyIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { InboxFolder } from '@/lib/inbox';

/**
 * The search parameter the inbox keeps its folder in.
 */
export const FOLDER_PARAM = 'folder';

/**
 * The search parameter the inbox keeps its page in, counting from one.
 */
export const PAGE_PARAM = 'page';

/**
 * The folders down the rail that list mail by where it stands, in order, each
 * with its icon. The kinds of mail follow under a heading of their own.
 */
export const STATE_FOLDERS: readonly { id: Exclude<InboxFolder, 'invitation' | 'offer' | 'notice'>; icon: LucideIcon }[] = [
  { id: 'all', icon: InboxIcon },
  { id: 'unread', icon: MailWarningIcon },
  { id: 'awaiting', icon: ReplyIcon },
];

/**
 * Every folder the inbox opens on, for reading one back out of its URL.
 */
export const INBOX_FOLDERS: readonly InboxFolder[] = ['all', 'unread', 'awaiting', 'invitation', 'offer', 'notice'];

/**
 * How a cell of a seat offer's comparison is drawn: a term's value and the
 * line under it, the column heads with their car, the signed column washed in
 * the accepted green - the head a shade deeper - the row's best in a paler
 * one, and racing on your own on the muted wash of something no team offers.
 */
export const COMPARE_COLUMN = {
  cell: 'flex min-w-0 flex-col gap-0.5 border-t border-l px-3 py-2',
  head: 'flex min-w-0 flex-col gap-1.5 border-l bg-muted/40 p-3',
  signed: 'bg-mail-accepted/50',
  signedHead: 'bg-mail-accepted/70',
  best: 'bg-mail-accepted/40',
  own: 'bg-muted/30',
  // Your own team asking you back: a wash of the contract's violet, the
  // contract you hold asking to go on.
  renewal: 'bg-contract/30',
  renewalHead: 'bg-contract/60',
} as const;

/**
 * The label column of a seat offer's comparison.
 */
export const COMPARE_LABEL = 'border-t bg-muted/30 px-3 py-2 text-xs text-muted-foreground';

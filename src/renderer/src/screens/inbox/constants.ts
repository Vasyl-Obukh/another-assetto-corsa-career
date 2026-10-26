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
export const STATE_FOLDERS: readonly { id: Exclude<InboxFolder, 'invitation'>; icon: LucideIcon }[] = [
  { id: 'all', icon: InboxIcon },
  { id: 'unread', icon: MailWarningIcon },
  { id: 'awaiting', icon: ReplyIcon },
];

/**
 * Every folder the inbox opens on, for reading one back out of its URL.
 */
export const INBOX_FOLDERS: readonly InboxFolder[] = ['all', 'unread', 'awaiting', 'invitation'];

import { useTranslation } from 'react-i18next';

import { CLOSING_DAYS } from './constants.ts';
import { daysBetween } from '../../../../shared/utils/calendar-days';
import { useSlot } from '@/app';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { INVITATION_ACCENT } from '@/lib/accents';
import type { InboxItem } from '@/lib/inbox';
import { cn } from '@/lib/utils.ts';

interface MailStatusChipProps {
  /**
   * The mail.
   */
  item: InboxItem;
  /**
   * Anything the caller adds, such as the smaller size a row uses.
   */
  className?: string;
}

// Where a mail that wants an answer stands, in the colour of that state - the
// day to reply by while it is still open, and how many days that leaves once
// it is a fortnight off.
export const MailStatusChip = ({ item, className }: MailStatusChipProps) => {
  const { t } = useTranslation();
  const { formatDayShort } = useFormat();
  const { career } = useSlot();
  if (!item.status) return null;

  const day = formatDayShort(item.mail.deadline ?? '');
  const left = item.status === 'awaiting' && career && item.mail.deadline
    ? daysBetween(career.date, item.mail.deadline)
    : null;
  let label = t(`inbox.status.${item.status}`, { day });
  if (left === 0) label = t('inbox.status.statusToday');
  else if (left !== null && left > 0 && left <= CLOSING_DAYS) label = t('inbox.status.statusLeft', { day, count: left });

  return <Badge className={cn(INVITATION_ACCENT[item.status], className)}>{label}</Badge>;
};

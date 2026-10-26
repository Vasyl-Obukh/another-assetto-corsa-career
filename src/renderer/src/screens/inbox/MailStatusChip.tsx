import { useTranslation } from 'react-i18next';

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
// day to reply by while it is still open.
export const MailStatusChip = ({ item, className }: MailStatusChipProps) => {
  const { t } = useTranslation();
  const { formatDayShort } = useFormat();
  if (!item.status) return null;

  return (
    <Badge className={cn(INVITATION_ACCENT[item.status], className)}>
      {t(`inbox.status.${item.status}`, { day: formatDayShort(item.mail.deadline ?? '') })}
    </Badge>
  );
};

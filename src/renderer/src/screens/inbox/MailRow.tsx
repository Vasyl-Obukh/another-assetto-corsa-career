import { LandmarkIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { MailStatusChip } from './MailStatusChip.tsx';
import { useFormat } from '@/i18n';
import { HISTORIC_ACCENT } from '@/lib/accents';
import type { InboxItem } from '@/lib/inbox';
import { cn } from '@/lib/utils.ts';

interface MailRowProps {
  /**
   * The mail.
   */
  item: InboxItem;
  /**
   * The car it offers, by name.
   */
  car: string;
  /**
   * Whether it is the mail open beside the list.
   */
  selected: boolean;
  /**
   * Called to open it.
   */
  onOpen: () => void;
}

// One mail in the list: who it is from and when, what it is, and where it
// stands. Unopened, it is bold with a dot beside it.
export const MailRow = ({
  item, car, selected, onOpen,
}: MailRowProps) => {
  const { t } = useTranslation();
  const { formatDayShort } = useFormat();
  const unread = !item.mail.opened && !selected;

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-current={selected}
      className={cn(
        'grid w-full grid-cols-[0.5rem_2.25rem_minmax(0,1fr)] items-start gap-2.5 border-b px-3 py-2.5 text-left transition-colors hover:bg-accent/60',
        selected && 'bg-primary/10 hover:bg-primary/10',
      )}
    >
      <span aria-hidden className={cn('mt-2 size-2 rounded-full', unread ? 'bg-primary' : 'bg-transparent')} />
      {/* The well wears the leather, as an invitation is to a historic event. */}
      <span className={cn('grid size-9 place-items-center rounded-lg [&_svg]:size-4', HISTORIC_ACCENT)}>
        <LandmarkIcon />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="flex items-baseline gap-2">
          <span className={cn('min-w-0 flex-1 truncate text-sm', unread ? 'font-semibold' : 'font-medium')}>
            {item.team?.name ?? t('inbox.organisers')}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{formatDayShort(item.mail.arrived)}</span>
        </span>
        <span className={cn('truncate text-sm', unread ? 'font-semibold' : 'text-foreground/90')}>
          {t('inbox.subject.invitation', { event: item.event?.name ?? item.mail.invitation?.series ?? '' })}
        </span>
        <span className="flex min-w-0 items-center gap-1.5 pt-0.5">
          <MailStatusChip item={item} className="shrink-0 px-1.5 py-0 text-[0.65rem]" />
          <span className="truncate text-xs text-muted-foreground">
            {[car, item.entry?.name].filter(Boolean).join(' · ')}
          </span>
        </span>
      </span>
    </button>
  );
};

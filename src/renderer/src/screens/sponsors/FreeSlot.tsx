import { MailIcon, RefreshCwIcon, SparklesIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import type { Mail, SponsorSlot } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { RENEWAL_ACCENT } from '@/lib/accents';
import { path } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';

interface FreeSlotProps {
  /**
   * Which slot is free.
   */
  slot: SponsorSlot;
  /**
   * The renewal waiting on it, when the sponsor who held it asks for another
   * year.
   */
  renewal?: Mail;
}

/**
 * A slot the career holds with no sponsor in it.
 */
export const FreeSlot = ({ slot, renewal }: FreeSlotProps) => {
  const { t } = useTranslation();
  const { formatDay } = useFormat();

  return (
    <div
      className={cn(
        'flex min-h-48 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed p-6 text-center text-sm text-muted-foreground',
        // The empty shape of a deal's card: its slot's colour, dashed and faint.
        slot === 'main' ? 'border-sponsor-solid/45 bg-sponsor/35' : 'border-partner-solid/45 bg-partner/35',
      )}
    >
      <span
        className={cn(
          'grid size-9 place-items-center rounded-full',
          slot === 'main' ? 'bg-sponsor text-sponsor-foreground' : 'bg-partner text-partner-foreground',
        )}
      >
        <SparklesIcon className="size-4.5" />
      </span>
      <span className="font-semibold text-foreground">{t(`sponsors.free.${slot}`)}</span>
      {renewal?.sponsor ? (
        <>
          <Badge className={cn('gap-1', RENEWAL_ACCENT)}>
            <RefreshCwIcon className="size-3" />
            {t('inbox.renewal')}
          </Badge>
          <span>{t('sponsors.free.renewal', { sponsor: renewal.sponsor.sponsor.name, day: formatDay(renewal.deadline ?? '') })}</span>
          <Link to={path.inbox(renewal.id)} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            <MailIcon className="size-3.5" />
            {t('sponsors.card.offer')}
          </Link>
        </>
      ) : <span>{t('sponsors.free.hint')}</span>}
    </div>
  );
};

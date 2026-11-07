import { MailIcon, MoreVerticalIcon, XIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { DealNotes } from './DealNotes.tsx';
import type { Career, SponsorDeal } from '../../../../shared/types';
import { dealPaid, dealScale, goalStanding } from '../../../../shared/utils/sponsors';
import {
  CoversBadge, MoneyAmount, NationFlag, SponsorGoal, SponsorMark, SponsorPerks,
} from '@/components';
import { Button } from '@/components/ui/button.tsx';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { useFormat } from '@/i18n';
import { SPONSOR_SOLID } from '@/lib/accents';
import { path } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';

interface SponsorCardProps {
  /**
   * The career.
   */
  career: Career;
  /**
   * The deal.
   */
  deal: SponsorDeal;
  /**
   * Called to end it.
   */
  onEnd: () => void;
}

/**
 * One sponsor backing the career: who it is and what it covers, what it pays
 * a price and its condition to a line, its goal and how far it has got, and
 * what it has paid.
 */
export const SponsorCard = ({ career, deal, onEnd }: SponsorCardProps) => {
  const { t } = useTranslation();
  const { formatDay } = useFormat();
  const navigate = useNavigate();

  return (
    <article className={cn('flex flex-col overflow-hidden rounded-xl border border-t-4 bg-card shadow-sm', SPONSOR_SOLID[deal.slot])}>
      <div className="flex items-center gap-3 px-4 pt-3.5 pb-2.5">
        <SponsorMark sponsor={deal.sponsor} slot={deal.slot} />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="flex items-center gap-1.5 font-semibold">
            <span className="truncate">{deal.sponsor.name}</span>
            <NationFlag code={deal.sponsor.nation} />
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {t('sponsors.card.who', { slot: t(`sponsors.slot.${deal.slot}`), trade: t(`sponsors.trade.${deal.sponsor.trade}`) })}
          </span>
        </div>
        <CoversBadge covers={deal.covers} />
      </div>
      <div className="flex flex-col gap-3 px-4 pb-3.5">
        <SponsorPerks terms={deal} scale={dealScale(deal, career.level)} />
        <DealNotes career={career} deal={deal} />
        <SponsorGoal goal={deal.goal} standing={goalStanding(career, deal)} met={deal.goalMet !== undefined} />
      </div>
      <div className="mt-auto flex items-center gap-3 border-t px-4 py-2 text-xs text-muted-foreground">
        <span className="flex items-baseline gap-1.5">
          {t('sponsors.card.paid')}
          <MoneyAmount amount={dealPaid(career, deal.id)} className="text-xs" />
        </span>
        <span>{t('sponsors.card.until', { day: formatDay(deal.until) })}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-auto size-7" aria-label={t('sponsors.card.menu')}>
              <MoreVerticalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => { void navigate(path.inbox(deal.id)); }}>
              <MailIcon />
              {t('sponsors.card.offer')}
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={onEnd}>
              <XIcon />
              {t('sponsors.card.end')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
};

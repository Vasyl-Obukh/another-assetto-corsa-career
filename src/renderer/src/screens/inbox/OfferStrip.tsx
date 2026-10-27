import { ChevronRightIcon, TrophyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import type { SeatOffer } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { CONTRACT_ACCENT, DISCIPLINE_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';
import { disciplineKey, tierAccent } from '@/screens/championships';

interface OfferStripProps {
  /**
   * Every offer the mail holds, for the classes they are in.
   */
  offers: readonly SeatOffer[];
  /**
   * What the edition is called.
   */
  edition: string;
  /**
   * The championship's page, on this edition.
   */
  link: string;
}

// The championship an edition's seat offers are for, as one line opening its
// page - as a historic invitation's event card opens the event's: its name,
// its rounds and when it opens, and the rungs its classes on offer enter at.
export const OfferStrip = ({ offers, edition, link }: OfferStripProps) => {
  const { t } = useTranslation();
  const { formatDayShort } = useFormat();
  const first = offers[0];
  if (!first) return null;

  const classes = [...new Map(offers.map((offer) => [offer.entry, offer.ladder])).values()];
  const disciplines = [...new Set(classes.map((ladder) => ladder.discipline))];
  const tiers = [...new Set(classes.map((ladder) => ladder.tier))].sort((left, right) => left - right);
  const name = `${first.seriesName} ${edition}`;

  return (
    <Link to={link} className="hover-outline flex items-center gap-3 rounded-lg border bg-card px-3.5 py-2.5">
      <span className={cn('grid size-8 shrink-0 place-items-center rounded-lg [&_svg]:size-4', CONTRACT_ACCENT)}>
        <TrophyIcon />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold">{name}</span>
        <span className="truncate text-xs text-muted-foreground">
          {t('inbox.offers.strip', { count: first.rounds, day: formatDayShort(first.opener) })}
        </span>
      </span>
      <span className="flex shrink-0 flex-wrap items-center justify-end gap-1">
        {disciplines.map((discipline) => (
          <Badge key={discipline} className={DISCIPLINE_ACCENT[discipline]}>{t(disciplineKey(discipline))}</Badge>
        ))}
        {tiers.map((tier) => (
          <Badge key={tier} className={tierAccent(tier)}>{t('championships.tier', { tier })}</Badge>
        ))}
        {classes.length > 1 ? (
          <span className="ml-1 text-xs text-muted-foreground">{t('inbox.offers.classes', { count: classes.length })}</span>
        ) : null}
      </span>
      <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
        {t('inbox.offers.open')}
        <ChevronRightIcon className="size-4" />
      </span>
    </Link>
  );
};

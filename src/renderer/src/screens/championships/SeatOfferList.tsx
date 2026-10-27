import { CarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import type { Mail } from '../../../../shared/types';
import {
  BudgetBadge, carPictureSources, ContentImage,
} from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import { useCarNames } from '@/hooks';
import { useFormat } from '@/i18n';
import { INVITATION_ACCENT } from '@/lib/accents';
import { offerSummary } from '@/lib/inbox';
import { path } from '@/lib/routes';

interface SeatOfferListProps {
  /**
   * The mail holding the edition's seat offers, still to be answered.
   */
  mail: Mail;
}

// The teams offering a seat in the edition, heading the sidebar over the Enter
// panel - so racing it for a team and racing it on the player's own are read
// side by side - and the way to the mail that compares them.
export const SeatOfferList = ({ mail }: SeatOfferListProps) => {
  const { t } = useTranslation();
  const { formatDayShort, formatMoney } = useFormat();
  const offers = mail.offers ?? [];
  const carName = useCarNames(offers.map((offer) => offer.car.model));
  if (offers.length === 0) return null;

  return (
    <Card className="gap-0 border-dashed border-contract-foreground/50 py-0">
      <CardContent className="flex flex-col gap-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold">{t('championships.offers.title')}</span>
          <Badge className={INVITATION_ACCENT.awaiting}>
            {t('inbox.status.awaiting', { day: formatDayShort(mail.deadline ?? '') })}
          </Badge>
        </div>
        {offers.map((offer) => (
          <div key={`${offer.entry}:${offer.team}`} className="flex items-center gap-3">
            <span className="relative aspect-[16/10] w-16 shrink-0 overflow-hidden rounded-md bg-muted">
              <ContentImage
                sources={carPictureSources(offer.car.model, offer.car.skin)}
                alt={carName(offer.car.model)}
                className="object-cover"
                fallback={(
                  <span className="absolute inset-0 grid place-items-center">
                    <CarIcon className="size-4 text-muted-foreground/40" />
                  </span>
                )}
              />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-sm">
              <span className="truncate font-medium">
                {offers.some((other) => other.entry !== offer.entry)
                  ? `${offer.teamName} · ${offer.entryName}`
                  : offer.teamName}
              </span>
              <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                <BudgetBadge budget={offer.budget} className="shrink-0" />
                <span className="truncate">{offerSummary(offer, t, formatMoney)}</span>
              </span>
            </span>
          </div>
        ))}
        <Button asChild size="sm" variant="outline" className="mt-1">
          <Link to={path.inbox(mail.id)}>{t('championships.offers.compare', { count: offers.length })}</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

import { CarIcon, NewspaperIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { offerEdition, offerLink } from './utils.ts';
import type { Career, MarketNews } from '../../../../shared/types';
import {
  BudgetBadge, carPictureSources, ContentImage, MailFrame, NationFlag, newsSubject, Sender,
} from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { useCarNames } from '@/hooks';
import { useFormat } from '@/i18n';
import { CONTRACT_ACCENT } from '@/lib/accents';
import type { InboxItem } from '@/lib/inbox';
import { path } from '@/lib/routes';

interface MarketReaderProps {
  /**
   * The career, whose driver the mail is to.
   */
  career: Career;
  /**
   * The mail, which must hold market news.
   */
  item: InboxItem & { mail: { market: MarketNews } };
  /**
   * The season's year.
   */
  year: string;
  /**
   * Called to mark it unread again.
   */
  onUnread: () => void;
}

// A season's market as it opens: every seat a privateer sells in a
// championship open to the player, the cheapest first, each opening its
// championship - where A team's seat buys it.
export const MarketReader = ({
  career, item, year, onUnread,
}: MarketReaderProps) => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();
  const { mail } = item;
  const { seats } = mail.market;
  const carName = useCarNames(seats.map((seat) => seat.car.model));

  return (
    <MailFrame
      chips={<Badge className={CONTRACT_ACCENT}>{t('inbox.chip.market')}</Badge>}
      arrived={mail.arrived}
      title={newsSubject(mail, year, t) ?? ''}
      onUnread={onUnread}
      link={{ to: path.championships(), label: t('nav.championships') }}
    >
      <Sender from={mail.from ?? { role: 'paddock' }} driver={career.driver.name} accent={CONTRACT_ACCENT} icon={NewspaperIcon} />

      <p className="max-w-prose text-sm leading-relaxed" data-selectable>{t('inbox.news.market.lede')}</p>

      <div className="flex flex-col overflow-hidden rounded-lg border">
        {seats.map((seat) => (
          <Link
            key={`${seat.series}:${seat.entry}:${seat.team}`}
            to={offerLink(career, seat)}
            className="grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-center gap-3 border-b px-3 py-2 transition-colors last:border-b-0 hover:bg-accent/60"
          >
            <span className="relative aspect-[16/9] w-full overflow-hidden rounded-md bg-muted">
              <ContentImage
                sources={carPictureSources(seat.car.model, seat.car.skin)}
                alt={carName(seat.car.model)}
                className="object-cover"
                fallback={(
                  <span className="absolute inset-0 grid place-items-center">
                    <CarIcon className="size-4 text-muted-foreground/40" />
                  </span>
                )}
              />
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="flex min-w-0 items-center gap-1.5 text-sm font-semibold">
                <span className="truncate">{seat.teamName}</span>
                {seat.nation ? <NationFlag code={seat.nation} /> : null}
                {seat.budget ? <BudgetBadge budget={seat.budget} /> : null}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {[
                  t('inbox.news.market.row', {
                    series: seat.seriesName, edition: offerEdition(career, seat, t), entry: seat.entryName,
                  }),
                  carName(seat.car.model),
                ].join(' · ')}
              </span>
            </span>
            <span className="flex flex-col items-end">
              <span className="text-sm font-semibold tabular-nums">{formatMoney(seat.price)}</span>
              <span className="text-xs text-muted-foreground">{t('inbox.news.market.price')}</span>
            </span>
          </Link>
        ))}
      </div>
    </MailFrame>
  );
};

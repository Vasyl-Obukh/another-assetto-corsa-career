import {
  AlertTriangleIcon, CarIcon, ExternalLinkIcon, LandmarkIcon, MailIcon, MoreHorizontalIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';

import { MailStatusChip } from './MailStatusChip.tsx';
import { ReplyBar } from './ReplyBar.tsx';
import type { Career } from '../../../../shared/types';
import { formatOf } from '../../../../shared/utils/event-format';
import { prizeSpeed, prizeTable, scaledPrize } from '../../../../shared/utils/prizes';
import {
  carPictureSources, ContentImage, HistoricChip, NationFlag,
} from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { useInstalledTrack } from '@/hooks';
import { useFormat } from '@/i18n';
import { DISCIPLINE_ACCENT, HISTORIC_ACCENT } from '@/lib/accents';
import type { InboxItem } from '@/lib/inbox';
import { cn } from '@/lib/utils.ts';
import { disciplineKey, FormatStrip, tierAccent } from '@/screens/championships';
import { LayoutMap } from '@/screens/track-browser';

interface MailReaderProps {
  /**
   * The career the mail was sent to.
   */
  career: Career;
  /**
   * The mail.
   */
  item: InboxItem;
  /**
   * The car it offers, by name.
   */
  car: string;
  /**
   * The page of the event it is about, or null when there is none to open.
   */
  event: string | null;
  /**
   * Whether a command is in flight, which holds the buttons.
   */
  busy: boolean;
  /**
   * Called to accept it.
   */
  onAccept: () => void;
  /**
   * Called to decline it, which asks first.
   */
  onDecline: () => void;
  /**
   * Called to mark it unread again.
   */
  onUnread: () => void;
}

// One mail open beside the list: who it is from, the letter, the event it is
// about at a glance, and its answer pinned to the foot.
export const MailReader = ({
  career, item, car, event, busy, onAccept, onDecline, onUnread,
}: MailReaderProps) => {
  const { t } = useTranslation();
  const { formatDay, formatMoney } = useFormat();
  const navigate = useNavigate();
  const { mail, entry, round } = item;
  const offer = mail.invitation;
  const name = item.event?.name ?? offer?.series ?? '';
  const team = item.team?.name ?? t('inbox.organisers');
  const day = formatDay(mail.deadline ?? '');
  // The layout's own name, once the install has said it - the letter reads
  // without one until then, or for a track no longer installed.
  const track = useInstalledTrack(round?.track ?? null)?.name ?? null;
  const offerKey = track ? 'inbox.letter.offerSeatAt' : 'inbox.letter.offerSeat';
  const format = item.event && round ? formatOf(item.event, round) : null;
  const [winner] = item.event && entry ? prizeTable(item.event, entry.id, 'positions') : [];
  // Another event of the career's on the same day, which accepting would put
  // beside this one - unless the career races two in a day.
  const clash = item.status === 'awaiting' && !career.settings.allowSameDayEvents
    ? career.seasons.at(-1)?.entries
      .filter((one) => !one.withdrawn)
      .flatMap((one) => one.events
        .filter((other) => other.status === 'scheduled' && other.date === mail.deadline)
        .map((other) => {
          const held = one.championship.rounds.find((r) => r.id === other.round);

          return one.historic ? one.championship.name : `${one.championship.name} - ${held?.name ?? other.round}`;
        }))[0]
    : undefined;

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-5 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={HISTORIC_ACCENT}>{t('inbox.chip.invitation')}</Badge>
            <MailStatusChip item={item} />
            <span className="ml-auto text-xs text-muted-foreground">{formatDay(mail.arrived)}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8" aria-label={t('inbox.menu.label')}>
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={onUnread}>
                  <MailIcon />
                  {t('inbox.menu.unread')}
                </DropdownMenuItem>
                {event ? (
                  <DropdownMenuItem onSelect={() => { void navigate(event); }}>
                    <ExternalLinkIcon />
                    {t('inbox.menu.open')}
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <h2 className="text-xl font-semibold" data-selectable>{t('inbox.subject.invitation', { event: name })}</h2>

          <div className="flex items-center gap-3">
            <span className={cn('grid size-10 shrink-0 place-items-center rounded-lg [&_svg]:size-5', HISTORIC_ACCENT)}>
              <LandmarkIcon />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="flex items-center gap-1.5 font-semibold">
                {team}
                {item.team?.nationCode ? <NationFlag code={item.team.nationCode} /> : null}
              </span>
              <span className="text-xs text-muted-foreground">{t('inbox.to', { driver: career.driver.name })}</span>
            </span>
          </div>

          <div className="flex flex-col gap-3 text-sm leading-relaxed" data-selectable>
            <p>{t('inbox.letter.greeting', { name: career.driver.name })}</p>
            <p>
              {t(offerKey, {
                team, car, event: name, day, track: track ?? '',
              })}
            </p>
            <p>{t('inbox.letter.terms')}</p>
            {item.event?.description ? (
              <p className="border-l-2 border-historic-foreground/40 pl-3 text-muted-foreground italic">
                {item.event.description}
              </p>
            ) : null}
            <p>
              {t('inbox.letter.reply')}
              <br />
              {team}
            </p>
          </div>

          {/* The whole card opens the event's page, as a calendar card does. */}
          {event && item.event && round ? (
            <Link to={event} className="hover-outline block overflow-hidden rounded-lg border">
              <div className="flex items-center gap-4 border-b bg-muted/40 p-4">
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <HistoricChip />
                    {entry ? (
                      <>
                        <Badge className={DISCIPLINE_ACCENT[entry.ladder.discipline]}>
                          {t(disciplineKey(entry.ladder.discipline))}
                        </Badge>
                        <Badge className={tierAccent(entry.ladder.tier)}>
                          {t('championships.tier', { tier: entry.ladder.tier })}
                        </Badge>
                      </>
                    ) : null}
                  </span>
                  <span className="truncate font-semibold">{name}</span>
                  <span className="text-xs text-muted-foreground">{[day, track].filter(Boolean).join(' · ')}</span>
                </div>
                <span className="relative block aspect-[16/9] w-32 shrink-0 overflow-hidden rounded-md bg-muted">
                  <LayoutMap track={round.track} alt={name} className="p-1.5" iconClassName="size-6" />
                </span>
              </div>
              <dl className="grid gap-4 p-4 sm:grid-cols-4">
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <dt className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                    {t('inbox.card.seat')}
                  </dt>
                  <dd className="flex items-center gap-2.5">
                    <span className="relative aspect-[16/10] w-14 shrink-0 overflow-hidden rounded bg-muted">
                      {offer ? (
                        <ContentImage
                          sources={carPictureSources(offer.car.model, offer.car.skin)}
                          alt={car}
                          className="object-cover"
                          fallback={(
                            <span className="absolute inset-0 grid place-items-center">
                              <CarIcon className="size-4 text-muted-foreground/40" />
                            </span>
                          )}
                        />
                      ) : null}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">{car}</span>
                      <span className="truncate text-xs text-muted-foreground">{[team, entry?.name].join(' · ')}</span>
                    </span>
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                    {t('inbox.card.format')}
                  </dt>
                  <dd className="flex flex-col gap-1">
                    {format ? <FormatStrip sessions={format.sessions} /> : null}
                    <span className="text-xs text-muted-foreground">
                      {[
                        t('inbox.card.cars', { count: entry?.seats.length ?? 0 }),
                        t('inbox.card.classes', { count: item.event.entries.length }),
                      ].join(' · ')}
                    </span>
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                    {t('inbox.card.winner')}
                  </dt>
                  <dd className="flex flex-col">
                    <span className="font-semibold tabular-nums">
                      {winner === undefined ? t('inbox.card.noPrize') : formatMoney(scaledPrize(winner, prizeSpeed(career)))}
                    </span>
                    <span className="text-xs text-muted-foreground">{t('inbox.card.free')}</span>
                  </dd>
                </div>
              </dl>
            </Link>
          ) : null}

          {clash ? (
            <p className="flex items-start gap-2 rounded-md border border-warning/50 bg-warning/15 p-3 text-sm">
              <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
              <span className="flex flex-col">
                <span className="font-semibold">{t('inbox.clash', { event: clash })}</span>
                {t('inbox.clashHint', { day })}
              </span>
            </p>
          ) : null}
        </div>
      </div>

      <ReplyBar
        career={career}
        item={item}
        event={event}
        busy={busy}
        onAccept={onAccept}
        onDecline={onDecline}
      />
    </section>
  );
};

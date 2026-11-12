import {
  BriefcaseIcon, ExternalLinkIcon, LifeBuoyIcon, MailIcon, MoreVerticalIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { MailStatusChip } from './MailStatusChip.tsx';
import { OfferCompare } from './OfferCompare.tsx';
import { OfferReplyBar } from './OfferReplyBar.tsx';
import { OfferStrip } from './OfferStrip.tsx';
import { feePerRound } from './utils.ts';
import type { Career, SeatOffer } from '../../../../shared/types';
import { seatBacker } from '../../../../shared/utils/sponsors';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { useFormat } from '@/i18n';
import { CONTRACT_ACCENT, DISCIPLINE_ACCENT, INVITATION_ACCENT } from '@/lib/accents';
import { signedOffer } from '@/lib/inbox';
import type { InboxItem } from '@/lib/inbox';
import { cn } from '@/lib/utils.ts';
import { disciplineKey, tierAccent } from '@/screens/championships';

interface OfferReaderProps {
  /**
   * The career the mail was sent to.
   */
  career: Career;
  /**
   * The mail.
   */
  item: InboxItem;
  /**
   * Names a car by its folder ID.
   */
  carName: (model: string) => string;
  /**
   * What the edition it is for is called.
   */
  edition: string;
  /**
   * The championship's page.
   */
  link: string;
  /**
   * Whether a command is in flight, which holds the buttons.
   */
  busy: boolean;
  /**
   * Called to accept one of its offers.
   */
  onAccept: (offer: SeatOffer, backed: boolean) => void;
  /**
   * Called to decline it, which asks first.
   */
  onDecline: () => void;
  /**
   * Called to mark it unread again.
   */
  onUnread: () => void;
}

/**
 * An edition's offers cut into its classes, in the order the mail holds them.
 * @param offers The offers
 * @returns Each class's offers
 */
const byClass = (offers: readonly SeatOffer[]): SeatOffer[][] => {
  const classes = new Map<string, SeatOffer[]>();
  for (const offer of offers) classes.set(offer.entry, [...(classes.get(offer.entry) ?? []), offer]);

  return [...classes.values()];
};

// An edition's seat offers open beside the list: who they are from, the
// championship they are for as a link to its page, then each class's offers
// side by side with what racing it on the player's own comes to - and the
// answer pinned to the foot. Once accepted, the class signed for leads.
export const OfferReader = ({
  career, item, carName, edition, link, busy, onAccept, onDecline, onUnread,
}: OfferReaderProps) => {
  const { t } = useTranslation();
  const { formatDay, formatMoney } = useFormat();
  const navigate = useNavigate();
  const { mail, offers } = item;
  const first = offers[0];
  if (!first || !item.status) return null;

  const signed = signedOffer(item);
  const isMine = (group: readonly SeatOffer[]): boolean => signed !== null && group.includes(signed);
  const classes = byClass(offers).sort((left, right) => Number(isMine(right)) - Number(isMine(left)));
  const teams = [...new Set(offers.map((offer) => offer.teamName))];
  const named = { series: first.seriesName, edition, count: teams.length };
  const answered = mail.reply?.on ?? mail.deadline ?? '';
  // A renewal leads the mail, and a seat bought was asked for rather than
  // offered.
  const renewal = offers.find((offer) => offer.renews !== undefined);
  let lede = t('inbox.offers.lede', { ...named, team: first.teamName });
  if (first.bought) lede = t('inbox.offers.bought', { ...named, team: first.teamName });
  else if (renewal?.renews) {
    lede = t('inbox.offers.renewal', {
      ...named, team: renewal.teamName, place: renewal.renews.place, count: teams.length - 1,
    });
  }

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-5 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={CONTRACT_ACCENT}>{t('inbox.chip.offers', { count: offers.length })}</Badge>
            <MailStatusChip item={item} />
            <span className="ml-auto text-xs text-muted-foreground">{formatDay(mail.arrived)}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8" aria-label={t('inbox.menu.label')}>
                  <MoreVerticalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={onUnread}>
                  <MailIcon />
                  {t('inbox.menu.unread')}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => { void navigate(link); }}>
                  <ExternalLinkIcon />
                  {t('inbox.offer.reply.open')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex w-full max-w-6xl flex-col gap-5">
            <h2 className="text-xl font-semibold" data-selectable>
              {first.bought ? t('inbox.subject.bought', named) : t('inbox.subject.offer', { ...named, count: offers.length })}
            </h2>

            <div className="flex items-center gap-3">
              <span className={cn('grid size-10 shrink-0 place-items-center rounded-lg [&_svg]:size-5', CONTRACT_ACCENT)}>
                <BriefcaseIcon />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="font-semibold">{teams.join(', ')}</span>
                <span className="text-xs text-muted-foreground">{t('inbox.to', { driver: career.driver.name })}</span>
              </span>
            </div>

            <p className="max-w-prose text-sm leading-relaxed" data-selectable>
              {lede}
            </p>

            {first.lifeline ? (
              <p className="flex items-start gap-2 rounded-md border-l-3 border-contract-foreground bg-contract/40 p-3 text-sm">
                <LifeBuoyIcon className="mt-0.5 size-4 shrink-0" />
                <span>
                  <span className="font-semibold">{t('inbox.offer.lifeline')}</span>
                  {' '}
                  {t('inbox.offer.lifelineHint')}
                </span>
              </p>
            ) : null}

            <OfferStrip offers={offers} edition={edition} link={link} />

            {classes.map((group) => {
              const head = group[0];
              const mine = isMine(group);

              return (
                <div key={head.entry} className="flex flex-col gap-2">
                  {classes.length > 1 ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-semibold">{head.entryName}</span>
                      <Badge className={DISCIPLINE_ACCENT[head.ladder.discipline]}>
                        {t(disciplineKey(head.ladder.discipline))}
                      </Badge>
                      <Badge className={tierAccent(head.ladder.tier)}>{t('championships.tier', { tier: head.ladder.tier })}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {t('inbox.offers.classFee', { amount: formatMoney(feePerRound(head)) })}
                      </span>
                      {mine ? <Badge className={INVITATION_ACCENT.accepted}>{t('inbox.offers.yourClass')}</Badge> : null}
                      {signed && !mine ? <span className="text-xs text-muted-foreground">{t('inbox.offers.otherClass')}</span> : null}
                    </div>
                  ) : null}
                  <OfferCompare
                    offers={group}
                    status={item.status ?? 'awaiting'}
                    signed={signed}
                    answered={answered}
                    money={career.money}
                    backerOf={(offer) => (
                      offer.pay === 'seat' ? seatBacker(career, offer.ladder.discipline, offer.ladder.tier) : null
                    )}
                    carName={carName}
                    link={link}
                    busy={busy}
                    onAccept={onAccept}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <OfferReplyBar
        career={career}
        item={item}
        signed={signed}
        link={link}
        busy={busy}
        onDecline={onDecline}
      />
    </section>
  );
};

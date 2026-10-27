import { CheckCheckIcon, MailOpenIcon } from 'lucide-react';
import {
  useEffect, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';

import { FOLDER_PARAM, PAGE_PARAM } from './constants.ts';
import { InboxRail } from './InboxRail.tsx';
import { MailList } from './MailList.tsx';
import { MailReader } from './MailReader.tsx';
import { OfferReader } from './OfferReader.tsx';
import {
  carModels, eventLink, folderOf, offerEdition, offerLink, pageNumber,
} from './utils.ts';
import type { MailAnswer, OfferPick } from '../../../../shared/types';
import { entryFeeOf } from '../../../../shared/utils/entry-fees';
import { useSlot } from '@/app';
import { ConfirmDialog, ErrorCard, ScreenBody } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { useCarNames } from '@/hooks';
import { useFormat } from '@/i18n';
import { inboxItems, inFolder, matchesSearch } from '@/lib/inbox';
import type { InboxFolder } from '@/lib/inbox';
import { invoke, toDisplayableError } from '@/lib/ipc';
import { MAIL_PARAM } from '@/lib/routes';

/**
 * The career's inbox: folders down the left, every season's mail newest first
 * in the middle, and the mail open on the right with its answer pinned to its
 * foot. Opening a mail marks it read.
 *
 * Read off the career the slot already holds, so there is nothing to load. The
 * folder, the page and the mail open are kept in the URL, so a link can open
 * one mail and Back returns to it.
 */
export const Inbox = () => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();
  const { career } = useSlot();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ReturnType<typeof toDisplayableError> | null>(null);
  const [declining, setDeclining] = useState(false);

  const folder = folderOf(params.get(FOLDER_PARAM));
  const page = pageNumber(params.get(PAGE_PARAM));
  const open = params.get(MAIL_PARAM);
  const items = useMemo(() => (career ? inboxItems(career) : []), [career]);
  const listed = items.filter((item) => inFolder(item, folder) && matchesSearch(item, search));
  const selected = items.find((item) => item.mail.id === open) ?? null;
  const unread = items.filter((item) => !item.mail.opened).length;
  const offered = selected ? carModels(selected) : [];
  const carName = useCarNames(offered);
  const seat = selected?.offers[0] ?? null;

  // Opening a mail reads it. Marked unread again, it is closed as it is, so
  // this never opens it straight back.
  const unopened = selected !== null && !selected.mail.opened ? selected.mail.id : null;
  useEffect(() => {
    if (unopened === null) return;
    invoke('career:markMail', { mail: unopened, opened: true }).catch((thrown: unknown) => {
      setError(toDisplayableError(thrown));
    });
  }, [unopened]);

  if (!career) return null;

  /**
   * Changes what the URL says the inbox shows.
   * @param change The parameters to set, a null one removed
   */
  const show = (change: Record<string, string | null>): void => {
    setParams((now) => {
      const next = new URLSearchParams(now);
      Object.entries(change).forEach(([key, value]) => {
        if (value === null) next.delete(key);
        else next.set(key, value);
      });

      return next;
    });
  };

  /**
   * Runs one command, holding the buttons while it is in flight.
   * @param send What to run
   */
  const command = (send: () => Promise<unknown>): void => {
    setBusy(true);
    send().then(
      () => setError(null),
      (thrown: unknown) => setError(toDisplayableError(thrown)),
    ).finally(() => setBusy(false));
  };
  const answer = (id: string, reply: MailAnswer, offer?: OfferPick): void => command(() => invoke('career:answer', {
    mail: id, answer: reply, ...(offer ? { offer } : {}),
  }));

  // What entering the class it offers costs without it.
  const fee = selected?.event && selected.round
    ? entryFeeOf(selected.event, selected.round.id, selected.mail.invitation?.entry ?? '')
    : undefined;

  return (
    <ScreenBody wide className="flex h-full flex-col gap-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{t('inbox.title')}</h1>
        <Button
          variant="outline"
          disabled={busy || unread === 0}
          onClick={() => command(() => invoke('career:markAllRead', undefined))}
        >
          <CheckCheckIcon />
          {t('inbox.markAllRead')}
        </Button>
      </div>

      {error ? <ErrorCard error={error} onDismiss={() => setError(null)} /> : null}

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[13rem_24rem_minmax(0,1fr)]">
        <InboxRail
          items={items}
          folder={folder}
          onFolder={(next: InboxFolder) => show({ [FOLDER_PARAM]: next === 'all' ? null : next, [PAGE_PARAM]: null })}
        />
        <MailList
          items={listed}
          any={items.length > 0}
          search={search}
          page={page}
          selected={selected?.mail.id ?? null}
          onSearch={(next) => { setSearch(next); show({ [PAGE_PARAM]: null }); }}
          onPage={(next) => show({ [PAGE_PARAM]: next === 1 ? null : String(next) })}
          onOpen={(id) => show({ [MAIL_PARAM]: id })}
        />
        {selected && seat ? (
          <OfferReader
            career={career}
            item={selected}
            carName={carName}
            edition={offerEdition(career, seat, t)}
            link={offerLink(career, seat)}
            busy={busy}
            onAccept={(offer) => answer(selected.mail.id, 'accepted', { entry: offer.entry, team: offer.team })}
            onDecline={() => setDeclining(true)}
            onUnread={() => {
              show({ [MAIL_PARAM]: null });
              command(() => invoke('career:markMail', { mail: selected.mail.id, opened: false }));
            }}
          />
        ) : null}
        {selected && !seat ? (
          <MailReader
            career={career}
            item={selected}
            car={offered[0] ? carName(offered[0]) : ''}
            event={eventLink(career, selected)}
            busy={busy}
            onAccept={() => answer(selected.mail.id, 'accepted')}
            onDecline={() => setDeclining(true)}
            onUnread={() => {
              show({ [MAIL_PARAM]: null });
              command(() => invoke('career:markMail', { mail: selected.mail.id, opened: false }));
            }}
          />
        ) : null}
        {selected ? null : (
          <section className="hidden flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-sm text-muted-foreground lg:flex">
            <MailOpenIcon className="size-6" />
            {t('inbox.pick')}
          </section>
        )}
      </div>

      {selected ? (
        <ConfirmDialog
          open={declining}
          busy={busy}
          title={seat
            ? t(selected.offers.length > 1 ? 'inbox.offers.decline.title' : 'inbox.offer.decline.title', {
              team: seat.teamName, series: seat.seriesName,
            })
            : t('inbox.decline.title', { event: selected.event?.name ?? '' })}
          description={seat
            ? t(selected.offers.length > 1 ? 'inbox.offers.decline.body' : 'inbox.offer.decline.body', { series: seat.seriesName })
            : t(fee ? 'inbox.decline.body' : 'inbox.decline.bodyFree', {
              team: selected.team?.name ?? t('inbox.organisers'),
              fee: formatMoney(fee ?? 0),
            })}
          confirmLabel={t('inbox.decline.confirm')}
          onClose={() => setDeclining(false)}
          onConfirm={() => {
            setDeclining(false);
            answer(selected.mail.id, 'declined');
          }}
        />
      ) : null}
    </ScreenBody>
  );
};

// A career's inbox read for the screens that show it: each mail joined to the
// event it is about, and the folders, search and pages the inbox lists it by.
// Derived on every read; the mail and the seasons are all that is stored.

import type { TFunction } from 'i18next';

import { INBOX_PAGE_SIZE } from './constants.ts';
import type { InboxFolder, InboxItem, InboxMonth } from './types.ts';
import type {
  Career, ContractBonus, Mail, SeatOffer,
} from '../../../../shared/types';
import { pickedOffer } from '../../../../shared/utils/contracts';
import { mailStatus } from '../../../../shared/utils/inbox';
import { matchesTerms, searchTerms } from '../../../../shared/utils/search';

/**
 * One mail, joined to the event it is about.
 * @param career The career whose mail it is
 * @param mail The mail
 * @returns The mail and everything a screen says of it
 */
export const inboxItem = (career: Career, mail: Mail): InboxItem => {
  if (mail.offers) {
    const signed = career.seasons.find((one) => one.index === mail.season)?.entries
      .find((one) => one.contract?.offer === mail.id) ?? null;

    return {
      mail,
      status: mailStatus(mail, career.date),
      event: null,
      draw: null,
      round: null,
      entry: null,
      seat: null,
      team: null,
      entered: signed,
      offers: mail.offers,
    };
  }

  const offer = mail.invitation;
  const season = career.seasons.find((one) => one.index === mail.season);
  const draw = season?.historicEvents?.find((one) => one.raceId === offer?.raceId) ?? null;
  const entered = season?.entries.find((one) => (
    one.historic && !one.withdrawn && one.events.some((event) => event.raceId === offer?.raceId)
  )) ?? null;
  const event = entered?.championship ?? draw?.championship ?? null;
  const entry = event?.entries.find((one) => one.id === offer?.entry) ?? null;
  const seat = entry?.seats.find((one) => one.id === offer?.seat) ?? null;

  return {
    mail,
    status: mailStatus(mail, career.date),
    event,
    draw,
    round: event?.rounds[0] ?? null,
    entry,
    seat,
    team: event?.teams?.find((one) => one.id === seat?.team) ?? null,
    entered,
    offers: [],
  };
};

/**
 * Every mail of a career, newest first, joined to what it is about.
 * @param career The career
 * @returns The mail
 */
export const inboxItems = (career: Career): InboxItem[] => career.inbox
  .map((mail) => inboxItem(career, mail))
  .sort((left, right) => (
    right.mail.arrived.localeCompare(left.mail.arrived) || right.mail.id.localeCompare(left.mail.id)
  ));

/**
 * Whether a mail belongs in a folder.
 * @param item The mail
 * @param folder The folder
 * @returns True when the folder lists it
 */
export const inFolder = (item: InboxItem, folder: InboxFolder): boolean => {
  if (folder === 'unread') return !item.mail.opened;
  if (folder === 'awaiting') return item.status === 'awaiting';
  if (folder === 'invitation' || folder === 'offer') return item.mail.kind === folder;

  return true;
};

/**
 * Whether a mail matches what was typed into the search: the event it is
 * about, or who it comes from - any of an edition's teams, on a seat offer.
 * @param item The mail
 * @param search What was typed
 * @returns True when every word of it is found
 */
export const matchesSearch = (item: InboxItem, search: string): boolean => matchesTerms(
  searchTerms(search),
  [
    item.event?.name ?? item.offers[0]?.seriesName ?? null,
    item.team?.name ?? null,
    ...item.offers.map((offer) => offer.teamName),
  ],
);

/**
 * The offer a seat offer's mail was accepted on.
 * @param item The mail
 * @returns The offer signed, or null while none is
 */
export const signedOffer = (item: InboxItem): SeatOffer | null => (
  item.mail.reply?.answer === 'accepted' ? pickedOffer(item.mail, item.mail.reply.offer) : null
);

/**
 * How many pages a list of mail runs to.
 * @param count How many mail there are
 * @returns The pages, at least one
 */
export const pageCount = (count: number): number => Math.max(1, Math.ceil(count / INBOX_PAGE_SIZE));

/**
 * One page of a list of mail.
 * @param items The mail, in the order listed
 * @param page Which page, counting from one, held to the pages there are
 * @returns The page's mail
 */
export const pageOf = <T>(items: readonly T[], page: number): T[] => {
  const held = Math.min(Math.max(1, page), pageCount(items.length));

  return items.slice((held - 1) * INBOX_PAGE_SIZE, held * INBOX_PAGE_SIZE);
};

/**
 * A list of mail cut into the months it arrived in, as the list heads them.
 * @param items The mail, newest first
 * @returns The months, newest first
 */
export const byMonth = (items: readonly InboxItem[]): InboxMonth[] => {
  const months: InboxMonth[] = [];
  for (const item of items) {
    const month = item.mail.arrived.slice(0, 7);
    const last = months.at(-1);
    if (last && last.month.slice(0, 7) === month) last.items.push(item);
    else months.push({ month: item.mail.arrived, items: [item] });
  }

  return months;
};

/**
 * A contract's standings bonus in one line: every tier, the title first.
 * @param bonus The tiers
 * @param t The translator
 * @param formatMoney Formats an amount in the career's currency
 * @returns The line, or null for a contract with no bonus
 */
export const bonusLine = (
  bonus: readonly ContractBonus[] | undefined,
  t: TFunction,
  formatMoney: (amount: number) => string,
): string | null => (bonus && bonus.length > 0 ? bonus.map((tier) => (tier.upTo === 1
  ? t('inbox.offer.terms.champion', { amount: formatMoney(tier.amount) })
  : t('inbox.offer.terms.top', { place: tier.upTo, amount: formatMoney(tier.amount) }))).join(' · ') : null);

/**
 * A seat offer in one line, as a list of them says it: what it pays and what
 * share of the prize money is the player's.
 * @param offer The offer
 * @param t The translator
 * @param formatMoney Formats an amount in the career's currency
 * @returns The line
 */
export const offerSummary = (offer: SeatOffer, t: TFunction, formatMoney: (amount: number) => string): string => {
  const amount = formatMoney(offer.amount);
  let pay = t('championships.offers.free');
  if (offer.pay === 'salary') pay = t('championships.offers.salary', { amount });
  else if (offer.pay === 'seat') pay = t('championships.offers.seat', { amount });

  return [pay, t('championships.offers.share', { share: offer.prizeShare })].join(' · ');
};

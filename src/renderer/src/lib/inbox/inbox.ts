// A career's inbox read for the screens that show it: each mail joined to the
// event it is about, and the folders, search and pages the inbox lists it by.
// Derived on every read; the mail and the seasons are all that is stored.

import { INBOX_PAGE_SIZE } from './constants.ts';
import type { InboxFolder, InboxItem, InboxMonth } from './types.ts';
import type { Career, Mail } from '../../../../shared/types';
import { mailStatus } from '../../../../shared/utils/inbox';
import { matchesTerms, searchTerms } from '../../../../shared/utils/search';

/**
 * One mail, joined to the event it is about.
 * @param career The career whose mail it is
 * @param mail The mail
 * @returns The mail and everything a screen says of it
 */
export const inboxItem = (career: Career, mail: Mail): InboxItem => {
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
  if (folder === 'invitation') return item.mail.kind === 'invitation';

  return true;
};

/**
 * Whether a mail matches what was typed into the search: the event it is
 * about, or who it comes from.
 * @param item The mail
 * @param search What was typed
 * @returns True when every word of it is found
 */
export const matchesSearch = (item: InboxItem, search: string): boolean => matchesTerms(
  searchTerms(search),
  [item.event?.name ?? null, item.team?.name ?? null, item.seat?.driver?.name ?? null],
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

import { INBOX_FOLDERS } from './constants.ts';
import type { Career } from '../../../../shared/types';
import type { InboxFolder, InboxItem } from '@/lib/inbox';
import { linkRun, path } from '@/lib/routes';

/**
 * The folder a URL names, or All mail for one it does not.
 * @param value What the folder parameter holds
 * @returns The folder
 */
export const folderOf = (value: string | null): InboxFolder => (
  INBOX_FOLDERS.find((one) => one === value) ?? 'all'
);

/**
 * The page a URL names, counting from one.
 * @param value What the page parameter holds
 * @returns The page, one for anything that is not a page
 */
export const pageNumber = (value: string | null): number => {
  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
};

/**
 * The page of the event a mail is about, in the season it belongs to.
 * @param career The career
 * @param item The mail
 * @returns The page's URL, or null when the season no longer holds the event
 */
export const eventLink = (career: Career, item: InboxItem): string | null => {
  if (!item.event || !item.round) return null;

  return path.event(
    { series: item.event.id, round: item.round.id },
    linkRun({ season: item.mail.season, edition: 0 }, career.seasons.at(-1)?.index, 1),
  );
};

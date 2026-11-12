import type { TFunction } from 'i18next';

import { INBOX_FOLDERS } from './constants.ts';
import type {
  Career, Debrief, MailRun, SeatOffer,
} from '../../../../shared/types';
import { seasonYear } from '../../../../shared/utils/editions';
import { editionName } from '@/lib/edition-names';
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

/**
 * Every car a mail offers a seat in, by folder ID.
 * @param item The mail
 * @returns The cars - an invitation's one, every offer's of a seat offer
 */
export const carModels = (item: InboxItem): string[] => (
  item.mail.invitation ? [item.mail.invitation.car.model] : item.offers.map((offer) => offer.car.model)
);

/**
 * Who a seat offer comes from, as a list of mail names them: its first two
 * teams, and how many more.
 * @param offers The edition's offers
 * @param t The translator
 * @returns The line
 */
export const offerSenders = (offers: readonly SeatOffer[], t: TFunction): string => {
  const teams = [...new Set(offers.map((offer) => offer.teamName))];
  const named = teams.slice(0, 2).join(', ');

  return teams.length > 2 ? t('inbox.offers.more', { teams: named, count: teams.length - 2 }) : named;
};

/**
 * What the edition a seat offer - or team news - is about is called: its year,
 * and which part of it for a championship that runs more than once a year.
 * @param career The career
 * @param offer The offer
 * @param t The translator
 * @returns The name
 */
export const offerEdition = (
  career: Career,
  offer: Pick<SeatOffer, 'season' | 'edition' | 'editions'>,
  t: TFunction,
): string => {
  const season = career.seasons.find((one) => one.index === offer.season);

  return season ? editionName({ year: seasonYear(season), edition: offer.edition, editions: offer.editions }, t) : '';
};

/**
 * The page of the championship a seat offer is for, in the edition it is for.
 * @param career The career
 * @param offer The offer
 * @returns The page's URL
 */
export const offerLink = (
  career: Career,
  offer: Pick<SeatOffer, 'series' | 'season' | 'edition' | 'editions'>,
): string => path.championship(
  { id: offer.series },
  linkRun({ season: offer.season, edition: offer.edition }, career.seasons.at(-1)?.index, offer.editions),
);

/**
 * The page of the round a debrief reports, in the run it was raced in.
 * @param career The career
 * @param debrief The debrief
 * @returns The page's URL
 */
export const roundLink = (
  career: Career,
  debrief: Pick<Debrief, 'series' | 'round' | 'season' | 'edition' | 'editions'>,
): string => path.event(
  { series: debrief.series, round: debrief.round },
  linkRun({ season: debrief.season, edition: debrief.edition }, career.seasons.at(-1)?.index, debrief.editions),
);

/**
 * The review of the edition a championship's result is about.
 * @param run The run
 * @returns The page's URL
 */
export const reviewLink = (run: Pick<MailRun, 'series' | 'season' | 'edition'>): string => (
  path.championshipReview({ series: run.series, season: run.season, edition: run.edition })
);

/**
 * What the run a mail of the paddock's is about is called - the season's year
 * for market news, which is about every championship.
 * @param career The career
 * @param item The mail
 * @param t The translator
 * @returns The name, or empty for a mail about no run
 */
export const runName = (career: Career, item: InboxItem, t: TFunction): string => {
  const { mail } = item;
  if (mail.market) {
    const season = career.seasons.find((one) => one.index === mail.season);

    return season ? String(seasonYear(season)) : '';
  }
  const run = item.offers[0] ?? mail.notice ?? mail.debrief ?? mail.results;

  return run ? offerEdition(career, run, t) : '';
};

/**
 * A class's entry fee a round, as its offer states the edition's.
 * @param offer Any offer in the class
 * @returns The fee, averaged over the rounds
 */
export const feePerRound = (offer: SeatOffer): number => (
  offer.rounds > 0 ? Math.round(offer.fees / offer.rounds) : 0
);

/**
 * What a seat offer's season comes to before any prize: the salary it pays,
 * the price of the seat, or the share of the entry fees the team leaves the
 * player.
 * @param offer The offer
 * @returns The amount, negative for what the player pays
 */
export const seasonBeforePrizes = (offer: SeatOffer): number => {
  if (offer.pay === 'salary') return offer.amount;
  if (offer.pay === 'seat') return -offer.amount;

  const owed = Math.round(offer.fees * (1 - offer.feeCover));

  // Fees covered in full owe nothing, rather than a negative zero.
  return owed === 0 ? 0 : -owed;
};

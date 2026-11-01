import type {
  Championship, ClassEntry, HistoricDraw, Mail, MailStatus, Round, SeasonEntry, Seat, SeatOffer, Team,
} from '../../../../shared/types';

/**
 * Which mail the inbox lists: all of it, what is unopened, what still wants an
 * answer, or one kind - invitations, seat offers or team news.
 */
export type InboxFolder = 'all' | 'unread' | 'awaiting' | 'invitation' | 'offer' | 'notice' | 'sponsor';

/**
 * One mail, joined to what it is about, as every screen that shows mail reads
 * it.
 */
export interface InboxItem {
  /**
   * The mail itself.
   */
  mail: Mail;
  /**
   * Where it stands, for a mail that wants an answer.
   */
  status: MailStatus | null;
  /**
   * The event it is about, as the season holds it - the player's own copy once
   * they are in it, else the copy the season drew - or null when the season no
   * longer has it.
   */
  event: Championship | null;
  /**
   * The event as the season drew it.
   */
  draw: HistoricDraw | null;
  /**
   * The event's one round.
   */
  round: Round | null;
  /**
   * The class the invitation offers a seat in.
   */
  entry: ClassEntry | null;
  /**
   * The seat offered.
   */
  seat: Seat | null;
  /**
   * The team the seat belongs to, which is who the mail comes from.
   */
  team: Team | null;
  /**
   * The player's entry into the event, while they are in it - or for a seat
   * offer, the edition raced under the contract it signed.
   */
  entered: SeasonEntry | null;
  /**
   * Every seat offered for one edition, on a seat offer - empty on an
   * invitation.
   */
  offers: SeatOffer[];
}

/**
 * The mail of one month, as the list heads it.
 */
export interface InboxMonth {
  /**
   * Any ISO date in the month, for naming it.
   */
  month: string;
  /**
   * Its mail, newest first.
   */
  items: InboxItem[];
}

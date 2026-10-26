// A career's inbox: every mail it has been sent, kept in its state beside the
// ledger and the rating log, so a save holds the inbox as it stood - what was
// opened and what was answered included.
//
// A mail is stored as fields and worded when it is shown, so it reads in the
// user's language and names the season's own copy of what it is about.

/**
 * What a mail is: today only a historic event's invitation. Phase 9's seat
 * offers arrive as a kind of their own.
 */
export type MailKind = 'invitation';

/**
 * How a mail that wants an answer was answered.
 */
export type MailAnswer = 'accepted' | 'declined';

/**
 * Where a mail that wants an answer stands: still to be answered, answered
 * either way, or left unanswered past its deadline.
 */
export type MailStatus = 'awaiting' | 'accepted' | 'declined' | 'lapsed';

/**
 * The answer a mail was given, and when.
 */
export interface MailReply {
  /**
   * Which answer.
   */
  answer: MailAnswer;
  /**
   * The career's date it was given on, as an ISO date.
   */
  on: string;
}

/**
 * The seat a historic event's invitation offers: one car in one class, for
 * that event alone, with no fee and no rent.
 */
export interface Invitation {
  /**
   * The historic event, by its id.
   */
  series: string;
  /**
   * The race id its one round lowers to, which is what the invitation is about.
   */
  raceId: string;
  /**
   * The class it is in, by its class entry id.
   */
  entry: string;
  /**
   * The seat, by its id - whose driver races it when the player does not.
   */
  seat: string;
  /**
   * The car the seat races.
   */
  car: {
    /**
     * Car folder ID.
     */
    model: string;
    /**
     * Skin folder ID, when the seat names one.
     */
    skin?: string;
  };
}

/**
 * One mail in a career's inbox.
 */
export interface Mail {
  /**
   * Stable identifier, keyed by what it is about - `invite:<raceId>` for an
   * invitation - so nothing arrives twice.
   */
  id: string;
  /**
   * What kind of mail it is.
   */
  kind: MailKind;
  /**
   * Which season it arrived in, counting from zero.
   */
  season: number;
  /**
   * The career's date it arrived on, as an ISO date.
   */
  arrived: string;
  /**
   * Whether it has been opened since it arrived, or since it was last marked
   * unread.
   */
  opened: boolean;
  /**
   * The last day it can be answered, as an ISO date - an invitation's race
   * day. Absent on a mail that wants no answer.
   */
  deadline?: string;
  /**
   * How it was answered, once it has been.
   */
  reply?: MailReply;
  /**
   * The seat offered, on an invitation.
   */
  invitation?: Invitation;
}

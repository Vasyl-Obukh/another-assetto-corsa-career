// When a team's seat offers go out, how long they stand, and what leaving a
// contract early costs. Shared because main sends and settles them and the
// renderer says the same figures.

/**
 * How many days before an edition's opening round its teams' offers go out.
 */
export const OFFER_LEAD_DAYS = 56;

/**
 * How many days an offer stands before it lapses - never past the day before
 * the edition opens.
 */
export const OFFER_ANSWER_DAYS = 14;

/**
 * What a seat offer's mail id starts with.
 */
export const OFFER_MAIL_PREFIX = 'offer:';

/**
 * What terminating a contract costs a round still to race, as a share of that
 * round's fine - never less than one whole fine in all.
 */
export const RELEASE_SHARE = 0.25;

/**
 * What terminating a paid seat gives back, as a share of what the rounds still
 * to race were worth.
 */
export const REFUND_SHARE = 0.5;

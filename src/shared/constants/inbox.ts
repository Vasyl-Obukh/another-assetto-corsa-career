// A career's inbox and the invitations that arrive in it. Shared because main
// sends them on these figures and the renderer says what they come to.

/**
 * How many days before a historic event's own its invitations go out.
 */
export const INVITATION_LEAD_DAYS = 28;

/**
 * What the chance of an invitation grows by a rung, as a percentage - which is
 * also the chance on the lowest rung, so the top rung of five is certain.
 */
export const INVITATION_CHANCE_STEP = 20;

/**
 * The prefix of an invitation's mail id, ahead of the race id it is about.
 */
export const INVITATION_MAIL_PREFIX = 'invite:';

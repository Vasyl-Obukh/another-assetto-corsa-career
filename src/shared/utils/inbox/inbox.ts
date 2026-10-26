// A career's inbox read the way both processes need it: where a mail stands,
// what an invitation's chance is, and when one goes out. Shared because main
// sends and answers mail on these answers and the renderer shows the same.

import {
  INVITATION_CHANCE_STEP, INVITATION_LEAD_DAYS, INVITATION_MAIL_PREFIX,
} from '../../constants/index.ts';
import type { Mail, MailStatus } from '../../types/index.ts';
import { addDays } from '../calendar-days/index.ts';
import { LOWEST_RUNG } from '../career-eligibility/index.ts';

/**
 * The id an invitation's mail is kept under.
 * @param raceId The race id of the event it invites to
 * @returns The mail's id
 */
export const invitationId = (raceId: string): string => `${INVITATION_MAIL_PREFIX}${raceId}`;

/**
 * The chance of an invitation on a rung: a fifth at Rookie and another fifth
 * every rung up, so the top rung is always invited. Every rung below the
 * lowest the ladder names shares its chance, as it shares its figures.
 * @param rung The rung, 1 being the top
 * @returns The chance, as a percentage
 */
export const invitationChance = (rung: number): number => (
  INVITATION_CHANCE_STEP * (LOWEST_RUNG + 1 - Math.min(Math.max(1, rung), LOWEST_RUNG))
);

/**
 * The day a historic event's invitations go out: four weeks before its own,
 * or the day it was drawn when that is sooner - which is how an event early
 * in the year has its invitation as the year opens.
 * @param date The event's day, as an ISO date
 * @param drawn The day it was drawn, as an ISO date
 * @returns The ISO date they go out on
 */
export const invitationDay = (date: string, drawn: string): string => {
  const lead = addDays(date, -INVITATION_LEAD_DAYS);

  return lead > drawn ? lead : drawn;
};

/**
 * Where a mail that wants an answer stands.
 * @param mail The mail
 * @param clock The ISO date the career's clock stands at
 * @returns Its answer, or whether it is still to be answered or has lapsed -
 * null for a mail that wants none
 */
export const mailStatus = (mail: Pick<Mail, 'deadline' | 'reply'>, clock: string): MailStatus | null => {
  if (mail.reply) return mail.reply.answer;
  if (mail.deadline === undefined) return null;

  return mail.deadline < clock ? 'lapsed' : 'awaiting';
};

/**
 * The mail still to be answered, earliest deadline first.
 * @param inbox The career's inbox
 * @param clock The ISO date the career's clock stands at
 * @returns The mail
 */
export const awaitingMail = (inbox: readonly Mail[], clock: string): Mail[] => inbox
  .filter((mail) => mailStatus(mail, clock) === 'awaiting')
  .sort((left, right) => (left.deadline ?? '').localeCompare(right.deadline ?? ''));

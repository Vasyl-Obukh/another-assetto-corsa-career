import { describe, expect, it } from '@jest/globals';

import type { Mail } from '../../../types/index.ts';
import {
  awaitingMail, invitationChance, invitationDay, invitationId, mailStatus,
} from '../inbox.ts';

/**
 * An invitation, waiting on an answer.
 * @param id Its id
 * @param deadline The day of the event it invites to
 * @param over What to change about it
 * @returns The mail
 */
const mail = (id: string, deadline: string, over: Partial<Mail> = {}): Mail => ({
  id,
  kind: 'invitation',
  season: 0,
  arrived: '2027-01-01',
  opened: false,
  deadline,
  ...over,
});

describe('shared/utils/inbox', () => {
  describe('invitationId', () => {
    it('keeps an invitation under the race id it is about', () => {
      expect(invitationId('british-gp-1967:gp@0.0')).toBe('invite:british-gp-1967:gp@0.0');
    });
  });

  describe('invitationChance', () => {
    it('is a fifth at Rookie and a fifth more every rung up', () => {
      expect([5, 4, 3, 2, 1].map((rung) => invitationChance(rung))).toEqual([20, 40, 60, 80, 100]);
    });

    it('gives a rung below the lowest the lowest chance, and never more than certain', () => {
      expect(invitationChance(9)).toBe(20);
      expect(invitationChance(0)).toBe(100);
    });

    it("rises by what a career's sponsors add, and stops at certain", () => {
      expect(invitationChance(5, 0.2)).toBe(24);
      expect(invitationChance(4, 0.3)).toBe(52);
      expect(invitationChance(1, 0.2)).toBe(100);
    });
  });

  describe('invitationDay', () => {
    it('sends invitations four weeks before the event', () => {
      expect(invitationDay('2027-06-30', '2027-01-01')).toBe('2027-06-02');
    });

    it('sends them on the day of the draw for an event sooner than that', () => {
      expect(invitationDay('2027-01-10', '2027-01-01')).toBe('2027-01-01');
    });
  });

  describe('mailStatus', () => {
    it('is the answer given, whatever the clock says', () => {
      const answered = mail('a', '2027-03-01', { reply: { answer: 'declined', on: '2027-02-01' } });

      expect(mailStatus(answered, '2027-02-15')).toBe('declined');
      expect(mailStatus(answered, '2027-04-01')).toBe('declined');
    });

    it('waits on an answer up to the event\'s own day, and lapses after it', () => {
      expect(mailStatus(mail('a', '2027-03-01'), '2027-03-01')).toBe('awaiting');
      expect(mailStatus(mail('a', '2027-03-01'), '2027-03-02')).toBe('lapsed');
    });

    it('is nothing for mail that wants no answer', () => {
      expect(mailStatus({ deadline: undefined }, '2027-03-01')).toBeNull();
    });
  });

  describe('awaitingMail', () => {
    it('lists the mail still to be answered, earliest deadline first', () => {
      const inbox = [
        mail('late', '2027-05-01'),
        mail('answered', '2027-03-01', { reply: { answer: 'accepted', on: '2027-02-01' } }),
        mail('lapsed', '2027-01-15'),
        mail('soon', '2027-03-01'),
      ];

      expect(awaitingMail(inbox, '2027-02-01').map((one) => one.id)).toEqual(['soon', 'late']);
    });
  });
});

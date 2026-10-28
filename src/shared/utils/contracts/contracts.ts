// A contract read the way both processes need it: when its offer goes out and
// lapses, what a round under it pays, covers and is fined, and what
// terminating it comes to. Shared because main settles the money on these
// answers and the renderer shows the same figures.

import type { Termination } from './types.ts';
import {
  NOTICE_MAIL_PREFIX, OFFER_ANSWER_DAYS, OFFER_LEAD_DAYS, OFFER_MAIL_PREFIX, REFUND_SHARE, RELEASE_SHARE,
  SEAT_MAIL_PREFIX,
} from '../../constants/index.ts';
import type {
  Contract, ContractTerms, KeepStanding, Mail, OfferPick, SeasonEntry, SeasonEvent, SeatOffer,
} from '../../types/index.ts';
import { addDays } from '../calendar-days/index.ts';
import { teammateSeat } from '../standings/index.ts';

/**
 * The id an edition's seat offers are mailed under: one mail per edition,
 * holding every class's.
 * @param series The championship's id
 * @param season Which season, counting from zero
 * @param edition Which of the season's editions
 * @returns The mail's id
 */
export const offerId = (series: string, season: number, edition: number): string => (
  `${OFFER_MAIL_PREFIX}${series}:${season}.${edition}`
);

/**
 * The id a seat bought is mailed under, written already accepted.
 * @param series The championship's id
 * @param season Which season, counting from zero
 * @param edition Which of the season's editions
 * @returns The mail's id
 */
export const seatId = (series: string, season: number, edition: number): string => (
  `${SEAT_MAIL_PREFIX}${series}:${season}.${edition}`
);

/**
 * The id team news about a contract is mailed under.
 * @param series The championship's id
 * @param season Which season the contract ran in, counting from zero
 * @param edition Which of the season's editions
 * @returns The mail's id
 */
export const noticeId = (series: string, season: number, edition: number): string => (
  `${NOTICE_MAIL_PREFIX}${series}:${season}.${edition}`
);

/**
 * Which of a seat offer's offers is meant: the one picked, or its only one.
 * @param mail The seat offer
 * @param pick The class and team picked, where one was
 * @returns The offer, or null when the pick names none of them, or none was
 * picked of several
 */
export const pickedOffer = (mail: Pick<Mail, 'offers'>, pick: OfferPick | undefined): SeatOffer | null => {
  const offers = mail.offers ?? [];
  if (!pick) return offers.length === 1 ? offers[0] : null;

  return offers.find((offer) => offer.entry === pick.entry && offer.team === pick.team) ?? null;
};

/**
 * The day an edition's seat offers go out: eight weeks before it opens.
 * @param opener The day of its opening round, as an ISO date
 * @returns The ISO date
 */
export const offerDay = (opener: string): string => addDays(opener, -OFFER_LEAD_DAYS);

/**
 * The last day an offer can be answered: a fortnight after it arrived, and
 * never past the day before its edition opens.
 * @param arrived The day it arrived, as an ISO date
 * @param opener The day its edition opens, as an ISO date
 * @returns The ISO date
 */
export const offerDeadline = (arrived: string, opener: string): string => {
  const window = addDays(arrived, OFFER_ANSWER_DAYS);
  const eve = addDays(opener, -1);

  return window < eve ? window : eve;
};

/**
 * The contract an entry is still raced under: signed, and not terminated.
 * @param entry The season's entry
 * @returns The contract, or null when it is raced on the player's own
 */
export const activeContract = (entry: Pick<SeasonEntry, 'contract'>): Contract | null => (
  entry.contract && entry.contract.ended === undefined ? entry.contract : null
);

/**
 * How much of an entry fee a contract's team covers.
 * @param terms The contract
 * @param fee The round's entry fee
 * @returns What the team pays
 */
export const coveredFee = (terms: Pick<ContractTerms, 'feeCover'>, fee: number): number => (
  Math.round(fee * terms.feeCover)
);

/**
 * What a contract pays a round raced: its salary split evenly over the edition.
 * @param terms The contract
 * @param rounds How many rounds the edition holds
 * @returns The round's salary, or null for a contract paying none
 */
export const roundSalary = (terms: Pick<ContractTerms, 'pay' | 'amount'>, rounds: number): number | null => (
  terms.pay === 'salary' && rounds > 0 ? Math.round(terms.amount / rounds) : null
);

/**
 * What a contract fines a round not raced: its entry fee, which the team paid
 * for an empty seat. A paid seat is never fined, nor a round the install could
 * not race, nor one after the contract was terminated.
 * @param entry The season's entry
 * @param event The round
 * @returns The fine, or null for none
 */
export const roundFine = (
  entry: Pick<SeasonEntry, 'contract'>,
  event: Pick<SeasonEvent, 'date' | 'entryFee' | 'unraceable'>,
): number | null => {
  const { contract } = entry;
  if (!contract || contract.pay === 'seat' || event.unraceable) return null;
  if (contract.ended !== undefined && event.date >= contract.ended) return null;

  return event.entryFee ? event.entryFee : null;
};

/**
 * What a contract's standings bonus pays a final place.
 * @param terms The contract
 * @param place The place in the class's table, counting from one
 * @returns The bonus, zero for none
 */
export const bonusFor = (terms: Pick<ContractTerms, 'bonus'>, place: number): number => (
  terms.bonus?.find((tier) => place <= tier.upTo)?.amount ?? 0
);

/**
 * Where the player of a season raced under a contract stands against what
 * keeps them on: their place and their teammate's in the class's table as it
 * is. Kept on at or above the contract's place, or ahead of the teammate -
 * and always by a team that asks nothing.
 * @param entry The season's entry
 * @returns The standing
 */
export const keepStanding = (
  entry: Pick<SeasonEntry, 'contract' | 'championship' | 'entry' | 'playerSeat' | 'standings'>,
): KeepStanding => {
  const seats = entry.championship.entries.find((one) => one.id === entry.entry)?.seats ?? [];
  const mate = teammateSeat(entry);
  // The rows each driver raced themselves - a stand-in's row is the seat's,
  // never theirs.
  const rows = entry.standings.classes.find((one) => one.entry === entry.entry)?.drivers
    .filter((row) => !row.substitute && row.races > 0) ?? [];
  const place = rows.find((row) => row.seat === entry.playerSeat)?.position ?? null;
  const mateAt = mate ? rows.find((row) => row.seat === mate.id)?.position ?? null : null;
  const keep = entry.contract?.keep;
  const ahead = place !== null && mateAt !== null && place < mateAt;

  return {
    place,
    mate: mateAt,
    size: seats.length,
    kept: keep === undefined || (place !== null && (place <= keep || ahead)),
  };
};

/**
 * What terminating the contract an entry is raced under comes to now.
 * @param entry The season's entry
 * @returns The rounds left, the release fee, the refund and the salary given up
 */
export const termination = (entry: Pick<SeasonEntry, 'contract' | 'events'>): Termination => {
  const contract = activeContract(entry);
  const left = entry.events.filter((event) => event.status === 'scheduled');
  if (!contract || left.length === 0) {
    return {
      left: left.length, release: 0, refund: 0, salaryLeft: 0,
    };
  }

  const fines = left.map((event) => event.entryFee ?? 0);
  const paid = contract.pay === 'seat';
  // A seat bought part-way through was priced on the rounds left then.
  const rounds = contract.pricedRounds ?? entry.events.length;

  return {
    left: left.length,
    release: paid ? 0 : Math.max(...fines, Math.round(fines.reduce((sum, fine) => sum + fine, 0) * RELEASE_SHARE)),
    refund: paid ? Math.round(contract.amount * (left.length / rounds) * REFUND_SHARE) : 0,
    salaryLeft: (roundSalary(contract, rounds) ?? 0) * left.length,
  };
};

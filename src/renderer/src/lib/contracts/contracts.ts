// Every contract a career signed, read for the Contracts page: where each
// stands or how it ended, how it came to be signed, and what it paid and cost.
// Derived on every read; the seasons, the ledger and the inbox are all that is
// stored.

import { EARNED_KINDS, PAID_KINDS } from './constants.ts';
import type {
  ContractEnd, ContractFigures, ContractOrigin, ContractRow, KeepMark,
} from './types.ts';
import type {
  Career, Contract, KeepStanding, SeasonEntry,
} from '../../../../shared/types';
import { keepStanding } from '../../../../shared/utils/contracts';
import { editionOver } from '../../../../shared/utils/editions';
import { mailStatus } from '../../../../shared/utils/inbox';

/**
 * How a contract came to be signed.
 * @param contract The contract
 * @returns Its origin
 */
export const contractOrigin = (contract: Contract): ContractOrigin => {
  if (contract.bought) return 'bought';
  if (contract.renews) return 'renewal';
  if (contract.lifeline) return 'lifeline';

  return 'offered';
};

/**
 * Where a contract stands, or how it ended.
 * @param entry The season's entry raced under it
 * @param contract The contract
 * @param today The ISO date the career's clock stands at
 * @returns The end
 */
export const contractEnd = (entry: SeasonEntry, contract: Contract, today: string): ContractEnd => {
  if (contract.ended !== undefined) return 'terminated';
  // A team decides while the run can still be under way.
  if (!editionOver(entry, today)) return 'running';
  if (contract.kept === 'renewed') return 'renewed';

  return contract.kept === 'released' ? 'released' : 'completed';
};

/**
 * Where the player stands against what keeps them on while the season runs:
 * on course, or short of it - and nothing to say before they have a place in
 * the class's table, unless the team asks nothing at all.
 * @param contract What keeps the player on
 * @param standing Where they stand
 * @returns The mark, or null before they have raced
 */
export const keepMark = (
  contract: Pick<Contract, 'keep'>,
  standing: Pick<KeepStanding, 'place' | 'kept'>,
): KeepMark | null => {
  if (contract.keep !== undefined && standing.place === null) return null;

  return standing.kept ? 'kept' : 'short';
};

/**
 * Every contract a career signed, the newest first.
 * @param career The career
 * @returns The rows
 */
export const contractRows = (career: Career): ContractRow[] => career.seasons
  .flatMap((season) => season.entries.flatMap((entry): ContractRow[] => {
    const { contract } = entry;
    if (!contract) return [];
    const lines = career.ledger.filter((line) => (
      line.season === season.index && line.series === entry.series && line.edition === entry.edition
    ));
    // A renewal offered and not signed is still in the next season's mail.
    const offer = contract.kept === 'offered'
      ? career.inbox.find((mail) => mail.offers?.some((one) => (
        one.series === entry.series && one.renews?.season === season.index && one.renews.edition === entry.edition
      )))
      : undefined;

    return [{
      season,
      entry,
      contract,
      end: contractEnd(entry, contract, career.date),
      origin: contractOrigin(contract),
      renewal: offer ? (mailStatus(offer, career.date) === 'awaiting' ? 'awaiting' : 'declined') : null,
      standing: keepStanding(entry),
      raced: entry.events.filter((event) => event.status === 'raced').length,
      earned: lines.filter((line) => EARNED_KINDS.has(line.kind)).reduce((sum, line) => sum + line.amount, 0),
      paid: lines.filter((line) => PAID_KINDS.has(line.kind)).reduce((sum, line) => sum + line.amount, 0),
    }];
  }))
  .reverse();

/**
 * What a career's contracts came to.
 * @param rows Every contract it signed
 * @returns The figures
 */
export const contractFigures = (rows: readonly ContractRow[]): ContractFigures => {
  const origins: Record<ContractOrigin, number> = {
    offered: 0, renewal: 0, bought: 0, lifeline: 0,
  };
  rows.forEach((row) => { origins[row.origin] += 1; });

  return {
    signed: rows.length,
    origins,
    teams: new Set(rows.map((row) => `${row.entry.series}:${row.contract.team}`)).size,
    earned: rows.reduce((sum, row) => sum + row.earned, 0),
    paid: rows.reduce((sum, row) => sum + row.paid, 0),
  };
};

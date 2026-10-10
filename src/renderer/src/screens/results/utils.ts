import { ALL_CHAMPIONSHIPS, NO_CHAMPIONSHIP } from './constants.ts';
import type { ResultsCriteria } from './types.ts';
import { matchesTerms, searchTerms } from '../../../../shared/utils/search';
import type { ResultEvent } from '@/lib/result-events';

/**
 * The events the Results page shows, each with only the sessions of the kind
 * asked for - and none left with nothing to show.
 * @param events Every event, newest first
 * @param criteria What the page narrows by
 * @returns The events kept, in the same order
 */
export const filterEvents = (
  events: readonly ResultEvent[],
  criteria: ResultsCriteria,
): ResultEvent[] => {
  const terms = searchTerms(criteria.search);

  return events.flatMap((event) => {
    const series = event.origin?.entry.series ?? NO_CHAMPIONSHIP;
    if (criteria.championship !== ALL_CHAMPIONSHIPS && criteria.championship !== series) return [];

    const round = event.origin?.entry.championship.rounds.find((one) => one.id === event.origin?.round);
    const haystacks = [
      event.origin?.entry.championship.name ?? null,
      round?.name ?? null,
      event.title,
      event.sessions[0]?.record.layout?.name ?? null,
      event.sessions[0]?.record.summary.track ?? null,
    ];
    if (!matchesTerms(terms, haystacks)) return [];

    const sessions = criteria.kind === 'all'
      ? event.sessions
      : event.sessions.filter((one) => one.type === criteria.kind);

    return sessions.length === 0 ? [] : [{ ...event, sessions }];
  });
};

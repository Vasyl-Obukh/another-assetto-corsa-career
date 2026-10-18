import type { CareerListing, CareerSummary } from '../../../../shared/types';
import { homeOf, path } from '@/lib/routes';

/**
 * Whether a career in the list reads, and so can be opened.
 * @param career The career
 * @returns True for one that reads
 */
export const isReadable = (career: CareerListing): career is CareerSummary => !('unreadable' in career);

/**
 * The career a link to the Careers list asks to arrive on - the start screen's
 * Load hands over the one played last.
 * @param state The router state the link carried
 * @returns The career's id, or null when it named none
 */
export const pickOf = (state: unknown): string | null => {
  if (typeof state !== 'object' || state === null || !('pick' in state)) return null;
  const { pick } = state;

  return typeof pick === 'string' ? pick : null;
};

/**
 * Where Continue on a career leads once it is open: a career's Home, a
 * standalone championship's own page - or its review, once its one season is
 * over.
 * @param career The career
 * @returns The URL
 */
export const continuePath = (career: CareerSummary): string => {
  const series = career.championships[0]?.series;
  if (career.standing?.over && series) return path.championshipReview({ series, season: 0, edition: 0 });

  return homeOf(career.kind);
};

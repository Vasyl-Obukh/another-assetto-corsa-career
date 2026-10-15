// Telling a season's championships from its historic events, which are season
// entries too. Shared because main and the renderer both tell them apart.

import type { CareerSeason, SeasonEntry } from '../../types/index.ts';

/**
 * Whether a season entry is a historic event rather than a championship.
 * @param entry The season entry
 * @returns True for a historic event
 */
export const isHistoric = (entry: Pick<SeasonEntry, 'historic'>): boolean => entry.historic === true;

/**
 * The championship editions a season entered, without its historic events.
 * @param season The season
 * @returns Its championship entries, in the season's order
 */
export const championshipEntries = (season: Pick<CareerSeason, 'entries'>): SeasonEntry[] => (
  season.entries.filter((entry) => !isHistoric(entry))
);

/**
 * The historic events a season drew.
 * @param season The season
 * @returns Its historic events, in the season's order
 */
export const historicEntries = (season: Pick<CareerSeason, 'entries'>): SeasonEntry[] => (
  season.entries.filter(isHistoric)
);

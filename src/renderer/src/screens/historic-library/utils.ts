import { ContentSource } from '../../../../shared/types';
import type {
  ContentSources, SeriesListing, SeriesRequirements, Settings,
} from '../../../../shared/types';
import { hiddenBySources } from '../../../../shared/utils/content-sources';

/**
 * The historic events' switches in the shape the championships' are read in,
 * so isSeriesActive, withSeriesActive and the list's filters answer for them
 * unchanged.
 * @param settings The user's settings
 * @param settings.historicActive The historic events the user switched
 * @returns The switches, under the name the championship helpers read
 */
export const historicSwitches = (
  { historicActive }: Pick<Settings, 'historicActive'>,
): Pick<Settings, 'seriesActive'> => ({ seriesActive: historicActive });

/**
 * What a historic event needs, its one round's sources counted as the event's.
 *
 * A championship splits what every round needs from what only some do, since
 * missing those loses some rounds and not the season. A historic event has one
 * round, so whatever that round races at is simply what the event needs.
 * @param requires What the library says it needs
 * @returns The same, with nothing left as some rounds' alone
 */
export const eventRequirements = (requires: SeriesRequirements): SeriesRequirements => {
  const { rounds } = requires;
  const sources = new Set(requires.sources);
  if (rounds.packs.length > 0) sources.add(ContentSource.DLC);

  return {
    ...requires,
    sources: [...sources],
    packs: [...new Set([...requires.packs, ...rounds.packs])],
    rounds: { packs: [] },
  };
};

/**
 * Whether the pool lists a historic event on this install.
 *
 * One of ours is listed only where it could be raced: with everything it needs
 * installed, and no content source it needs switched off - the same line the
 * championship library draws for sources, taken further, since an event there
 * is nothing to do with but switch. One of the user's own is always listed, so
 * a file they wrote is never hidden from them.
 * @param listing The historic event and its availability
 * @param offered The content sources switched on in settings
 * @returns True when the pool lists it
 */
export const offeredHere = (listing: SeriesListing, offered: ContentSources): boolean => {
  if (listing.origin !== 'shipped') return true;

  return listing.availability.available && !hiddenBySources(listing, offered);
};

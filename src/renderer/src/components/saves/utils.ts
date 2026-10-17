import type { TFunction } from 'i18next';

import type { SaveFilter } from './types.ts';
import type { SaveSummary } from '../../../../shared/types';
import { sessionName } from '@/lib/session-labels';

/**
 * What a save is called in a list: the name the player gave it, the quick
 * save's own name, or what an autosave was taken after.
 * @param save The save
 * @param t The translator
 * @returns Its title
 */
export const saveTitle = (save: SaveSummary, t: TFunction): string => {
  if (save.kind === 'named') return save.name ?? '';
  if (save.kind === 'quick') return t('saves.kind.quick');

  const { moment } = save;
  if (moment?.kind === 'session') {
    return t('saves.after', { session: sessionName(moment.session, t), round: moment.roundName });
  }
  if (moment?.kind === 'season') return t('saves.newSeason', { year: moment.year });

  return t('saves.kind.auto');
};

/**
 * What the header says of the newest save.
 * @param save The save
 * @param ago How long ago it was taken, worded
 * @param t The translator
 * @returns The line
 */
export const saveStatusLine = (save: SaveSummary, ago: string, t: TFunction): string => {
  if (save.kind === 'named') return t('saves.status.named', { name: save.name ?? '', ago });
  if (save.kind === 'quick') return t('saves.status.quick', { ago });

  const { moment } = save;
  if (moment?.kind === 'session') return t('saves.status.session', { session: sessionName(moment.session, t), ago });
  if (moment?.kind === 'season') return t('saves.status.season', { year: moment.year, ago });

  return t('saves.status.auto', { ago });
};

/**
 * What the toast a load raises is headed with.
 * @param save The save loaded
 * @param t The translator
 * @returns The title
 */
export const loadedTitle = (save: SaveSummary, t: TFunction): string => {
  if (save.kind === 'named') return t('saves.toast.named', { name: save.name ?? '' });
  if (save.kind === 'quick') return t('saves.toast.quick');

  return t('saves.toast.auto', { title: saveTitle(save, t) });
};

/**
 * The name Save as offers before the player types one: what just happened,
 * read off the newest autosave, which is taken after every session.
 * @param saves The career's saves, newest first
 * @param t The translator
 * @returns A name, or null when nothing has happened worth naming one after
 */
export const suggestedName = (saves: readonly SaveSummary[], t: TFunction): string | null => {
  const moment = saves.find((one) => one.kind === 'auto')?.moment;
  if (moment?.kind === 'session') {
    return t('saves.suggested', { round: moment.roundName, session: sessionName(moment.session, t) });
  }
  if (moment?.kind === 'season') return t('saves.newSeason', { year: moment.year });

  return null;
};

/**
 * The saves a filter shows.
 * @param saves Every save
 * @param filter Which to show
 * @returns Those it shows, in the order given
 */
export const filterSaves = (saves: readonly SaveSummary[], filter: SaveFilter): readonly SaveSummary[] => (
  filter === 'all' ? saves : saves.filter((one) => one.kind === filter)
);

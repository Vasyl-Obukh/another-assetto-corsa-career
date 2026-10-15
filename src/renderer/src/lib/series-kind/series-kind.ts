// Where each library's documents are managed, so a screen handed a kind links
// to the right page and the right editor.

import type { SeriesKind } from './types.ts';
import { path } from '@/lib/routes';

export { SERIES_CHANNELS } from './constants.ts';
export type { SeriesKind } from './types.ts';

/**
 * A document's page in settings, which manages it.
 * @param kind Which library it is in
 * @param id Its id
 * @returns The page's URL
 */
export const managePath = (kind: SeriesKind, id: string): string => (
  kind === 'historic' ? path.settingsHistoricEvent({ id }) : path.settingsChampionship({ id })
);

/**
 * A document's editor.
 * @param kind Which library it is in
 * @param id Its id
 * @returns The editor's URL
 */
export const editorPath = (kind: SeriesKind, id: string): string => (
  kind === 'historic' ? path.historicEdit({ id }) : path.championshipEdit({ id })
);

/**
 * The editor, on a document that does not exist yet.
 * @param kind Which library it will be in
 * @returns The editor's URL
 */
export const newPath = (kind: SeriesKind): string => (
  kind === 'historic' ? path.historicNew() : path.championshipNew()
);

import type { ParseKeys } from 'i18next';

import type { CareerKind } from '../../../../shared/types';

/**
 * How many careers the list's skeleton stands in for.
 */
export const CAREER_ROWS = 3;

/**
 * How many championships the season panel's skeleton stands in for.
 */
export const SEASON_ROWS = 2;

/**
 * What the list of each kind of career says wherever the two differ, so one
 * page serves both: the Careers page, and the Championships page that lists
 * standalone championships.
 */
export const HUB_WORDING = {
  career: {
    title: 'careers.title',
    create: 'careers.newCareer',
    empty: 'careers.empty',
    emptyHint: 'careers.emptyHint',
    delete: 'careers.delete',
    deleteTitle: 'careers.deleteTitle',
    deleteHint: 'careers.deleteHint',
    unreadableName: 'careers.unreadable.name',
    unreadableTitle: 'careers.unreadable.title',
    unreadableBody: 'careers.unreadable.body',
    here: 'careers.restore.here',
    hereUnread: 'careers.restore.hereUnread',
    restoreMode: 'careers.restore.mode',
    restored: 'careers.restore.done',
  },
  championship: {
    title: 'standalones.title',
    create: 'standalones.newChampionship',
    empty: 'standalones.empty',
    emptyHint: 'standalones.emptyHint',
    delete: 'standalones.delete',
    deleteTitle: 'standalones.deleteTitle',
    deleteHint: 'standalones.deleteHint',
    unreadableName: 'standalones.unreadable.name',
    unreadableTitle: 'standalones.unreadable.title',
    unreadableBody: 'standalones.unreadable.body',
    here: 'standalones.restore.here',
    hereUnread: 'standalones.restore.hereUnread',
    restoreMode: 'standalones.restore.mode',
    restored: 'standalones.restore.done',
  },
} as const satisfies Record<CareerKind, Record<string, ParseKeys>>;

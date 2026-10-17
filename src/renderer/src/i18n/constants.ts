import { createContext } from 'react';

import type { Language } from '../../../shared/types';
import type { SeriesKind } from '@/lib/series-kind';

/**
 * BCP 47 locale used for each language's dates, numbers and money.
 */
export const LOCALES: Record<Language, string> = { en: 'en-GB', uk: 'uk-UA' };

/**
 * Currency shown when nothing else is specified. Display only, never converted.
 */
export const DEFAULT_CURRENCY = 'USD';

/**
 * How many days "a month ago" stands for. Only how long ago something was is
 * worded off it, so it rounds rather than counting calendar months.
 */
export const DAYS_PER_MONTH = 30;

/**
 * How many days "a year ago" stands for, rounded the same way.
 */
export const DAYS_PER_YEAR = 365;

/**
 * Language every missing translation falls back to.
 */
export const FALLBACK_LANGUAGE: Language = 'en';

/**
 * What each language calls the four home nations AC flags apart from the United
 * Kingdom. Intl names regions and not subdivisions, so these are the only
 * nation names the app translates itself; a language missing here falls back
 * to the English ones.
 */
export const HOME_NATION_NAMES: Partial<Record<Language, Readonly<Record<string, string>>>> = {
  uk: {
    ENG: 'Англія',
    NIR: 'Північна Ірландія',
    SCT: 'Шотландія',
    WLS: 'Уельс',
  },
};

/**
 * Which library the screen around a component words itself for. A historic
 * event is a championship document, so the championship editor and its
 * problem lists serve both - and inside a historic event's screens they read
 * `HISTORIC_WORDING` first, which says "event" where the shared copy says
 * "championship". Outside any provider it is the championships, unchanged.
 */
export const WordingKind = createContext<SeriesKind>('series');

/**
 * Where a historic event's own wording of a shared key lives: the key's full
 * path again under this one, so `editor.problems.hint` is overridden by
 * `historicEditor.wording.editor.problems.hint`, and an error code by
 * `historicEditor.wording.errors.<code>`.
 */
export const HISTORIC_WORDING = 'historicEditor.wording';

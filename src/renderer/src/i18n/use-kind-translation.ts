import type { i18n as I18n, TFunction } from 'i18next';
import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { HISTORIC_WORDING, WordingKind } from './constants.ts';
import type { SeriesKind } from '@/lib/series-kind';

/**
 * useTranslation, worded for the library the screen is about.
 *
 * Inside a historic event's screens every key is looked up under
 * `HISTORIC_WORDING` first and falls back to its own, so a shared component
 * says "event" there without knowing it is anywhere special - and everywhere
 * else it is useTranslation exactly.
 * @param own The library to word for, where the caller is the one providing
 * WordingKind and so cannot read it
 * @returns The translator, worded for the library, and the i18next instance
 */
export const useKindTranslation = (own?: SeriesKind): { t: TFunction; i18n: I18n } => {
  const translation = useTranslation();
  const provided = useContext(WordingKind);
  const kind = own ?? provided;
  const { t } = translation;

  const worded = useMemo((): TFunction => {
    if (kind !== 'historic') return t;

    // i18next takes a list of keys and answers with the first it holds.
    const scoped = (key: string | string[], ...rest: unknown[]): unknown => {
      const keys = Array.isArray(key) ? key : [key];

      return (t as unknown as (keys: string[], ...args: unknown[]) => unknown)(
        [...keys.map((one) => `${HISTORIC_WORDING}.${one}`), ...keys],
        ...rest,
      );
    };

    return scoped as unknown as TFunction;
  }, [kind, t]);

  return { t: worded, i18n: translation.i18n };
};

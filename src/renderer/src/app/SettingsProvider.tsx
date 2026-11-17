import {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import type { ReactNode } from 'react';

import { SettingsContext } from './utils.ts';
import type { ResolvedTheme, Settings } from '../../../shared/types';
import { setLanguage } from '@/i18n';
import { invoke, subscribe } from '@/lib/ipc';

interface SettingsProviderProps {
  /**
   * Settings read from main before the first render.
   */
  initialSettings: Settings;
  /**
   * The resolved theme read from main before the first render.
   */
  initialTheme: ResolvedTheme;
  /**
   * The tree that reads the settings.
   */
  children: ReactNode;
}

export const SettingsProvider = ({
  initialSettings,
  initialTheme,
  children,
}: SettingsProviderProps) => {
  const [settings, setSettings] = useState(initialSettings);
  const [resolved, setResolved] = useState(initialTheme);

  // Main resolves "system" against the OS and pushes the answer; the renderer
  // only ever reflects it onto the document.
  useEffect(() => {
    document.documentElement.dataset.theme = initialTheme;

    return subscribe('theme:changed', (theme) => {
      document.documentElement.dataset.theme = theme;
      setResolved(theme);
    });
  }, [initialTheme]);

  // A theme picked outright is known at once; only "system" waits on main.
  const theme = settings.theme === 'system' ? resolved : settings.theme;

  // While a patch of ours is on its way, what main says predates what is on
  // screen, and adopting it would undo a later click. Main applies patches in
  // order, so the answer to the last one carries all of them.
  const inFlight = useRef(0);

  useEffect(() => subscribe('settings:changed', (next) => {
    if (inFlight.current === 0) setSettings(next);
  }), []);

  useEffect(() => {
    void setLanguage(settings.language);
    document.documentElement.lang = settings.language;
  }, [settings.language]);

  const patch = useCallback((next: Partial<Settings>) => {
    // Applied locally first so the UI does not lag a round trip behind the click.
    setSettings((current) => ({ ...current, ...next }));
    inFlight.current += 1;
    void invoke('settings:patch', next).then((answer) => {
      inFlight.current -= 1;
      if (inFlight.current === 0) setSettings(answer);
    }, (error: unknown) => {
      inFlight.current -= 1;
      console.error('Could not save settings.', error);
    });
  }, []);

  const value = useMemo(() => ({ settings, theme, patch }), [settings, theme, patch]);

  return <SettingsContext value={value}>{children}</SettingsContext>;
};

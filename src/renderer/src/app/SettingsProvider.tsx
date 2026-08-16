import {
  useCallback, useEffect, useMemo, useState,
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

  // Main resolves "system" against the OS and pushes the answer; the renderer
  // only ever reflects it onto the document.
  useEffect(() => {
    document.documentElement.dataset.theme = initialTheme;

    return subscribe('theme:changed', (theme) => {
      document.documentElement.dataset.theme = theme;
    });
  }, [initialTheme]);

  useEffect(() => subscribe('settings:changed', setSettings), []);

  useEffect(() => {
    void setLanguage(settings.language);
    document.documentElement.lang = settings.language;
  }, [settings.language]);

  const patch = useCallback((next: Partial<Settings>) => {
    // Applied locally first so the UI does not lag a round trip behind the click.
    setSettings((current) => ({ ...current, ...next }));
    void invoke('settings:patch', next).then(setSettings, (error: unknown) => {
      console.error('Could not save settings.', error);
    });
  }, []);

  const value = useMemo(() => ({ settings, patch }), [settings, patch]);

  return <SettingsContext value={value}>{children}</SettingsContext>;
};

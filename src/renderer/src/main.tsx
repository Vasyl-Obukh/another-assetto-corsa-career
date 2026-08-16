import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './globals.css';
import { App, SettingsProvider } from '@/app';
import { initI18n } from '@/i18n';
import { invoke } from '@/lib/ipc';

/**
 * Boots the renderer.
 *
 * Settings, theme and translations are all resolved before the first render:
 * painting in the wrong theme or in English and then correcting it is visible.
 * @returns Resolves once React has mounted
 */
const start = async (): Promise<void> => {
  const [settings, theme, report] = await Promise.all([
    invoke('settings:get', undefined),
    invoke('theme:get', undefined),
    invoke('paths:probe', undefined),
  ]);

  await initI18n(settings.language);

  const container = document.getElementById('root');
  if (!container) throw new Error('No #root element to mount into.');

  createRoot(container).render(
    <StrictMode>
      <SettingsProvider initialSettings={settings} initialTheme={theme}>
        <App initialReport={report} />
      </SettingsProvider>
    </StrictMode>,
  );
};

void start().catch((error: unknown) => {
  console.error('Renderer failed to start.', error);
});

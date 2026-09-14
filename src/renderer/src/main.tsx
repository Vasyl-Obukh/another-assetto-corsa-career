import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router';

import './globals.css';
import { App, ClassesProvider, SettingsProvider } from '@/app';
import { initI18n } from '@/i18n';
import { invoke } from '@/lib/ipc';

/**
 * Boots the renderer.
 *
 * Settings, theme, translations and the user's class layer are all resolved
 * before the first render: painting in the wrong theme, in English, or with the
 * shipped specs and then correcting it is visible.
 * @returns Resolves once React has mounted
 */
const start = async (): Promise<void> => {
  const [settings, theme, report, classes] = await Promise.all([
    invoke('settings:get', undefined),
    invoke('theme:get', undefined),
    invoke('paths:probe', undefined),
    invoke('classes:get', undefined),
  ]);

  await initI18n(settings.language);

  const container = document.getElementById('root');
  if (!container) throw new Error('No #root element to mount into.');

  // A data router rather than <HashRouter>, because only a data router can
  // block a navigation - which is how the editor asks before losing a draft.
  // One splat route: App keeps its own <Routes> underneath.
  const router = createHashRouter([{ path: '*', element: <App initialReport={report} /> }]);

  createRoot(container).render(
    <StrictMode>
      <SettingsProvider initialSettings={settings} initialTheme={theme}>
        <ClassesProvider initialLayer={classes}>
          <RouterProvider router={router} />
        </ClassesProvider>
      </SettingsProvider>
    </StrictMode>,
  );
};

void start().catch((error: unknown) => {
  console.error('Renderer failed to start.', error);
});

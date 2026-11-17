import { LayoutGridIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useMatch, useNavigate } from 'react-router';

import { SETTINGS_TABS } from './constants.ts';
import { SettingsTabLink } from './SettingsTabLink.tsx';
import { standaloneEntry } from '../../../../shared/utils/standalone';
import { useSlot } from '@/app';
import {
  BackLink, NationFlag, ScreenStrip, Segments,
} from '@/components';
import { useNavFit } from '@/hooks';
import { path, ROUTE } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';

export const SettingsLayout = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { mode, career } = useSlot();
  const onCareer = useMatch(ROUTE.settingsCareer) !== null;
  // A standalone championship is named by its championship, a career by its
  // driver.
  const championship = career && standaloneEntry(career);
  const [tabs, setTabs] = useState<HTMLElement | null>(null);
  const compact = useNavFit(tabs, i18n.language);

  return (
    <div className="flex h-full flex-col">
      {/* Above the tab's own scroller, so the tabs stay in reach. */}
      <ScreenStrip className={cn('flex flex-col gap-4', mode === 'start' ? 'pt-5' : 'pt-8')}>
        {/* From the start screen there is no header to leave by. */}
        {mode === 'start' ? <BackLink to={path.start()} label={t('back.start')} /> : null}

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">{t('settings.title')}</h1>
          {/* Inside a career, its own settings and the app's are one switch
              apart; it opens on its own. */}
          {career ? (
            <>
              <Segments
                label={t('settings.scope.label')}
                items={[
                  {
                    id: 'career',
                    label: championship
                      ? t('settings.scope.championship', { name: championship.championship.name })
                      : t('settings.scope.career', { driver: career.driver.name }),
                    icon: <NationFlag code={career.driver.nation ?? undefined} className="h-3 w-4.5" />,
                  },
                  { id: 'app', label: t('settings.scope.app'), icon: <LayoutGridIcon /> },
                ]}
                value={onCareer ? 'career' : 'app'}
                onChange={(next) => { void navigate(next === 'career' ? path.settingsCareer() : path.settings()); }}
              />
              <span className="ml-auto text-sm text-muted-foreground">
                {onCareer && championship ? t('settings.scope.championshipNote') : null}
                {onCareer && !championship ? t('settings.scope.careerNote') : null}
                {onCareer ? null : t('settings.scope.appNote')}
              </span>
            </>
          ) : null}
        </div>

        {onCareer ? null : (
          // Short of room, the labels give way one at a time from the right.
          <nav ref={setTabs} className="flex gap-6 border-b">
            {SETTINGS_TABS.map((tab) => (
              <SettingsTabLink key={tab.to} tab={tab} compact={compact.has(tab.to)} />
            ))}
          </nav>
        )}
      </ScreenStrip>

      <div className="min-h-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
};

import { LayoutGridIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  NavLink, Outlet, useMatch, useNavigate,
} from 'react-router';

import { SETTINGS_TABS } from './constants.ts';
import { useSlot } from '@/app';
import {
  BackLink, NationFlag, ScreenStrip, Segments,
} from '@/components';
import { path, ROUTE } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';

export const SettingsLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mode, career } = useSlot();
  const onCareer = useMatch(ROUTE.settingsCareer) !== null;

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
                    label: t('settings.scope.career', { driver: career.driver.name }),
                    icon: <NationFlag code={career.driver.nation ?? undefined} className="h-3 w-4.5" />,
                  },
                  { id: 'app', label: t('settings.scope.app'), icon: <LayoutGridIcon /> },
                ]}
                value={onCareer ? 'career' : 'app'}
                onChange={(next) => { void navigate(next === 'career' ? path.settingsCareer() : path.settings()); }}
              />
              <span className="ml-auto text-sm text-muted-foreground">
                {onCareer ? t('settings.scope.careerNote') : t('settings.scope.appNote')}
              </span>
            </>
          ) : null}
        </div>

        {onCareer ? null : (
          <nav className="flex gap-6 border-b">
            {SETTINGS_TABS.map(({
              to, end, label, icon: Icon,
            }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => cn(
                  'group -mb-px flex items-center gap-2 border-b-2 pb-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'active border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="size-4 group-[.active]:text-primary" />
                {t(label)}
              </NavLink>
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

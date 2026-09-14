import { useTranslation } from 'react-i18next';
import { NavLink, Outlet } from 'react-router';

import { SETTINGS_TABS } from './constants.ts';
import { ScreenStrip } from '@/components';
import { cn } from '@/lib/utils.ts';

export const SettingsLayout = () => {
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-col">
      {/* Above the tab's own scroller, so the tabs stay in reach. */}
      <ScreenStrip className="flex flex-col gap-4 pt-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">{t('settings.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('settings.subtitle')}</p>
        </div>

        <nav className="flex gap-6 border-b">
          {SETTINGS_TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) => cn(
                '-mb-px border-b-2 pb-2 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {t(tab.label)}
            </NavLink>
          ))}
        </nav>
      </ScreenStrip>

      <div className="min-h-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
};

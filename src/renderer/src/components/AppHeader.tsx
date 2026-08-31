import { useTranslation } from 'react-i18next';

import { AppNav } from './app-nav/index.ts';

export const AppHeader = () => {
  const { t } = useTranslation();

  return (
    <header className="flex shrink-0 items-center justify-between gap-6 border-b px-8 py-4">
      <div className="flex min-w-0 items-center gap-6">
        <h1 className="shrink-0 text-lg font-semibold tracking-tight">{t('app.title')}</h1>
        <AppNav />
      </div>
    </header>
  );
};

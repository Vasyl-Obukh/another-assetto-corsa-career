import { useTranslation } from 'react-i18next';

import { LanguageSelect } from './LanguageSelect.tsx';
import { ThemeSelect } from './ThemeSelect.tsx';

export const AppHeader = () => {
  const { t } = useTranslation();

  return (
    <header className="flex items-start justify-between gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t('app.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('app.subtitle')}</p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <ThemeSelect />
        <LanguageSelect />
      </div>
    </header>
  );
};

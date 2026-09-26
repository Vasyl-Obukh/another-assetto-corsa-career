import { useTranslation } from 'react-i18next';

import { ChoiceTile } from './ChoiceTile.tsx';
import { LANGUAGES } from '../../../../shared/constants';
import { useSettings } from '@/app';

export const LanguagePicker = () => {
  const { t, i18n } = useTranslation();
  const { settings, patch } = useSettings();

  return (
    <div role="radiogroup" aria-label={t('settings.language')} className="flex flex-wrap gap-2.5">
      {LANGUAGES.map((language) => {
        // Each tile speaks its own language, so the picture is the app's own
        // words in it and its name is the one its speakers use.
        const own = i18n.getFixedT(language);

        return (
          <ChoiceTile
            key={language}
            selected={settings.language === language}
            preview={(
              <span className="flex h-full flex-col justify-center gap-0.5 bg-background px-2.5">
                <span className="truncate text-[13px] font-semibold">{own('nav.championships')}</span>
                <span className="truncate text-[11px] text-muted-foreground">{own('nav.calendar')}</span>
              </span>
            )}
            onSelect={() => patch({ language })}
          >
            <span className="rounded bg-muted px-1 text-[10.5px] font-bold tracking-wide text-muted-foreground uppercase">
              {language}
            </span>
            {own(`language.${language}`)}
          </ChoiceTile>
        );
      })}
    </div>
  );
};

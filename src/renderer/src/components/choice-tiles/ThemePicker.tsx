import { useTranslation } from 'react-i18next';

import { ChoiceTile } from './ChoiceTile.tsx';
import { THEME_ICON, THEME_PREVIEW } from './constants.ts';
import { THEME_CHOICES } from '../../../../shared/constants';
import { useSettings } from '@/app';
import { cn } from '@/lib/utils.ts';

export const ThemePicker = () => {
  const { t } = useTranslation();
  const { settings, patch } = useSettings();

  return (
    <div role="radiogroup" aria-label={t('settings.theme')} className="flex flex-wrap gap-2.5">
      {THEME_CHOICES.map((choice) => {
        const Icon = THEME_ICON[choice];
        const { page, card } = THEME_PREVIEW[choice];

        return (
          <ChoiceTile
            key={choice}
            selected={settings.theme === choice}
            preview={(
              <span className={cn('flex h-full flex-col', page)}>
                <span className={cn('h-3', card)} />
                <span className="m-2 h-1.5 w-2/5 rounded-full bg-preview-accent" />
              </span>
            )}
            onSelect={() => patch({ theme: choice })}
          >
            <Icon className="size-4 text-muted-foreground" />
            {t(`theme.${choice}`)}
          </ChoiceTile>
        );
      })}
    </div>
  );
};

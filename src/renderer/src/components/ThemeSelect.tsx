import { useTranslation } from 'react-i18next';

import { THEME_CHOICES } from '../../../shared/constants';
import type { ThemeChoice } from '../../../shared/types';
import { useSettings } from '@/app';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import { CONTROL_WIDTH } from '@/lib/layout';

export const ThemeSelect = () => {
  const { t } = useTranslation();
  const { settings, patch } = useSettings();

  return (
    <Select
      value={settings.theme}
      onValueChange={(value) => patch({ theme: value as ThemeChoice })}
    >
      <SelectTrigger size="sm" className={CONTROL_WIDTH} aria-label={t('settings.theme')}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {THEME_CHOICES.map((choice) => (
          <SelectItem key={choice} value={choice}>{t(`theme.${choice}`)}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

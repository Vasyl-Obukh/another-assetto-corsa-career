import { useTranslation } from 'react-i18next';

import { LANGUAGES } from '../../../shared/constants';
import type { Language } from '../../../shared/types';
import { useSettings } from '@/app';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import { CONTROL_WIDTH } from '@/lib/layout';

export const LanguageSelect = () => {
  const { t } = useTranslation();
  const { settings, patch } = useSettings();

  return (
    <Select
      value={settings.language}
      onValueChange={(value) => patch({ language: value as Language })}
    >
      <SelectTrigger size="sm" className={CONTROL_WIDTH} aria-label={t('settings.language')}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((language) => (
          <SelectItem key={language} value={language}>{t(`language.${language}`)}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

import { SaveIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { AUTOSAVE_COUNTS } from '../../../../shared/constants';
import { useSettings } from '@/app';
import { Segments, SettingsSection } from '@/components';

export const SavesSection = () => {
  const { t } = useTranslation();
  const { settings, patch } = useSettings();

  return (
    <SettingsSection id="saves" icon={SaveIcon} tone="saves" title={t('settings.saves')} hint={t('settings.savesHint')}>
      <div className="flex max-w-2xl flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{t('settings.autosaves.label')}</span>
          <span className="text-sm text-muted-foreground">{t('settings.autosaves.hint')}</span>
        </div>
        <Segments
          label={t('settings.autosaves.label')}
          items={AUTOSAVE_COUNTS.map((count) => ({ id: String(count), label: String(count) }))}
          value={String(settings.autosaves)}
          onChange={(next) => patch({ autosaves: Number(next) })}
        />
      </div>
    </SettingsSection>
  );
};

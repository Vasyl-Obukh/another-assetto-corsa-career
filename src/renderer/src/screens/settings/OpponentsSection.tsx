import { BotIcon, InfoIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { OpponentsFields } from './OpponentsFields.tsx';
import { useSettings } from '@/app';
import { SettingsSection } from '@/components';

export const OpponentsSection = () => {
  const { t } = useTranslation();
  const { settings, patch } = useSettings();

  return (
    <SettingsSection
      id="opponents"
      icon={BotIcon}
      tone="opponents"
      title={t('settings.opponents')}
      hint={t('settings.opponentsHint')}
      footer={(
        <>
          <InfoIcon className="size-3.5 shrink-0" />
          {t('settings.opponentsOffsets')}
        </>
      )}
    >
      <OpponentsFields value={settings.opponents} onChange={(opponents) => patch({ opponents })} />
    </SettingsSection>
  );
};

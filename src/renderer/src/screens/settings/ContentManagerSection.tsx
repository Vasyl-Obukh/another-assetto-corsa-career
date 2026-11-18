import { RefreshCwIcon, TerminalIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { CM_FLAGS } from '../../../../shared/constants';
import { ErrorCard, SettingsSection, SwitchTile } from '@/components';
import { useCmArguments } from '@/hooks';

export const ContentManagerSection = () => {
  const { t } = useTranslation();
  const cm = useCmArguments();
  const enabled = cm.arguments?.enabled ?? [];

  return (
    <SettingsSection
      id="content-manager"
      icon={TerminalIcon}
      tone="tools"
      title={t('settings.contentManager')}
      hint={t('settings.contentManagerHint')}
      footer={(
        <>
          <RefreshCwIcon className="size-3.5 shrink-0" />
          {cm.arguments?.exists === false ? t('settings.contentManagerMissing') : t('settings.contentManagerRestart')}
          {cm.arguments ? (
            <span data-selectable className="ml-auto truncate font-mono" title={cm.arguments.file}>
              {cm.arguments.file}
            </span>
          ) : null}
        </>
      )}
    >
      {cm.error ? <ErrorCard error={cm.error} onDismiss={cm.dismissError} /> : null}

      {/* The flags are a fixed pair, so their tiles are drawn at once and only
          the switches wait on Content Manager's file. */}
      <div className="grid gap-2.5 md:grid-cols-2">
        {CM_FLAGS.map((flag) => (
          <SwitchTile
            key={flag}
            label={t(`cmFlag.${flag}`)}
            hint={t(`cmFlagHint.${flag}`)}
            checked={cm.loading ? null : enabled.includes(flag)}
            disabled={cm.busy}
            onChange={(next) => cm.toggle(flag, next)}
          />
        ))}
      </div>
    </SettingsSection>
  );
};

import { useTranslation } from 'react-i18next';

import { SETTINGS_CM_FLAGS } from './constants.ts';
import { ErrorCard, FieldGrid, ToggleRow } from '@/components';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { useCmArguments } from '@/hooks';

export const ContentManagerField = () => {
  const { t } = useTranslation();
  const cm = useCmArguments();

  if (cm.loading) return <Skeleton className="h-40 w-full" />;

  const enabled = cm.arguments?.enabled ?? [];

  return (
    <div className="flex flex-col gap-4">
      {cm.error ? <ErrorCard error={cm.error} onDismiss={cm.dismissError} /> : null}

      <FieldGrid>
        {SETTINGS_CM_FLAGS.map((flag) => (
          <ToggleRow
            key={flag}
            label={t(`cmFlag.${flag}`)}
            hint={t(`cmFlagHint.${flag}`)}
            value={enabled.includes(flag)}
            disabled={cm.busy}
            onChange={(next) => cm.toggle(flag, next)}
          />
        ))}
      </FieldGrid>

      <p className="text-sm text-muted-foreground">{t('settings.contentManagerRestart')}</p>

      {cm.arguments?.exists === false ? (
        <p className="text-xs text-muted-foreground">{t('settings.contentManagerMissing')}</p>
      ) : null}
    </div>
  );
};

import { useTranslation } from 'react-i18next';

import { AiResultSkeleton } from './AiResultSkeleton.tsx';
import { AI_RANGE } from '../../../../shared/constants';
import { useFormat } from '@/i18n';

/**
 * GridFields while the field is read, in its own container and columns:
 * strength and aggression under their real labels and scale ends.
 */
export const GridFieldsSkeleton = () => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();

  return (
    <div className="@container">
      <div className="grid gap-3 @xl:grid-cols-2">
        <AiResultSkeleton
          label={t('editor.grid.strengthShort')}
          ends={[formatNumber(AI_RANGE.min), formatNumber(AI_RANGE.max)]}
        />
        <AiResultSkeleton label={t('editor.grid.aggressionShort')} ends={[t('race.ai.clean'), t('race.ai.ruthless')]} />
      </div>
    </div>
  );
};

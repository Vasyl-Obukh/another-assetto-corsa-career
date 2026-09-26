import { useTranslation } from 'react-i18next';

import { AI_RANGE } from '../../../../shared/constants';
import { Shimmer } from '@/components';
import { useFormat } from '@/i18n';

/**
 * One of the field's two figures while it is read, in `AiResult`'s own frame:
 * its real label and the ends of its scale, and the stepper, the figure, the
 * band and the drivers' spread still to come.
 * @param label The figure's label, already translated
 * @param ends What the scale's two ends are called
 * @returns The figure's block
 */
const aiResult = (label: string, ends: readonly [string, string]) => (
  <div className="flex flex-col gap-2.5 rounded-lg border p-3">
    <div className="flex items-center gap-2">
      <span className="flex-1 text-sm font-medium">{label}</span>
      <Shimmer className="h-9 w-28 rounded-md" />
    </div>
    <div className="flex items-end gap-x-2.5">
      <Shimmer className="h-6 w-10" />
      <Shimmer className="my-0.5 h-3 w-40" />
    </div>
    <div className="flex h-6 items-center">
      <Shimmer className="h-1.5 w-full rounded-full" />
    </div>
    <div className="flex items-center text-xs text-muted-foreground">
      <span className="flex-1">{ends[0]}</span>
      <Shimmer className="my-0.5 h-3 w-20" />
      <span className="flex-1 text-right">{ends[1]}</span>
    </div>
  </div>
);

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
        {aiResult(t('editor.grid.strengthShort'), [formatNumber(AI_RANGE.min), formatNumber(AI_RANGE.max)])}
        {aiResult(t('editor.grid.aggressionShort'), [t('race.ai.clean'), t('race.ai.ruthless')])}
      </div>
    </div>
  );
};

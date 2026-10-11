import { useTranslation } from 'react-i18next';

import { AI_RANGE } from '../../../../shared/constants';
import { Shimmer } from '@/components';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { useFormat } from '@/i18n';
import { AiResultSkeleton } from '@/screens/championship-editor';

interface StrengthCardSkeletonProps {
  /**
   * What the step is called, already translated.
   */
  label: string;
  /**
   * Whether the loaded card carries a note under the step.
   */
  note?: boolean;
}

/**
 * An AI strength card while its event is read: its title, the step's label and
 * the scale's ends for real, and the step, the sum, the band and the note
 * under them still to come.
 */
export const StrengthCardSkeleton = ({ label, note = true }: StrengthCardSkeletonProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();

  return (
    <Card className="gap-3 py-3">
      <CardHeader className="px-3">
        <CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t('strength.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-3">
        <AiResultSkeleton label={label} hint ends={[formatNumber(AI_RANGE.min), formatNumber(AI_RANGE.max)]} bare />
        {note ? <Shimmer className="h-9 w-full rounded-md" /> : null}
      </CardContent>
    </Card>
  );
};

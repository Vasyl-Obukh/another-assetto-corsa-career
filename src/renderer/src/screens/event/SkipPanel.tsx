import { SkipForwardIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { CareerEventView } from '../../../../shared/types';
import { SkipNote } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';

interface SkipPanelProps {
  /**
   * The round, one of the career's that the install cannot race.
   */
  view: CareerEventView;
  /**
   * Whether a command is in flight.
   */
  busy: boolean;
  /**
   * Called to skip it.
   */
  onSkip: () => void;
}

/**
 * Where a round of the career's that cannot be raced says so, and offers to
 * skip it - in place of the sessions it has none of to launch.
 */
export const SkipPanel = ({ view, busy, onSkip }: SkipPanelProps) => {
  const { t } = useTranslation();

  return (
    <Card className="py-4">
      <CardContent className="flex flex-col gap-3 px-4">
        <SkipNote
          title={view.historic ? t('event.skip.titleEvent') : t('event.skip.title')}
          hint={t('event.skip.hint')}
        />
        <div className="flex justify-end">
          <Button type="button" size="lg" variant="outline" disabled={busy} onClick={onSkip}>
            <SkipForwardIcon />
            {view.historic ? t('event.skip.actionEvent') : t('event.skip.action', { number: view.number })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

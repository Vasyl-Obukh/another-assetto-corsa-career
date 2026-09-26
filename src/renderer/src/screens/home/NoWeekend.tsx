import { ArrowRightIcon, CalendarPlusIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button.tsx';

interface NoWeekendProps {
  /**
   * Called to find something to enter.
   */
  onFind: () => void;
}

/**
 * What stands where the next weekend would, while the career has nothing
 * entered still to come.
 */
export const NoWeekend = ({ onFind }: NoWeekendProps) => {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col items-start justify-center gap-3 rounded-xl border border-dashed bg-card p-6">
      <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <CalendarPlusIcon className="size-5" />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{t('home.noWeekend')}</h2>
        <p className="text-sm text-muted-foreground">{t('home.noWeekendHint')}</p>
      </div>
      <Button onClick={onFind}>
        {t('home.findChampionship')}
        <ArrowRightIcon />
      </Button>
    </section>
  );
};

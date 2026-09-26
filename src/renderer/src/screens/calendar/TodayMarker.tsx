import type { Ref } from 'react';
import { useTranslation } from 'react-i18next';

import { useFormat } from '@/i18n';

interface TodayMarkerProps {
  /**
   * The ISO date the career's clock stands at.
   */
  today: string;
  /**
   * Handed the marker's element, which is what the calendar scrolls to.
   */
  ref?: Ref<HTMLDivElement>;
}

export const TodayMarker = ({ today, ref }: TodayMarkerProps) => {
  const { t } = useTranslation();
  const { formatDay } = useFormat();

  return (
    // Primary as a line and as text, never as a fill: primary is kept off chips.
    <div ref={ref} className="flex scroll-mt-4 items-center gap-4 py-3">
      <span className="w-[4.5rem] shrink-0 text-right text-[0.65rem] font-semibold tracking-wide text-primary uppercase">
        {t('calendar.today')}
      </span>
      <span className="h-0.5 flex-1 rounded-full bg-primary" />
      <span className="text-xs font-medium text-primary">{formatDay(today)}</span>
    </div>
  );
};

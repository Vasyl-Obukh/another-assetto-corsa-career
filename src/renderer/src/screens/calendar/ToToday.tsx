import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button.tsx';
import { useOffscreenDirection } from '@/hooks';
import { BACK_TO_TOP_POSITION } from '@/lib/layout';
import { cn } from '@/lib/utils';

interface ToTodayProps {
  /**
   * The scrolling element the calendar lives in.
   */
  scroller: HTMLElement | null;
  /**
   * The marker the career's today is drawn as.
   */
  marker: HTMLElement | null;
  /**
   * How much of the scroller's top the calendar's pinned header covers.
   */
  topInset: number;
  /**
   * Called to bring the marker back into view.
   */
  onJump: () => void;
}

/**
 * The calendar's own back-to-top: it goes back to today rather than to the top,
 * since the top of a season is January and the page is read from where the
 * career stands. So it points whichever way today is, and is not there at all
 * while today is on screen. Same place as the button it replaces, so the two
 * are never both looked for.
 */
export const ToToday = ({
  scroller, marker, topInset, onJump,
}: ToTodayProps) => {
  const { t } = useTranslation();
  const direction = useOffscreenDirection(scroller, marker, topInset);

  if (direction === null) return null;

  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      className={cn(BACK_TO_TOP_POSITION, 'z-30 rounded-full shadow-md')}
      aria-label={t('calendar.toToday')}
      title={t('calendar.toToday')}
      onClick={onJump}
    >
      {direction === 'up' ? <ArrowUpIcon /> : <ArrowDownIcon />}
    </Button>
  );
};

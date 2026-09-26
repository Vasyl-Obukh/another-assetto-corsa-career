import { ArrowUpIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button.tsx';
import { useScrolledPast } from '@/hooks';
import { BACK_TO_TOP_POSITION, WIDE_BACK_TO_TOP_POSITION } from '@/lib/layout';
import { cn } from '@/lib/utils';

interface BackToTopProps {
  /**
   * The scrolling element to watch and to scroll back up.
   */
  target: HTMLElement | null;
  /**
   * Whether the page's column takes the whole window, which puts the button in
   * the corner rather than beside the column.
   */
  wide?: boolean;
}

/**
 * A button in the bottom right corner that returns a long page to its top.
 *
 * Shown only once the top is out of sight, so a page that fits never carries
 * it.
 */
export const BackToTop = ({ target, wide = false }: BackToTopProps) => {
  const { t } = useTranslation();
  const scrolled = useScrolledPast(target);

  if (!scrolled) return null;

  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      className={cn(wide ? WIDE_BACK_TO_TOP_POSITION : BACK_TO_TOP_POSITION, 'z-30 rounded-full shadow-md')}
      aria-label={t('app.backToTop')}
      onClick={() => target?.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <ArrowUpIcon />
    </Button>
  );
};

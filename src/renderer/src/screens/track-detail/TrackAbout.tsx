import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CLAMPED_DESCRIPTION } from './constants.ts';
import { DetailPanel } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { cn } from '@/lib/utils.ts';

interface TrackAboutProps {
  /**
   * The author's description, line breaks kept.
   */
  description: string;
}

/**
 * The circuit's description in the author's own words - often a changelog for
 * a mod, so it is clamped until asked for.
 */
export const TrackAbout = ({ description }: TrackAboutProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(description.length <= CLAMPED_DESCRIPTION);

  return (
    <DetailPanel title={t('cars.detail.about')} className="flex flex-col items-start gap-1">
      <p className={cn('text-sm leading-relaxed whitespace-pre-line', !open && 'line-clamp-6')}>{description}</p>
      {open ? null : (
        <Button type="button" size="sm" variant="link" className="h-auto px-0" onClick={() => setOpen(true)}>
          {t('tracks.detail.readMore')}
        </Button>
      )}
    </DetailPanel>
  );
};

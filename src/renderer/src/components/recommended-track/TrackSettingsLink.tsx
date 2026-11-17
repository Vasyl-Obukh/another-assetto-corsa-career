import { ArrowRightIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button.tsx';
import { path } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';

interface TrackSettingsLinkProps {
  /**
   * The recommended layout to open the Tracks tab on, by its id.
   */
  layout: string;
  /**
   * Classes for the link.
   */
  className?: string;
}

/**
 * The way from a round its track stops to where that is put right: which track
 * a layout races is configuration, chosen on the Tracks tab and nowhere else.
 */
export const TrackSettingsLink = ({ layout, className }: TrackSettingsLinkProps) => {
  const { t } = useTranslation();

  return (
    <Button asChild variant="link" size="sm" className={cn('h-auto gap-1 px-0 has-[>svg]:px-0', className)}>
      <Link to={path.settingsTracks(layout)}>
        {t('recommendedTracks.settingsLink')}
        <ArrowRightIcon className="size-3.5" />
      </Link>
    </Button>
  );
};

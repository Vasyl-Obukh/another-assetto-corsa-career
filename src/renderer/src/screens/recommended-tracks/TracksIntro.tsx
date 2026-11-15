import { ExternalLinkIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { TRACK_SOURCE_PAGES } from '../../../../shared/constants';
import type { RecommendedTrackState } from '../../../../shared/types';
import { Button } from '@/components/ui/button.tsx';
import { useFormat } from '@/i18n';

interface TracksIntroProps {
  /**
   * Each layout's state by its id, or null while being read.
   */
  states: ReadonlyMap<string, RecommendedTrackState> | null;
}

/**
 * What the Tracks tab heads itself with: how many layouts are installed, and
 * the two places nearly every circuit is got from, said once.
 */
export const TracksIntro = ({ states }: TracksIntroProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const layouts = states ? [...states.values()] : [];
  const installed = layouts.filter((state) => state.source === 'found' || state.source === 'choice').length;

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5">
      <p className="min-w-80 flex-1 text-sm text-muted-foreground">
        {states ? (
          <span className="font-medium text-foreground">
            {t('recommendedTracks.summary', {
              installed: formatNumber(installed), total: formatNumber(layouts.length),
            })}
          </span>
        ) : null}
        {states ? ' ' : null}
        {t('recommendedTracks.hint')}
      </p>
      <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <span className="mr-1">{t('recommendedTracks.getFrom')}</span>
        {/* Plain anchors: createWindow sends them to the real browser. */}
        <Button asChild size="sm" variant="outline">
          <a href={TRACK_SOURCE_PAGES.lfm} target="_blank" rel="noreferrer">
            {t('recommendedTracks.sources.lfm')}
            <ExternalLinkIcon />
          </a>
        </Button>
        <Button asChild size="sm" variant="outline">
          <a href={TRACK_SOURCE_PAGES.list} target="_blank" rel="noreferrer">
            {t('recommendedTracks.sources.list')}
            <ExternalLinkIcon />
          </a>
        </Button>
      </div>
    </div>
  );
};

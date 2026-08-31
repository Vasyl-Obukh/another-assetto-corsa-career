import { ChevronLeftIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { LayoutTile } from './LayoutTile.tsx';
import type { Track, TrackGroup } from '../../../../shared/types';
import { Button } from '@/components/ui/button.tsx';

interface LayoutStepProps {
  /**
   * The circuit whose layouts are being chosen between.
   */
  group: TrackGroup;
  /**
   * The key of the layout already chosen, when there is one.
   */
  selectedKey?: string;
  /**
   * Called to go back to the list of circuits.
   */
  onBack: () => void;
  /**
   * Called with the layout that was picked.
   * @param layout The chosen layout
   */
  onPick: (layout: Track) => void;
}

export const LayoutStep = ({
  group, selectedKey, onBack, onPick,
}: LayoutStepProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-2 px-6 pb-2">
        <Button type="button" size="sm" variant="ghost" onClick={onBack}>
          <ChevronLeftIcon />
          {t('race.pick.allTracks')}
        </Button>
        <span className="truncate text-sm text-muted-foreground">{group.name}</span>
      </div>

      {/* Vertical room for a tile's hover halo, which is a 22px bloom and gets
          clipped against the top of the scroller without it. */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-2 pb-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {group.layouts.map((layout) => (
            <LayoutTile
              key={layout.key}
              layout={layout}
              selected={layout.key === selectedKey}
              onPick={() => onPick(layout)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

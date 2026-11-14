import { ScissorsIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { BriefTile } from './BriefTile.tsx';
import { RaceLength } from './RaceLength.tsx';
import type { RaceLengthControl } from './types.ts';
import {
  scaleName, sessionLength, shareOf, shortLaps,
} from './utils.ts';
import type { EventSession } from '../../../../shared/types';
import { scalesFor } from '../../../../shared/utils/race-scale';
import { Button } from '@/components/ui/button.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { useUnits } from '@/hooks';
import { useFormat } from '@/i18n';

interface LengthTileProps {
  /**
   * The session to brief.
   */
  session: EventSession;
  /**
   * How the race is shortened for its launch, when it can be. Absent for a
   * session that is not run next, or not a career round's.
   */
  length?: RaceLengthControl;
}

/**
 * How long a session runs, and for a race about to be launched the way to
 * shorten it: a button in the tile's corner opening the race length control,
 * with the tile following whichever step is picked.
 */
export const LengthTile = ({ session, length }: LengthTileProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const units = useUnits();

  const laps = session.type === 'race' ? session.laps : undefined;
  // A race too short to shorten offers only the full race, and no button.
  const control = length && laps !== undefined && scalesFor(laps).length > 1 ? { ...length, laps } : null;
  const scale = control?.scale ?? 1;

  return (
    <BriefTile
      label={t('event.brief.length')}
      action={control ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="h-7 gap-1.5 px-2 text-xs">
              <ScissorsIcon className="size-3.5" />
              {scale > 1 ? scaleName(scale, t) : t('event.length.shorten')}
            </Button>
          </PopoverTrigger>
          {/* To the button's right: the button sits in the tile's right corner
              and its label changes width with the step, so only its right edge
              stays put while the slider is dragged. */}
          <PopoverContent side="right" align="start" className="w-[26rem]">
            <RaceLength laps={control.laps} scale={scale} disabled={control.disabled} onChange={control.onChange} />
          </PopoverContent>
        </Popover>
      ) : null}
    >
      <span className="text-lg font-semibold">
        {laps !== undefined && scale > 1
          ? shortLaps(laps, scale, t)
          : sessionLength(session, t, formatNumber, units) ?? '-'}
      </span>
      {laps !== undefined && scale > 1 ? (
        <span className="text-xs text-muted-foreground">
          {shareOf(laps, scale, t, formatNumber)}
        </span>
      ) : null}
    </BriefTile>
  );
};

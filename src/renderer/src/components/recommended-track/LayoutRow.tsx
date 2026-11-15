import {
  CheckIcon, MapIcon, MoreVerticalIcon, RotateCcwIcon, XIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import type { RecommendedLayout, RecommendedTrackState } from '../../../../shared/types';
import { Shimmer } from '@/components/Shimmer.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import type { RecommendedTracks } from '@/hooks';
import { useUnits } from '@/hooks';
import { TRACK_STATE_ACCENT } from '@/lib/accents';
import { path } from '@/lib/routes';
import { rowKind, shownTrack } from '@/lib/track-rows';

interface LayoutRowProps {
  /**
   * The recommended layout.
   */
  layout: RecommendedLayout;
  /**
   * What it races as the install stands, or null while that is being read.
   */
  state: RecommendedTrackState | null;
  /**
   * The actions its buttons take.
   */
  tracks: RecommendedTracks;
  /**
   * Called to choose a track for it.
   */
  onChoose: () => void;
  /**
   * Whether its menu may open the track's page - not in first-run setup, which
   * stands in for the whole app until it is done.
   */
  trackPages: boolean;
}

/**
 * One layout of a recommended circuit: where the track it races came from, the
 * track itself, and the same Choose on every row, with a menu wherever there is
 * a track to talk about.
 */
export const LayoutRow = ({
  layout, state, tracks, onChoose, trackPages,
}: LayoutRowProps) => {
  const { t } = useTranslation();
  const units = useUnits();
  const navigate = useNavigate();

  const kind = state ? rowKind(state) : null;
  const shown = shownTrack(state);
  const undo = kind === 'choice' || kind === 'guess';

  return (
    // Every row the height of a two-line one, so a layout with nothing
    // installed lines up with its neighbours.
    <div className="grid min-h-15 grid-cols-[minmax(8rem,13rem)_7.5rem_minmax(0,1fr)_auto] items-center gap-3.5 border-t px-4 py-2 first:border-t-0">
      <span className="font-medium">{layout.name}</span>

      {kind ? (
        <Badge className={TRACK_STATE_ACCENT[kind]}>{t(`recommendedTracks.state.${kind}`)}</Badge>
      ) : <Shimmer className="h-5 w-20" />}

      <div className="flex min-w-0 flex-col gap-0.5">
        {state === null ? <Shimmer className="h-4 w-48" /> : null}
        {shown ? (
          <>
            <span className="truncate text-sm">
              {kind === 'guess' ? t('recommendedTracks.looksLike', { name: shown.name }) : shown.name}
            </span>
            <span className="flex flex-wrap gap-x-2.5 text-xs text-muted-foreground tabular-nums">
              <span className="max-w-full truncate font-mono" title={shown.key}>{shown.key}</span>
              {shown.lengthM === null ? null : <span>{units.formatLap(shown.lengthM)}</span>}
              {shown.pitboxes === null ? null : <span>{t('tracks.pitboxes', { count: shown.pitboxes })}</span>}
            </span>
          </>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-1.5">
        {kind === 'guess' && shown ? (
          <Button size="sm" onClick={() => tracks.accept(layout.id, shown)}>
            <CheckIcon />
            {t('recommendedTracks.useIt')}
          </Button>
        ) : null}
        <Button size="sm" variant="outline" disabled={state === null} onClick={onChoose}>
          {t('recommendedTracks.choose')}
        </Button>

        {shown && (trackPages || undo) ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8" aria-label={t('recommendedTracks.menu')}>
                <MoreVerticalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {trackPages ? (
                <DropdownMenuItem
                  onSelect={() => { void navigate(path.track({ id: shown.id }, shown.layout || undefined)); }}
                >
                  <MapIcon />
                  {t('recommendedTracks.openTrack')}
                </DropdownMenuItem>
              ) : null}
              {trackPages && undo ? <DropdownMenuSeparator /> : null}
              {kind === 'choice' ? (
                <DropdownMenuItem onSelect={() => tracks.forget(layout.id)}>
                  <RotateCcwIcon />
                  {t('recommendedTracks.forget')}
                </DropdownMenuItem>
              ) : null}
              {kind === 'guess' ? (
                <DropdownMenuItem onSelect={() => tracks.refuse(layout.id, shown.key)}>
                  <XIcon />
                  {t('recommendedTracks.refuse')}
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          // The menu's room, so every Choose lines up.
          <span className="size-8" />
        )}
      </div>
    </div>
  );
};

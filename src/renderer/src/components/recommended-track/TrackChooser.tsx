import { CheckIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { OutgrownDialog } from './OutgrownDialog.tsx';
import type { Choice } from './types.ts';
import type { SeriesListing } from '../../../../shared/types';
import type { RecommendedEntry } from '../../../../shared/utils/recommended-tracks';
import { useToast } from '@/app';
import { TrackPicker } from '@/components/content-picker/index.ts';
import type { RecommendedTracks } from '@/hooks';
import { useFormat } from '@/i18n';
import { TRACK_STATE_ACCENT } from '@/lib/accents';
import type { CircuitUsage, LayoutField } from '@/lib/circuit-usage';
import { outgrown } from '@/lib/circuit-usage';

interface TrackChooserProps {
  /**
   * The recommended layout a track is being chosen for, or null while the
   * picker is closed.
   */
  choosing: RecommendedEntry | null;
  /**
   * The actions a choice is written through.
   */
  tracks: RecommendedTracks;
  /**
   * Every championship and historic event, whose fields a track is judged
   * against.
   */
  listings: readonly SeriesListing[];
  /**
   * The biggest field racing each layout, by the layout's id.
   */
  fields: ReadonlyMap<string, LayoutField>;
  /**
   * How much of the library races each circuit, for the toast a choice raises.
   */
  usage: ReadonlyMap<string, CircuitUsage>;
  /**
   * Called as the picker closes, chosen or not.
   */
  onClose: () => void;
}

/**
 * The track picker over every installed track, in the library or not, choosing
 * the track a recommended layout races. A track too small for a championship
 * racing the layout is chipped in the picker, and asked about before it is
 * chosen.
 */
export const TrackChooser = ({
  choosing, tracks, listings, fields, usage, onClose,
}: TrackChooserProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const { show } = useToast();
  // What was picked and what it would cost, while that is asked.
  const [asking, setAsking] = useState<Choice | null>(null);
  // The layout a pick being asked about was for, which keeps the picker open
  // beneath the question once choosing is cleared: the picker closes as it
  // picks, and cancelling goes back to it as it was left.
  const [held, setHeld] = useState<RecommendedEntry | null>(null);
  const entry = choosing ?? held;

  /**
   * Names a layout as the picker and the toast do.
   * @param layout The layout and its circuit
   * @returns Its name
   */
  const nameOf = (layout: RecommendedEntry): string => t('recommendedTracks.layoutName', {
    circuit: layout.circuit.name, layout: layout.layout.name,
  });

  /**
   * Races the layout on a track, and says so.
   * @param choice The layout, the track and the championships it is too small for
   */
  const choose = ({ entry: chosen, track, short }: Choice): void => {
    tracks.choose(chosen.layout.id, track);
    const racing = usage.get(chosen.circuit.id)?.championships;
    const detail = racing
      ? t('recommendedTracks.chosenDetail', { count: racing, shown: formatNumber(racing) })
      : null;
    const lost = short.length > 0
      ? t('recommendedTracks.chosenShort', { count: short.length, shown: formatNumber(short.length) })
      : null;
    show({
      icon: CheckIcon,
      tone: TRACK_STATE_ACCENT.choice,
      title: t('recommendedTracks.chosen', { layout: nameOf(chosen), track: track.name }),
      ...(detail || lost ? { detail: [detail, lost].filter(Boolean).join(' ') } : {}),
    });
  };

  return (
    <>
      <TrackPicker
        open={entry !== null}
        everything
        gridSize={entry ? fields.get(entry.layout.id)?.field : undefined}
        heading={{
          title: t('recommendedTracks.chooseTitle', { layout: entry ? nameOf(entry) : '' }),
          hint: t('recommendedTracks.chooseHint'),
        }}
        selectedKey={entry ? tracks.states?.get(entry.layout.id)?.track?.key : undefined}
        onOpenChange={(open) => {
          if (open) return;
          setHeld(null);
          onClose();
        }}
        onPick={(track) => {
          if (!entry) return;
          const choice = { entry, track, short: outgrown(listings, entry.layout.id, track.pitboxes) };
          if (choice.short.length === 0) {
            choose(choice);
            return;
          }
          setHeld(entry);
          setAsking(choice);
        }}
      />

      <OutgrownDialog
        title={asking
          ? t('recommendedTracks.outgrown.title', { layout: nameOf(asking.entry), track: asking.track.name })
          : ''}
        pitboxes={asking?.track.pitboxes ?? 0}
        championships={asking?.short ?? null}
        onConfirm={() => {
          if (asking) choose(asking);
          setAsking(null);
          setHeld(null);
        }}
        onClose={() => setAsking(null)}
      />
    </>
  );
};

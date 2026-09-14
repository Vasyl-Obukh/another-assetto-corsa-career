import { MapIcon, MapPinIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  isLocated, lengthRange, pitboxRange, trackImageSources,
} from './utils.ts';
import type { TrackGroup } from '../../../../shared/types';
import { ContentImage, ProvenanceBadges, ToggleCard } from '@/components';
import type { BrowserToggle } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Card } from '@/components/ui/card.tsx';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';

interface TrackCardProps {
  /**
   * The track to show, holding the layouts that matched the filters.
   */
  group: TrackGroup;
  /**
   * Called with the circuit when the card is used as a picker.
   *
   * The circuit rather than a layout, even though a layout is what race.ini
   * runs on: which layout is a second question, and it is asked with pictures
   * of the layouts rather than with their names, since a name like "Endurance"
   * says nothing at all about the shape of the thing.
   */
  onSelect?: (group: TrackGroup) => void;
  /**
   * The key of the layout that is the current answer, when one has been picked.
   */
  selectedKey?: string;
  /**
   * A switch on the card, for a browser deciding something about each circuit.
   * Wins over `onSelect`: the card flips its switch rather than answering.
   */
  toggle?: BrowserToggle;
}

export const TrackCard = ({
  group, onSelect, selectedKey, toggle,
}: TrackCardProps) => {
  const { t } = useTranslation();
  const { formatDistance } = useFormat();

  // Layouts of one circuit disagree about grid size - an LFM pit lane holds 48
  // where Kunos' holds 24 - so the badge spans them rather than picking one.
  const pitboxes = pitboxRange(group);
  let pitboxLabel = t('tracks.unknownPitboxes');
  if (pitboxes !== null) {
    pitboxLabel = pitboxes.from === pitboxes.to
      ? t('tracks.pitboxes', { count: pitboxes.to })
      : t('tracks.pitboxesRange', pitboxes);
  }

  // Length spans them for the same reason: the Nordschleife ships a 3.8 km
  // sprint beside a 25.4 km endurance layout.
  const length = lengthRange(group);
  const lengthLabel = length === null ? null : t('tracks.lengthRange', {
    from: formatDistance(length.from),
    to: formatDistance(length.to),
  });

  const picked = group.layouts.some((layout) => layout.key === selectedKey);
  const on = toggle?.isOn(group.id) ?? false;

  const card = (
    <Card className={cn(
      'h-full gap-0 overflow-hidden py-0',
      '[contain-intrinsic-size:auto_18rem] [content-visibility:auto]',
      onSelect && 'transition-[box-shadow,border-color] hover:border-primary hover:shadow-[0_0_20px_2px] hover:shadow-primary/55',
      toggle && 'transition-[border-color] hover:border-primary',
      picked && 'border-primary shadow-[0_0_20px_2px] shadow-primary/55',
      on && 'border-primary',
    )}
    >
      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-muted">
        <ContentImage
          sources={trackImageSources(group)}
          alt={group.name}
          // The second source is an outline: black on transparent, so it
          // disappears in the dark theme without being inverted.
          className="object-cover [&[src*='/outline']]:object-contain [&[src*='/outline']]:p-4 dark:[&[src*='/outline']]:invert"
          fallback={(
            <div className="absolute inset-0 flex items-center justify-center">
              <MapIcon className="size-10 text-muted-foreground/40" />
            </div>
          )}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-2 p-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate font-medium" title={group.name}>{group.name}</span>
          <span className="truncate text-xs text-muted-foreground">
            {group.country ?? t('browse.unknown')}
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          {/* No Custom badge on a toggling card: its switch already says so. */}
          <ProvenanceBadges provenance={group.provenance} trackId={toggle ? undefined : group.id} />
          {group.layouts.length > 1 ? (
            <Badge variant="secondary">
              {t('tracks.layouts', { count: group.layouts.length })}
            </Badge>
          ) : null}
          {lengthLabel ? <Badge variant="outline">{lengthLabel}</Badge> : null}
          <Badge variant="outline">{pitboxLabel}</Badge>
          {isLocated(group) ? (
            <Badge variant="outline">
              <MapPinIcon />
              {t('tracks.located')}
            </Badge>
          ) : null}
        </div>
      </div>
    </Card>
  );

  if (toggle) {
    return (
      <ToggleCard checked={on} label={group.name} onChange={(next) => toggle.onToggle(group.id, next)}>
        {card}
      </ToggleCard>
    );
  }

  if (!onSelect) return card;

  return (
    <button
      type="button"
      onClick={() => onSelect(group)}
      className="block w-full rounded-xl text-left focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      {card}
    </button>
  );
};

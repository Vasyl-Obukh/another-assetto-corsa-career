import { MapPinIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';

import { TRACK_COLUMN } from './constants.ts';
import {
  isLocated, layoutOutline, lengthText, spanOf, spanText,
} from './utils.ts';
import type { TrackGroup } from '../../../../shared/types';
import { nationOfCountry } from '../../../../shared/utils/nations';
import {
  ContentImage, NationFlag, ProvenanceBadges, RacedIn, SWITCH_TRACK,
} from '@/components';
import type { BrowserToggle } from '@/components';
import { Switch } from '@/components/ui/switch.tsx';
import { useUnits } from '@/hooks';
import { useFormat } from '@/i18n';
import type { Racing } from '@/lib/racing-index';
import { path } from '@/lib/routes';
import type { NavState } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';

interface TrackRowProps {
  /**
   * The track to show, holding the layouts that matched the filters.
   */
  group: TrackGroup;
  /**
   * Which championships race there, or undefined when none does.
   */
  racing: Racing | undefined;
  /**
   * Called with the circuit when the table is picked from rather than read.
   */
  onSelect?: (group: TrackGroup) => void;
  /**
   * The key of the layout that is the current answer, when one has been picked.
   */
  selectedKey?: string;
  /**
   * A switch on the row, for a browser deciding something about each circuit.
   */
  toggle?: BrowserToggle;
}

/**
 * One circuit as a line of the comparison table.
 */
export const TrackRow = ({
  group, racing, onSelect, selectedKey, toggle,
}: TrackRowProps) => {
  const { t } = useTranslation();
  const { formatNation, formatNumber } = useFormat();
  const units = useUnits();
  const nation = nationOfCountry(group.country);
  const [first] = group.layouts;
  const outline = first === undefined ? null : layoutOutline(first);
  const picked = group.layouts.some((layout) => layout.key === selectedKey);
  const navigate = useNavigate();
  // Picking answers the picker; reading opens the circuit's page, and so does
  // toggling where the toggle names a section - otherwise the row flips its
  // switch. The name is what is focused, and the rest of the row is a larger
  // target for the pointer.
  const pick = toggle === undefined && onSelect !== undefined ? () => onSelect(group) : undefined;
  const flip = toggle !== undefined && toggle.section === undefined
    ? () => toggle.onToggle(group.id, !toggle.isOn(group.id))
    : undefined;
  const state = toggle?.section === undefined ? undefined : { section: toggle.section } satisfies NavState;
  const open = (): void => {
    navigate(path.track({ id: group.id }), { state });
  };
  let name = (
    <Link
      to={path.track({ id: group.id })}
      state={state}
      className="font-semibold hover:underline"
      onClick={(event) => event.stopPropagation()}
    >
      {group.name}
    </Link>
  );
  if (flip !== undefined) name = <span className="font-semibold">{group.name}</span>;
  else if (pick !== undefined) {
    name = (
      <button
        type="button"
        className="text-left font-semibold hover:underline"
        onClick={(event) => {
          event.stopPropagation();
          pick();
        }}
      >
        {group.name}
      </button>
    );
  }
  const dash = <span className="text-muted-foreground">{t('common.dash')}</span>;
  const length = lengthText(group.layouts, units);
  const pitboxes = spanText(spanOf(group.layouts, (layout) => layout.pitboxes), formatNumber);
  const place = (
    <>
      <NationFlag code={nation ?? undefined} />
      <span className="truncate">{nation === null ? (group.country ?? t('browse.unknown')) : formatNation(nation)}</span>
    </>
  );

  return (
    <tr
      className={cn(
        'border-t first:border-t-0 hover:bg-accent/50',
        'cursor-pointer',
        picked && 'bg-primary/8',
      )}
      onClick={pick ?? flip ?? open}
    >
      {toggle === undefined ? null : (
        <td className="w-14 px-2.5 py-1.5" onClick={(event) => event.stopPropagation()}>
          <Switch
            checked={toggle.isOn(group.id)}
            aria-label={group.name}
            className={SWITCH_TRACK}
            onCheckedChange={(next) => toggle.onToggle(group.id, next)}
          />
        </td>
      )}
      <td className="w-20 py-1.5 pr-1 pl-2.5 @[44rem]:w-28">
        <div className="relative h-10 w-16 rounded-md bg-muted @[44rem]:h-13 @[44rem]:w-24">
          {outline === null ? null : (
            <ContentImage
              sources={[outline]}
              alt=""
              className="object-contain p-1.5 opacity-75 brightness-0 dark:invert"
              fallback={null}
            />
          )}
        </div>
      </td>
      <td className="px-2.5 py-1.5">
        <div className="flex min-w-0 flex-col gap-0.5">
          {name}
          <span className={cn('flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground', TRACK_COLUMN.inline)}>
            {place}
            <ProvenanceBadges provenance={group.provenance} trackId={toggle ? undefined : group.id} />
          </span>
        </div>
      </td>
      <td className={cn('px-2.5 py-1.5', TRACK_COLUMN.wide)}>
        <span className="flex items-center gap-1.5 text-muted-foreground">{place}</span>
      </td>
      <td className={cn('px-2.5 py-1.5 text-right whitespace-nowrap tabular-nums', TRACK_COLUMN.layouts)}>
        {formatNumber(group.layouts.length)}
      </td>
      <td className="px-2.5 py-1.5 text-right whitespace-nowrap tabular-nums">{length ?? dash}</td>
      <td className="px-2.5 py-1.5 text-right whitespace-nowrap tabular-nums">{pitboxes ?? dash}</td>
      <td className={cn('px-2.5 py-1.5', TRACK_COLUMN.located)}>
        {isLocated(group)
          ? <MapPinIcon className="size-4 text-muted-foreground" aria-label={t('tracks.locatedHint')} />
          : dash}
      </td>
      <td className="px-2.5 py-1.5"><RacedIn racing={racing} compact /></td>
      <td className={cn('px-2.5 py-1.5', TRACK_COLUMN.wide)}>
        <div className="flex flex-wrap gap-1">
          <ProvenanceBadges provenance={group.provenance} trackId={toggle ? undefined : group.id} />
        </div>
      </td>
    </tr>
  );
};

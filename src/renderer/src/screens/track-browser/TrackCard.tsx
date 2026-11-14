import { MapIcon, MapPinIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { LAYOUT_OUTLINES } from './constants.ts';
import {
  isLocated, layoutOutline, lengthText, spanOf, spanText, trackImageSources,
} from './utils.ts';
import type { TrackGroup } from '../../../../shared/types';
import { nationOfCountry } from '../../../../shared/utils/nations';
import {
  CARD_LINK, ContentImage, FigureLine, NationFlag, PosterCaption, ProvenanceBadges, RacedIn, ToggleCard,
} from '@/components';
import type { BrowserToggle } from '@/components';
import { Card } from '@/components/ui/card.tsx';
import { useUnits } from '@/hooks';
import { useFormat } from '@/i18n';
import type { Racing } from '@/lib/racing-index';
import { path } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';

interface TrackCardProps {
  /**
   * The track to show, holding the layouts that matched the filters.
   */
  group: TrackGroup;
  /**
   * Which championships race there, or undefined when none does.
   */
  racing: Racing | undefined;
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
   * Wins over `onSelect`: the card flips its switch, or opens the circuit's
   * page where the toggle names a section, rather than answering.
   */
  toggle?: BrowserToggle;
}

export const TrackCard = ({
  group, racing, onSelect, selectedKey, toggle,
}: TrackCardProps) => {
  const { t } = useTranslation();
  const { formatNation, formatNumber } = useFormat();
  const units = useUnits();

  const picked = group.layouts.some((layout) => layout.key === selectedKey);
  const on = toggle?.isOn(group.id) ?? false;
  const nation = nationOfCountry(group.country);
  const [first] = group.layouts;
  const outline = first === undefined ? null : layoutOutline(first);
  const length = lengthText(group.layouts, units);
  const pitboxes = spanText(spanOf(group.layouts, (layout) => layout.pitboxes), formatNumber);
  // A circuit with more layouts than fit shows one fewer, and how many are left.
  const outlines = group.layouts.length > LAYOUT_OUTLINES
    ? group.layouts.slice(0, LAYOUT_OUTLINES - 1)
    : group.layouts;

  const card = (
    <Card className={cn(
      'h-full gap-0 overflow-hidden py-0',
      '[contain-intrinsic-size:auto_22rem] [content-visibility:auto]',
      'hover-outline',
      picked && '[--outline-rest:var(--color-primary)]',
      on && 'border-primary',
    )}
    >
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-muted">
        <ContentImage
          sources={trackImageSources(group)}
          alt={group.name}
          // The second source is an outline: drawn flat in the text colour, so
          // it reads in either theme whatever colour the mod drew it in.
          className="object-cover [&[src*='/outline']]:object-contain [&[src*='/outline']]:p-4 [&[src*='/outline']]:pb-16 [&[src*='/outline']]:brightness-0 dark:[&[src*='/outline']]:invert"
          fallback={(
            <div className="absolute inset-0 flex items-center justify-center pb-12">
              <MapIcon className="size-10 text-muted-foreground/40" />
            </div>
          )}
        />
        {/* No Custom chip on a toggling card: its switch already says so. */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1 [&>*]:shadow-sm">
          <ProvenanceBadges provenance={group.provenance} trackId={toggle ? undefined : group.id} />
        </div>
        {/* The shape over the photograph, since the shape is what tells
            circuits apart. Outlines ship white, black or both, so it is
            flattened to the scrim's text colour over the scrim. */}
        {outline === null ? null : (
          <div
            className={cn(
              'absolute right-2 grid aspect-[4/3] w-[30%] place-items-center rounded-lg bg-scrim/55 p-1.5 backdrop-blur-sm',
              // Below the switch a toggling card wears in that corner.
              toggle ? 'top-12' : 'top-2',
            )}
          >
            <ContentImage
              sources={[outline]}
              alt=""
              className="object-contain p-1.5 brightness-0 invert"
              fallback={null}
            />
          </div>
        )}
        <PosterCaption
          name={group.name}
          overline={(
            <>
              {nation === null ? null : <NationFlag code={nation} />}
              <span className="truncate">{nation === null ? (group.country ?? t('browse.unknown')) : formatNation(nation)}</span>
              {isLocated(group) ? (
                <span title={t('tracks.locatedHint')} className="ml-auto shrink-0">
                  <MapPinIcon className="size-3.5" />
                </span>
              ) : null}
            </>
          )}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2.5 p-3">
        <FigureLine figures={[
          { unit: units.unit('distance'), value: length },
          { unit: t('tracks.stat.pitboxes'), value: pitboxes },
          {
            unit: t('tracks.stat.layouts', { count: group.layouts.length }),
            value: formatNumber(group.layouts.length),
          },
        ]}
        />

        {group.layouts.length > 1 ? (
          <div className="flex gap-1.5">
            {outlines.map((layout) => {
              const source = layoutOutline(layout);

              return (
                <span key={layout.key} title={layout.name} className="relative h-8 w-11 rounded-md bg-muted">
                  {source === null ? null : (
                    <ContentImage
                      sources={[source]}
                      alt=""
                      className="object-contain p-1 opacity-70 brightness-0 dark:invert"
                      fallback={null}
                    />
                  )}
                </span>
              );
            })}
            {outlines.length < group.layouts.length ? (
              <span className="grid h-8 w-11 place-items-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                {t('tracks.layoutsMore', { count: group.layouts.length - outlines.length })}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto pt-0.5">
          <RacedIn racing={racing} />
        </div>
      </div>
    </Card>
  );

  if (toggle) {
    return (
      <ToggleCard
        checked={on}
        label={group.name}
        onChange={(next) => toggle.onToggle(group.id, next)}
        to={path.track({ id: group.id })}
        section={toggle.section}
      >
        {card}
      </ToggleCard>
    );
  }

  if (!onSelect) return <Link to={path.track({ id: group.id })} className={CARD_LINK}>{card}</Link>;

  return (
    <button type="button" onClick={() => onSelect(group)} className={CARD_LINK}>
      {card}
    </button>
  );
};

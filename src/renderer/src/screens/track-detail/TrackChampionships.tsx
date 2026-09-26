import { ChevronRightIcon, FlagIcon, TrophyIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { CHAMPIONSHIPS_PER_DISCIPLINE } from './constants.ts';
import type { CircuitChampionship } from './types.ts';
import {
  byDiscipline, layoutShortName, longestFirst, racingOn,
} from './utils.ts';
import type { Discipline, Track, TrackGroup } from '../../../../shared/types';
import { DetailPanel } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useFormat } from '@/i18n';
import { DISCIPLINE_DOT } from '@/lib/accents';
import { path } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';
import { disciplineKey, LadderChip } from '@/screens/championships';

interface TrackChampionshipsProps {
  /**
   * The circuit.
   */
  circuit: TrackGroup;
  /**
   * The layout the page is turned to, or null for the whole circuit.
   */
  layout: Track | null;
  /**
   * Every championship at the circuit.
   */
  championships: readonly CircuitChampionship[];
  /**
   * The championships the career is entered in this season.
   */
  entered: ReadonlySet<string>;
  /**
   * Turns the page to a layout, or back to the whole circuit.
   * @param next The layout, or null
   */
  onChoose: (next: Track | null) => void;
}

/**
 * The championships racing at a circuit, grouped by discipline, each with the
 * round it runs here and on which layout. Each discipline folds after a few,
 * so one with twenty seasons never hides the rest.
 */
export const TrackChampionships = ({
  circuit, layout, championships, entered, onChoose,
}: TrackChampionshipsProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const [open, setOpen] = useState<ReadonlySet<Discipline>>(new Set());

  const many = circuit.layouts.length > 1;
  const shown = layout === null ? championships : racingOn(championships, layout.layout);
  const raced = longestFirst(circuit.layouts).filter((one) => racingOn(championships, one.layout).length > 0);
  const nameOf = (folder: string): string => {
    const one = circuit.layouts.find((candidate) => candidate.layout === folder);
    return one === undefined ? folder : layoutShortName(one, circuit.name);
  };

  return (
    <DetailPanel
      title={t('tracks.detail.racedHere')}
      icon={<TrophyIcon />}
      aside={(
        <>
          <span className="font-normal text-muted-foreground tabular-nums">{formatNumber(shown.length)}</span>
          {many && raced.length > 0 ? (
            <span className="ml-auto flex flex-wrap gap-0.5 rounded-lg bg-muted p-0.5 text-xs font-normal">
              {[null, ...raced].map((one) => {
                const on = (one?.key ?? null) === (layout?.key ?? null);
                const count = one === null ? championships.length : racingOn(championships, one.layout).length;

                return (
                  <button
                    key={one?.key ?? ''}
                    type="button"
                    aria-pressed={on}
                    onClick={() => onChoose(one)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-muted-foreground',
                      on && 'bg-card font-semibold text-foreground shadow-xs',
                    )}
                  >
                    {one === null ? t('tracks.detail.allLayouts') : layoutShortName(one, circuit.name)}
                    <span className="tabular-nums opacity-80">{formatNumber(count)}</span>
                  </button>
                );
              })}
            </span>
          ) : null}
        </>
      )}
      className="pt-1"
    >
      {shown.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          {layout === null
            ? t('tracks.detail.noneHere')
            : t('tracks.detail.noneOnLayout', { layout: layoutShortName(layout, circuit.name) })}
        </p>
      ) : null}

      <div className="grid gap-2 xl:grid-cols-2">
        {byDiscipline(shown).map(({ discipline, championships: rows }) => {
          const all = open.has(discipline);
          const visible = all ? rows : rows.slice(0, CHAMPIONSHIPS_PER_DISCIPLINE);

          return [
            <h3
              key={discipline}
              className="col-span-full flex items-center gap-2 pt-3 pb-0.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase first:pt-1"
            >
              <i aria-hidden className={cn('size-2 rounded-full', DISCIPLINE_DOT[discipline])} />
              {t(disciplineKey(discipline))}
              <span className="font-normal tabular-nums">{formatNumber(rows.length)}</span>
            </h3>,
            ...visible.map((championship) => {
              const here = layout === null
                ? championship.rounds
                : championship.rounds.filter((round) => round.layout === layout.layout);
              const [round] = here;
              const layouts = [...new Set(here.map((one) => nameOf(one.layout)))].join(t('tracks.detail.listSeparator'));

              return (
                <Link
                  key={championship.id}
                  to={path.championship({ id: championship.id })}
                  className={cn(
                    'group grid grid-cols-[4px_minmax(0,1fr)_auto] items-center gap-x-3 rounded-lg border bg-card',
                    'hover-outline py-2.5 pr-2.5 pl-3 shadow-xs',
                    'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                  )}
                >
                  <i aria-hidden className={cn('self-stretch rounded-full', DISCIPLINE_DOT[championship.discipline])} />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-semibold group-hover:text-primary">{championship.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {many && round !== undefined
                        ? t('tracks.detail.roundOn', { round: round.name, layout: layouts })
                        : round?.name}
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {championship.ladders.map((ladder) => (
                        <LadderChip key={`${ladder.discipline}:${ladder.tier}`} ladder={ladder} />
                      ))}
                      {/* Whose season this is, not one of a set - neutral. */}
                      {entered.has(championship.id) ? (
                        <Badge variant="secondary">
                          <FlagIcon />
                          {t('tracks.detail.yourCareer')}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                  <ChevronRightIcon className="size-4 text-muted-foreground group-hover:text-primary" />
                </Link>
              );
            }),
            rows.length > visible.length ? (
              <Button
                key={`${discipline}-more`}
                type="button"
                size="sm"
                variant="ghost"
                className="col-span-full -ml-2.5 justify-self-start text-muted-foreground"
                onClick={() => setOpen(new Set([...open, discipline]))}
              >
                {t('tracks.detail.more', {
                  count: rows.length - visible.length,
                  discipline: t(disciplineKey(discipline)).toLowerCase(),
                })}
              </Button>
            ) : null,
          ];
        })}
      </div>
    </DetailPanel>
  );
};

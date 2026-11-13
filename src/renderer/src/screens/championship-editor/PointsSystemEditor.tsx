import { CopyIcon } from 'lucide-react';
import { useState } from 'react';


import { MAX_BONUS_POINTS, MIN_POINTS, POINTS_TEMPLATES } from './constants.ts';
import { NumberedStep } from './NumberedStep.tsx';
import { OffsetStepper } from './OffsetStepper.tsx';
import { PlaceStrip } from './PlaceStrip.tsx';
import { RacesPaying } from './RacesPaying.tsx';
import { RowActions } from './RowActions.tsx';
import type { PointsTemplate } from './types.ts';
import {
  nextPoints, withAddedPoints, withoutPoints, withPoints,
} from './utils.ts';
import type { Championship, PointsSystem } from '../../../../shared/types';
import { ConfirmDialog } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import { useKindTranslation } from '@/i18n';
import { cn } from '@/lib/utils.ts';

interface PointsSystemEditorProps {
  /**
   * The championship, for the races the system is paid by.
   */
  series: Championship;
  /**
   * The system being edited.
   */
  points: PointsSystem;
  /**
   * Whether an event is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Called with the championship whenever the system changes.
   * @param next The championship
   */
  onChange: (next: Championship) => void;
  /**
   * Called to pick another system, after one is added or removed.
   * @param id Its id
   */
  onPick: (id: string) => void;
}

/**
 * One points system, worked top to bottom: optionally start from a real
 * table, then the finishing places, the qualifying places, the fastest lap,
 * and which races pay it.
 */
export const PointsSystemEditor = ({
  series, points, locked, onChange, onPick,
}: PointsSystemEditorProps) => {
  const { t } = useKindTranslation();
  const [template, setTemplate] = useState<PointsTemplate | null>(null);
  const isDefault = series.defaultPointsSystem === points.id;
  const qualifying = points.qualifying ?? [];
  const idPrefix = `points-${points.id}`;

  /**
   * Puts the system back on the championship.
   * @param next The system as changed
   */
  const apply = (next: PointsSystem): void => onChange(withPoints(series, points.id, next));

  /**
   * Replaces the system's tables with a template's.
   * @param from The template
   */
  const adopt = (from: PointsTemplate): void => apply({
    ...points,
    positions: from.positions,
    qualifying: from.qualifying,
    fastestLap: from.fastestLap,
  });

  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3 sm:px-5">
        <Input
          aria-label={t('editor.points.name')}
          className="w-60 font-semibold"
          value={points.name}
          disabled={locked}
          onChange={(event) => apply({ ...points, name: event.target.value })}
        />
        {isDefault ? (
          <Badge>{t('championships.points.default')}</Badge>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={locked}
            onClick={() => onChange({ ...series, defaultPointsSystem: points.id })}
          >
            {t('editor.rows.makeDefault')}
          </Button>
        )}
        <div className="ml-auto">
          <RowActions
            label={points.name}
            locked={locked}
            // A championship with no points systems cannot score a race.
            removable={series.pointsSystems.length > 1}
            extra={[{
              label: t('editor.points.duplicate'),
              icon: <CopyIcon />,
              onSelect: () => {
                const copy = { ...points, id: nextPoints(series).id, name: t('editor.points.copyName', { name: points.name }) };
                onChange(withAddedPoints(series, copy));
                onPick(copy.id);
              },
            }]}
            onRemove={() => {
              const next = withoutPoints(series, points.id);
              onChange(next);
              onPick(next.pointsSystems[0]?.id ?? '');
            }}
          />
        </div>
      </div>

      <NumberedStep number={1} title={t('editor.points.startFrom')} aside={t('editor.points.optional')}>
        <span className="text-xs text-muted-foreground">{t('editor.points.startFromHint')}</span>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-1.5">
          {POINTS_TEMPLATES.map((one) => (
            <button
              key={one.id}
              type="button"
              disabled={locked}
              className="flex min-w-0 flex-col gap-0.5 rounded-lg border bg-card px-2.5 py-2 text-left hover:bg-accent/60 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => (points.positions.length === 0 ? adopt(one) : setTemplate(one))}
            >
              <b className="text-xs font-semibold">{t(`editor.points.templates.${one.id}`)}</b>
              <span className="truncate text-xs text-muted-foreground tabular-nums">
                {one.positions.length === 0 ? t('editor.points.templateBlank') : one.positions.join(' ')}
              </span>
              {one.qualifying || one.fastestLap ? (
                <span className="truncate text-xs text-muted-foreground">
                  {[
                    one.qualifying ? t('editor.points.templateQualifying', { points: one.qualifying.join(' ') }) : null,
                    one.fastestLap ? t('editor.points.templateFastestLap', { points: one.fastestLap }) : null,
                  ].filter((part) => part !== null).join(', ')}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </NumberedStep>

      <NumberedStep number={2} title={t('editor.points.finishing')}>
        <PlaceStrip
          idPrefix={`${idPrefix}-finish`}
          kind="finish"
          values={points.positions}
          disabled={locked}
          summary={points.positions.length === 0
            ? t('editor.points.empty')
            : t('editor.points.finishingSummary', { count: points.positions.length })}
          onChange={(positions) => apply({ ...points, positions })}
        />
      </NumberedStep>

      <NumberedStep number={3} title={t('editor.points.qualifyingPlaces')}>
        {qualifying.length === 0 ? (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed px-3 py-2.5">
            <span className="min-w-0 flex-1 text-sm text-muted-foreground">{t('editor.points.qualifyingEmpty')}</span>
            <Button type="button" size="sm" variant="outline" disabled={locked} onClick={() => apply({ ...points, qualifying: [1] })}>
              {t('editor.points.payPole')}
            </Button>
          </div>
        ) : (
          <PlaceStrip
            idPrefix={`${idPrefix}-qualifying`}
            kind="qualifying"
            values={qualifying}
            disabled={locked}
            summary={t('editor.points.qualifyingSummary', { count: qualifying.length })}
            // Emptied, the bonus goes rather than being written as one paying nobody.
            onChange={(next) => apply({ ...points, qualifying: next.length === 0 ? undefined : next })}
          />
        )}
      </NumberedStep>

      <NumberedStep number={4} title={t('editor.points.fastestLap')}>
        <div className="flex flex-wrap items-center gap-3">
          <Switch
            id={`${idPrefix}-fastest-lap`}
            checked={points.fastestLap !== undefined && points.fastestLap > 0}
            disabled={locked}
            onCheckedChange={(on) => apply({ ...points, fastestLap: on ? 1 : undefined })}
          />
          <label htmlFor={`${idPrefix}-fastest-lap`} className="text-sm">{t('editor.points.fastestLapSwitch')}</label>
          <div className={cn('w-28', !points.fastestLap && 'opacity-50')}>
            <OffsetStepper
              id={`${idPrefix}-fastest-lap-points`}
              label={t('editor.points.fastestLap')}
              value={points.fastestLap}
              min={MIN_POINTS}
              limit={MAX_BONUS_POINTS}
              signed={false}
              disabled={locked || !points.fastestLap}
              onChange={(fastestLap) => apply({ ...points, fastestLap: fastestLap || undefined })}
            />
          </div>
          <span className="text-xs text-muted-foreground">{t('editor.points.pointsUnit')}</span>
        </div>
      </NumberedStep>

      <NumberedStep number={5} title={t('editor.points.paidBy')}>
        <span className="text-xs text-muted-foreground">{t('editor.points.paidByHint')}</span>
        <RacesPaying series={series} system={points.id} locked={locked} onChange={onChange} />
      </NumberedStep>

      <ConfirmDialog
        open={template !== null}
        title={t('editor.points.replaceTitle', { name: points.name, template: template ? t(`editor.points.templates.${template.id}`) : '' })}
        description={t('editor.points.replaceBody')}
        confirmLabel={t('editor.points.replace')}
        onClose={() => setTemplate(null)}
        onConfirm={() => { if (template) adopt(template); setTemplate(null); }}
      />
    </div>
  );
};

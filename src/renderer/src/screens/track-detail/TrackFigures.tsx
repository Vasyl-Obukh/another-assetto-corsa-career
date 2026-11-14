import { RotateCcwIcon, RotateCwIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { WIDTH_DIGITS } from './constants.ts';
import type { Track } from '../../../../shared/types';
import { Card } from '@/components/ui/card.tsx';
import { useUnits } from '@/hooks';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';
import { lengthText, spanOf, spanText } from '@/screens/track-browser';

interface TrackFiguresProps {
  /**
   * The layouts in view: the one the page is turned to, or all of them.
   */
  layouts: readonly Track[];
  /**
   * How many layouts the circuit has in all.
   */
  total: number;
}

/**
 * A circuit's figures in one band, as spans across its layouts until one is
 * chosen. A figure no layout states shows a dash, as the car page's do.
 */
export const TrackFigures = ({ layouts, total }: TrackFiguresProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const units = useUnits();

  const runs = new Set(layouts.map((layout) => layout.run).filter((run) => run !== null));
  const [run] = runs;
  const RunIcon = run === 'anticlockwise' ? RotateCcwIcon : RotateCwIcon;
  let direction: ReactNode = null;
  if (runs.size > 1) direction = t('tracks.detail.run.both');
  else if (run !== undefined) {
    direction = (
      <span className="inline-flex items-center gap-1.5 text-base">
        <RunIcon className="size-4" />
        {t(`tracks.detail.run.${run}`)}
      </span>
    );
  }

  const figures: { label: string; unit?: string; value: ReactNode }[] = [
    {
      label: t('tracks.detail.length'),
      unit: units.unit('distance'),
      value: lengthText(layouts, units),
    },
    {
      label: t('tracks.detail.width'),
      unit: units.unit('length'),
      value: spanText(spanOf(layouts, (layout) => layout.widthM), (metres) => units.figure('length', metres, WIDTH_DIGITS)),
    },
    { label: t('tracks.detail.pitboxes'), value: spanText(spanOf(layouts, (layout) => layout.pitboxes), formatNumber) },
    { label: t('tracks.detail.direction'), value: direction },
    { label: t('tracks.detail.layouts'), value: formatNumber(total) },
  ];

  return (
    <Card className="@container gap-0 py-0">
      <dl className="grid grid-cols-3 @2xl:grid-cols-5">
        {figures.map((figure, at) => (
          <div
            key={figure.label}
            className={cn(
              'flex flex-col-reverse justify-end gap-0.5 px-4 py-3',
              at % 3 !== 0 && 'border-l',
              at >= 3 && 'border-t @2xl:border-t-0',
              at === 3 && '@2xl:border-l',
            )}
          >
            <dt className="text-xs text-muted-foreground">{figure.label}</dt>
            <dd className="text-xl font-semibold tracking-tight tabular-nums">
              {figure.value === null ? (
                <span className="font-medium text-muted-foreground">{t('common.dash')}</span>
              ) : (
                <>
                  {figure.value}
                  {figure.unit === undefined ? null : (
                    <small className="ml-1 text-xs font-medium tracking-normal text-muted-foreground">{figure.unit}</small>
                  )}
                </>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
};

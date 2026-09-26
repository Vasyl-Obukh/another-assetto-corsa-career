import { XIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { LayoutCard } from './LayoutCard.tsx';
import type { CircuitChampionship } from './types.ts';
import { layoutShortName, longestFirst, racingOn } from './utils.ts';
import type { Track, TrackGroup } from '../../../../shared/types';
import { Button } from '@/components/ui/button.tsx';
import { useFormat } from '@/i18n';

interface TrackLayoutsProps {
  /**
   * The circuit.
   */
  circuit: TrackGroup;
  /**
   * The layout the page is turned to, or null for the whole circuit.
   */
  layout: Track | null;
  /**
   * Every championship at the circuit, or null while the library loads.
   */
  championships: readonly CircuitChampionship[] | null;
  /**
   * Turns the page to a layout, or back to the whole circuit.
   * @param next The layout, or null
   */
  onChoose: (next: Track | null) => void;
}

/**
 * A circuit's layouts as a row of cards, which double as the page's own
 * filter: picking one turns everything below to it.
 */
export const TrackLayouts = ({
  circuit, layout, championships, onChoose,
}: TrackLayoutsProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const mixedRuns = new Set(circuit.layouts.map((one) => one.run)).size > 1;

  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex min-h-8 items-center gap-2.5">
        <h2 className="text-base font-semibold">{t('tracks.detail.layouts')}</h2>
        <span className="text-sm text-muted-foreground tabular-nums">{formatNumber(circuit.layouts.length)}</span>
        {layout === null ? (
          <span className="ml-auto text-xs text-muted-foreground">{t('tracks.detail.layoutsHint')}</span>
        ) : (
          <Button type="button" size="sm" variant="ghost" className="ml-auto" onClick={() => onChoose(null)}>
            <XIcon />
            {t('tracks.detail.wholeCircuit')}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-3">
        {longestFirst(circuit.layouts).map((one) => (
          <LayoutCard
            key={one.key}
            layout={one}
            name={layoutShortName(one, circuit.name)}
            racing={championships === null ? null : racingOn(championships, one.layout)}
            showRun={mixedRuns}
            selected={one.key === layout?.key}
            onToggle={() => onChoose(one.key === layout?.key ? null : one)}
          />
        ))}
      </div>
    </section>
  );
};

import { TriangleAlertIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { MAX_CLASS_CARS } from './constants.ts';
import type { QuickClass } from '../../../../shared/types';
import { carSpecName } from '../../../../shared/utils/car-classes';
import { useClasses } from '@/app';
import { Badge } from '@/components/ui/badge.tsx';
import { classAccent } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';
import { OffsetStepper } from '@/screens/championship-editor';

interface QuickClassItemProps {
  /**
   * The class.
   */
  entry: QuickClass;
  /**
   * Where it sits among the race's classes, which picks its colour.
   */
  slot: number;
  /**
   * Whether the player races in it.
   */
  yours: boolean;
  /**
   * Whether the player's car is not one of its cars.
   */
  misfit: boolean;
  /**
   * How many of its cars are installed.
   */
  installed: number;
  /**
   * Whether it is the one open beside the list.
   */
  selected: boolean;
  /**
   * Whether the event has started, in which case nothing can change.
   */
  locked: boolean;
  /**
   * Called to open it.
   */
  onSelect: () => void;
  /**
   * Called with how many cars it should hold.
   * @param cars The count
   */
  onCount: (cars: number) => void;
}

/**
 * One class of a race event in the list down the side: its colour, its name,
 * what it races, whether it is the player's, and how many cars it holds - the
 * one number every class is set by, so it is in the row rather than a tab away.
 */
export const QuickClassItem = ({
  entry, slot, yours, misfit, installed, selected, locked, onSelect, onCount,
}: QuickClassItemProps) => {
  const { t } = useTranslation();
  const { catalogue } = useClasses();
  const accent = classAccent(slot);

  let races: string;
  if (installed === 0) races = t('race.classes.noCars');
  else if (entry.eligibility.kind === 'spec') races = carSpecName(entry.eligibility.spec, catalogue);
  else races = t('race.classes.carCount', { count: entry.eligibility.cars.length });

  return (
    <div
      className={cn(
        'relative flex items-center gap-3 overflow-hidden rounded-lg border bg-card py-2.5 pr-2.5 pl-4',
        selected ? 'border-primary ring-1 ring-primary' : 'hover:bg-accent/50',
      )}
    >
      <span className={cn('absolute inset-y-0 left-0 w-1', accent.mark)} aria-hidden />
      {/* The whole row opens the class, the stepper sitting above it. */}
      <button
        type="button"
        aria-pressed={selected}
        className="flex min-w-0 flex-1 flex-col gap-0.5 text-left after:absolute after:inset-0"
        onClick={onSelect}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate font-semibold">{entry.name}</span>
          {yours ? <Badge className="shrink-0 px-1.5 text-[11px]">{t('race.classes.yours')}</Badge> : null}
          {misfit ? (
            <TriangleAlertIcon
              className="size-3.5 shrink-0 text-warning-foreground dark:text-warning"
              aria-label={t('race.classes.misfit')}
            />
          ) : null}
        </span>
        <span className={cn('truncate text-xs', installed === 0 ? 'text-destructive' : 'text-muted-foreground')}>
          {races}
        </span>
      </button>
      <div className="relative z-10 w-28 shrink-0">
        <OffsetStepper
          id={`class-${entry.id}-cars`}
          label={t('race.classes.cars', { name: entry.name })}
          value={entry.cars}
          min={yours ? 1 : 0}
          limit={MAX_CLASS_CARS}
          signed={false}
          small
          disabled={locked}
          onChange={(next) => onCount(next ?? (yours ? 1 : 0))}
        />
      </div>
    </div>
  );
};

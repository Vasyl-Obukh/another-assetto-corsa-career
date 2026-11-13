import { ArrowDownIcon, ArrowUpIcon, Trash2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Field } from './Field.tsx';
import type { QuickClass, SeriesGrid } from '../../../../shared/types';
import { carsOf } from '../../../../shared/utils/eligibility';
import { useClasses } from '@/app';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Card } from '@/components/ui/card.tsx';
import { Input } from '@/components/ui/input.tsx';
import { useCarNames } from '@/hooks';
import { classAccent } from '@/lib/accents';
import { EligibilityField, GridFields } from '@/screens/championship-editor';

interface QuickClassPanelProps {
  /**
   * The class.
   */
  entry: QuickClass;
  /**
   * Where it sits among the race's classes.
   */
  slot: number;
  /**
   * How many classes the race has, so the last cannot move further down.
   */
  count: number;
  /**
   * How many of its cars are installed.
   */
  installed: number;
  /**
   * The race's own AI offsets, which the class's are laid over.
   */
  raceGrid: SeriesGrid;
  /**
   * Whether the event has started, in which case nothing can change.
   */
  locked: boolean;
  /**
   * Called with what changes about the class.
   * @param patch The change
   */
  onChange: (patch: Partial<Omit<QuickClass, 'id'>>) => void;
  /**
   * Called to move the class earlier or later in the order it lines up.
   * @param by How far, positive being later
   */
  onMove: (by: number) => void;
  /**
   * Called to take the class out.
   */
  onRemove: () => void;
}

/**
 * One class of a race event, opened beside the list: its name, what it
 * races, as the championship editor writes a class's cars, and how its drivers
 * drive, as the figures they race at. A championship's seats, teams and purse
 * have no meaning for a single race and are not here.
 */
export const QuickClassPanel = ({
  entry, slot, count, installed, raceGrid, locked, onChange, onMove, onRemove,
}: QuickClassPanelProps) => {
  const { t } = useTranslation();
  const { catalogue } = useClasses();
  const grid = entry.grid ?? {};
  const cars = carsOf(entry.eligibility, catalogue);
  const carName = useCarNames(cars);
  const idPrefix = `class-${entry.id}`;

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
        <Badge className={classAccent(slot).chip}>{entry.name}</Badge>
        {/* Green once the install can field it, red while it cannot. */}
        {installed > 0 ? (
          <Badge variant="success">{t('race.classes.installed', { count: installed })}</Badge>
        ) : <Badge variant="destructive">{t('race.classes.noCars')}</Badge>}
        <div className="ml-auto flex items-center gap-0.5">
          <Button type="button" size="icon" variant="ghost" aria-label={t('race.classes.earlier')} disabled={locked || slot === 0} onClick={() => onMove(-1)}>
            <ArrowUpIcon />
          </Button>
          <Button type="button" size="icon" variant="ghost" aria-label={t('race.classes.later')} disabled={locked || slot === count - 1} onClick={() => onMove(1)}>
            <ArrowDownIcon />
          </Button>
          <Button type="button" size="sm" variant="ghost" className="text-destructive" disabled={locked} onClick={onRemove}>
            <Trash2Icon />
            {t('race.classes.remove')}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <Field id={`${idPrefix}-name`} label={t('race.classes.name')}>
          <Input
            id={`${idPrefix}-name`}
            value={entry.name}
            disabled={locked}
            onChange={(event) => onChange({ name: event.target.value })}
          />
        </Field>
        <EligibilityField
          idPrefix={idPrefix}
          eligibility={entry.eligibility}
          locked={locked}
          nameOf={carName}
          onChange={(eligibility) => onChange({ eligibility })}
        />

        <h3 className="border-t pt-4 text-sm font-semibold">{t('race.classes.drivers')}</h3>
        <GridFields
          grid={grid}
          above={[{ label: t('race.ai.race'), grid: raceGrid }]}
          own={t('race.ai.class')}
          idPrefix={idPrefix}
          locked={locked}
          onChange={(next) => onChange({ grid: next })}
        />
      </div>
    </Card>
  );
};

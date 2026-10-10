import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CarListField } from './CarListField.tsx';
import { CarShots } from './CarShots.tsx';
import { ChoiceChips } from './ChoiceChips.tsx';
import { MIN_MODELS } from './constants.ts';
import { OffsetStepper } from './OffsetStepper.tsx';
import { DEFAULT_MIN_MODELS } from '../../../../shared/constants';
import type { ClassCatalogue, Eligibility, SpecId } from '../../../../shared/types';
import { carSpecName, carSpecsOf } from '../../../../shared/utils/car-classes';
import { carsOf } from '../../../../shared/utils/eligibility';
import { useClasses } from '@/app';
import { CarPicker, SpecField } from '@/components';
import { cn } from '@/lib/utils.ts';
import { Field } from '@/screens/race';

/**
 * The two ways a rule can be written, in the order the menu offers them.
 *
 * A spec first, because it is what most championships are: a grid the catalogue
 * already knows, satisfied by whichever of it the user owns.
 */
const KINDS: Eligibility['kind'][] = ['spec', 'cars'];

/**
 * Which spec a rule switched onto a spec should name.
 *
 * Taken from the first car the list already held, where the catalogue knows
 * one - swapping a one-make series onto "the grid those cars race on" is the
 * likely intent, and it is a guess the author can see and change. The first
 * spec in the catalogue otherwise, because Eligibility has no way to say "a
 * spec, not chosen yet".
 * @param cars The cars the rule named, if it named any
 * @param catalogue The class catalogue to look the cars up in
 * @returns The spec to start from
 */
const specFor = (cars: readonly string[], catalogue: ClassCatalogue): SpecId => {
  const [first] = cars.flatMap((car) => [...carSpecsOf(car, catalogue)]);

  return first ?? catalogue.specById.keys().next().value ?? '';
};

interface EligibilityFieldProps {
  /**
   * What makes these controls' ids unique on the page.
   */
  idPrefix: string;
  /**
   * The rule being edited.
   */
  eligibility: Eligibility;
  /**
   * Whether an event is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Names a car, for the ones the library could resolve.
   * @param car The car folder ID
   * @returns What to show for it
   */
  nameOf: (car: string) => string;
  /**
   * Called with the whole rule whenever any part of it changes.
   * @param next The rule to apply
   */
  onChange: (next: Eligibility) => void;
  /**
   * Whether a list of cars is shown as chips, or every car as pictures - a
   * class panel's way, with the add tile first in a list.
   */
  showCars?: boolean;
  /**
   * Whether a grid asks how many of its models must be installed. A single race
   * of the player's own asks nothing of the kind: it races whatever is there.
   */
  minModels?: boolean;
  /**
   * The cars a grid is pictured by, where that is not every car it names - a
   * championship's class shows only what the install can field.
   */
  pictured?: readonly string[];
}

/**
 * What a class may be driven in: a catalogued grid, or the cars themselves -
 * the same question for a class, for a round swapping one class's cars, and
 * for a class of a race of the player's own.
 */
export const EligibilityField = ({
  idPrefix, eligibility, locked, nameOf, onChange, showCars = true, minModels = true, pictured,
}: EligibilityFieldProps) => {
  const { t } = useTranslation();
  const { catalogue } = useClasses();
  const [picking, setPicking] = useState(false);

  const cars = eligibility.kind === 'cars' ? eligibility.cars : [];
  const listed = eligibility.kind === 'spec' && pictured ? pictured : carsOf(eligibility, catalogue);

  return (
    <div className="flex flex-col gap-4">
      <div className={cn('grid items-end gap-4', minModels ? 'md:grid-cols-[auto_minmax(0,1fr)_9rem]' : 'md:grid-cols-[auto_minmax(0,1fr)]')}>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{t('editor.eligibility.kind')}</span>
          {/* Neutral on purpose: two ways of writing one rule, not a set any
              other screen colours. */}
          <ChoiceChips<Eligibility['kind']>
            label={t('editor.eligibility.kind')}
            options={KINDS}
            value={eligibility.kind}
            labelOf={(kind) => t(kind === 'spec' ? 'editor.eligibility.spec' : 'editor.eligibility.cars')}
            disabled={locked}
            onChange={(kind) => {
              if (kind === eligibility.kind) return;
              // A car list starts empty rather than from the spec's own grid:
              // writing thirty catalogue ids into the document is a decision,
              // and one nobody asked for.
              if (kind === 'cars') onChange({ kind: 'cars', cars: [] });
              else onChange({ kind: 'spec', spec: specFor(cars, catalogue) });
            }}
          />
        </div>

        {eligibility.kind === 'spec' ? (
          <>
            <Field id={`${idPrefix}-spec`} label={t('editor.eligibility.specLabel')}>
              <SpecField
                id={`${idPrefix}-spec`}
                value={eligibility.spec}
                disabled={locked}
                onChange={(spec) => onChange({ ...eligibility, spec })}
              />
            </Field>

            {minModels ? (
              <Field id={`${idPrefix}-min-models`} label={t('editor.eligibility.minModels')}>
                {/* Bounded by the spec itself: it cannot ask for more models
                    than the catalogue puts on the grid. */}
                <OffsetStepper
                  id={`${idPrefix}-min-models`}
                  label={t('editor.eligibility.minModels')}
                  value={eligibility.minModels ?? DEFAULT_MIN_MODELS}
                  min={MIN_MODELS}
                  limit={Math.max(MIN_MODELS, carsOf(eligibility, catalogue).length)}
                  signed={false}
                  disabled={locked}
                  onChange={(next) => onChange({ ...eligibility, minModels: next })}
                />
              </Field>
            ) : null}
          </>
        ) : null}
      </div>

      {eligibility.kind === 'spec' && minModels ? (
        <p className="-mt-2 text-xs text-muted-foreground">
          {t('editor.eligibility.minModelsOf', {
            count: carsOf(eligibility, catalogue).length,
            spec: carSpecName(eligibility.spec, catalogue),
          })}
          {' '}
          {t('editor.eligibility.minModelsHint')}
        </p>
      ) : null}

      {eligibility.kind === 'cars' && showCars ? (
        <CarListField
          cars={eligibility.cars}
          locked={locked}
          nameOf={nameOf}
          onChange={(next) => onChange({ kind: 'cars', cars: next })}
          onAdd={() => setPicking(true)}
        />
      ) : null}

      {/* The cars as pictures, the add tile first in a list the author writes. */}
      {!showCars && listed.length === 0 && eligibility.kind === 'spec' ? (
        <p className="text-sm text-muted-foreground">{t('editor.eligibility.noCars')}</p>
      ) : null}
      {!showCars && (listed.length > 0 || eligibility.kind === 'cars') ? (
        <CarShots
          cars={listed}
          nameOf={nameOf}
          locked={locked}
          onAdd={eligibility.kind === 'cars' ? () => setPicking(true) : undefined}
          onRemove={eligibility.kind === 'cars'
            ? (car) => onChange({ kind: 'cars', cars: listed.filter((one) => one !== car) })
            : undefined}
        />
      ) : null}

      {/* Over the whole library rather than a restricted set: this is the rule
          that decides what the class may field, so there is nothing narrower to
          narrow it by. No livery step - a rule names a model. */}
      <CarPicker
        open={picking}
        pickSkin={false}
        onOpenChange={setPicking}
        onPick={(car) => {
          // Naming a car twice would field it twice over, and the list is
          // ordered, so the first mention is the one that matters.
          if (!cars.includes(car.id)) onChange({ kind: 'cars', cars: [...cars, car.id] });
        }}
      />
    </div>
  );
};

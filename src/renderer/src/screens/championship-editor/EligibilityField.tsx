import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CarListField } from './CarListField.tsx';
import { MIN_MODELS } from './constants.ts';
import { NumberField } from './NumberField.tsx';
import { DEFAULT_MIN_MODELS } from '../../../../shared/constants';
import type { ClassCatalogue, Eligibility, SpecId } from '../../../../shared/types';
import { carSpecName, carSpecsOf } from '../../../../shared/utils/car-classes';
import { useClasses } from '@/app';
import { CarPicker } from '@/components';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx';
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
   * Whether a weekend is under way, in which case nothing may change.
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
}

/**
 * What a class may be driven in: a catalogued grid, or the cars themselves.
 *
 * Used twice, which is why it is not part of the entry editor - a round may
 * replace one class's rule for that round alone, and it is the same question
 * asked about a shorter span.
 */
export const EligibilityField = ({
  idPrefix, eligibility, locked, nameOf, onChange,
}: EligibilityFieldProps) => {
  const { t } = useTranslation();
  const { catalogue } = useClasses();
  const [picking, setPicking] = useState(false);

  const cars = eligibility.kind === 'cars' ? eligibility.cars : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field id={`${idPrefix}-kind`} label={t('editor.eligibility.kind')}>
          <Select
            value={eligibility.kind}
            disabled={locked}
            onValueChange={(value) => {
              // A car list starts empty rather than from the spec's own grid:
              // writing thirty catalogue ids into the document is a decision,
              // and one nobody asked for.
              if (value === 'cars') onChange({ kind: 'cars', cars: [] });
              else onChange({ kind: 'spec', spec: specFor(cars, catalogue) });
            }}
          >
            <SelectTrigger id={`${idPrefix}-kind`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KINDS.map((kind) => (
                <SelectItem key={kind} value={kind}>
                  {t(kind === 'spec' ? 'editor.eligibility.spec' : 'editor.eligibility.cars')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {eligibility.kind === 'spec' ? (
          <>
            <Field id={`${idPrefix}-spec`} label={t('editor.eligibility.specLabel')}>
              <Select
                value={eligibility.spec}
                disabled={locked}
                onValueChange={(spec) => onChange({ ...eligibility, spec })}
              >
                <SelectTrigger id={`${idPrefix}-spec`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {/* Grouped by class: a flat list of over a hundred specs is
                      unreadable, and the class is the grouping a reader already
                      knows the names of. A class with no specs has nothing to offer. */}
                  {catalogue.classes.filter((group) => group.specs.length > 0).map((group) => (
                    <SelectGroup key={group.id}>
                      <SelectLabel>{group.name}</SelectLabel>
                      {group.specs.map((spec) => (
                        <SelectItem key={spec} value={spec}>{carSpecName(spec, catalogue)}</SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <NumberField
              id={`${idPrefix}-min-models`}
              label={t('editor.eligibility.minModels')}
              hint={t('editor.eligibility.minModelsHint')}
              value={eligibility.minModels}
              min={MIN_MODELS}
              placeholder={String(DEFAULT_MIN_MODELS)}
              disabled={locked}
              onChange={(minModels) => onChange({ ...eligibility, minModels })}
            />
          </>
        ) : null}
      </div>

      {eligibility.kind === 'cars' ? (
        <CarListField
          idPrefix={idPrefix}
          cars={eligibility.cars}
          locked={locked}
          nameOf={nameOf}
          onChange={(next) => onChange({ kind: 'cars', cars: next })}
          onAdd={() => setPicking(true)}
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

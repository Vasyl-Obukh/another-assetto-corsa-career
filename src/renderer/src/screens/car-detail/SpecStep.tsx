import { useTranslation } from 'react-i18next';

import type { ClassPicks } from './types.ts';
import type { ClassId, SpecId } from '../../../../shared/types';
import { carClassName, carSpecName } from '../../../../shared/utils/car-classes';
import { useClasses } from '@/app';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import { Field } from '@/screens/race';

interface SpecStepProps {
  /**
   * What the form holds.
   */
  picks: ClassPicks;
  /**
   * Whether a command is running, which freezes the choices.
   */
  busy: boolean;
  /**
   * Chooses the spec for one class.
   * @param carClass The class
   * @param spec Its spec
   */
  onPick: (carClass: ClassId, spec: SpecId) => void;
}

export const SpecStep = ({ picks, busy, onPick }: SpecStepProps) => {
  const { t } = useTranslation();
  const { catalogue } = useClasses();

  // One select per class rather than one list of every spec, so two specs of a
  // class - two eras of one category at once - cannot be chosen at all.
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {picks.classes.map((carClass) => (
        <Field key={carClass} id={`classify-${carClass}`} label={carClassName(carClass, catalogue)}>
          <Select
            value={picks.specs[carClass] ?? ''}
            disabled={busy}
            onValueChange={(spec) => onPick(carClass, spec)}
          >
            <SelectTrigger id={`classify-${carClass}`} className="w-full">
              <SelectValue placeholder={t('cars.classify.pickSpec')} />
            </SelectTrigger>
            <SelectContent>
              {(catalogue.classById.get(carClass)?.specs ?? []).map((spec) => (
                <SelectItem key={spec} value={spec}>{carSpecName(spec, catalogue)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      ))}
    </div>
  );
};

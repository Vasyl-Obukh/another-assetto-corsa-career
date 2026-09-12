import { useTranslation } from 'react-i18next';

import { REGULATION_FLAGS, REGULATIONS } from './constants.ts';
import { Field } from './Field.tsx';
import { fromNumber, toNumber } from './utils.ts';
import { DEFAULT_ASSISTS } from '../../../../shared/constants';
import type { Assists } from '../../../../shared/types';
import { ToggleButton } from '@/components';
import { Input } from '@/components/ui/input.tsx';

interface RegulationsInputsProps {
  /**
   * The regulations as the race describes them.
   */
  assists: Assists;
  /**
   * Whether the weekend has started, in which case they cannot change - a
   * sprint and a feature run under one set of rules or they are not one event.
   */
  locked: boolean;
  /**
   * Called with the whole set whenever any part of it changes.
   * @param assists The assists to apply
   */
  onChange: (assists: Assists) => void;
}

/**
 * The rules themselves, without a card around them.
 *
 * Its own component so the series editor can put them in one section with the
 * championship's other rules.
 */
export const RegulationsInputs = ({ assists, locked, onChange }: RegulationsInputsProps) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {REGULATIONS.map(({ key, id }) => (
        <Field key={key} id={id} label={t(`race.regulations.${key}`)}>
          <Input
            id={id}
            type="number"
            min={0}
            placeholder={String(DEFAULT_ASSISTS[key])}
            value={fromNumber(assists[key])}
            disabled={locked}
            onChange={(event) => onChange({ ...assists, [key]: toNumber(event.target.value) })}
          />
        </Field>
      ))}

      {/* In the same grid as the numbers rather than a settings-style row
          beneath them: it is one more rule of the same set, and the on/off
          control is the one the settings screen uses. */}
      {REGULATION_FLAGS.map(({ key, id }) => (
        <Field key={key} id={id} label={t(`race.regulations.${key}`)}>
          <ToggleButton
            id={id}
            value={assists[key] ?? DEFAULT_ASSISTS[key]}
            disabled={locked}
            onChange={(next) => onChange({ ...assists, [key]: next })}
          />
        </Field>
      ))}
    </div>
  );
};

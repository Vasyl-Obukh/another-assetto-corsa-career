import { useTranslation } from 'react-i18next';

import { REGULATION_FLAGS, REGULATIONS } from './constants.ts';
import { RegulationSlider } from './RegulationSlider.tsx';
import { DEFAULT_ASSISTS } from '../../../../shared/constants';
import type { Assists } from '../../../../shared/types';
import { Switch } from '@/components/ui/switch.tsx';

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
 * The rules themselves, without a card around them: each measured one on a
 * slider bounded to what Assetto Corsa takes, and the allowed-or-not ones as
 * switches.
 */
export const RegulationsInputs = ({ assists, locked, onChange }: RegulationsInputsProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      {REGULATIONS.map((spec) => (
        <RegulationSlider
          key={spec.key}
          spec={spec}
          value={assists[spec.key]}
          real={DEFAULT_ASSISTS[spec.key]}
          disabled={locked}
          onChange={(next) => onChange({ ...assists, [spec.key]: next })}
        />
      ))}

      {REGULATION_FLAGS.map(({ key, id }) => (
        <div key={key} className="flex items-center justify-between gap-3">
          <label htmlFor={id} className="text-sm font-medium">{t(`race.regulations.${key}`)}</label>
          <Switch
            id={id}
            checked={assists[key] ?? DEFAULT_ASSISTS[key]}
            disabled={locked}
            onCheckedChange={(next) => onChange({ ...assists, [key]: next })}
          />
        </div>
      ))}
    </div>
  );
};

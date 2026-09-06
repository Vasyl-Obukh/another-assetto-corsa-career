import { useTranslation } from 'react-i18next';

import { REGULATION_FLAGS, REGULATIONS } from './constants.ts';
import { Field } from './Field.tsx';
import { fromNumber, toNumber } from './utils.ts';
import { DEFAULT_ASSISTS } from '../../../../shared/constants';
import type { Assists } from '../../../../shared/types';
import { ToggleButton } from '@/components';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { Input } from '@/components/ui/input.tsx';

interface RegulationsFieldsProps {
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

export const RegulationsFields = ({ assists, locked, onChange }: RegulationsFieldsProps) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('race.regulations.label')}</CardTitle>
        <CardDescription>{t('race.regulations.hint')}</CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
      </CardContent>
    </Card>
  );
};

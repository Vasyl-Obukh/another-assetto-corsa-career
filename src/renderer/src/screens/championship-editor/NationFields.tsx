import { useTranslation } from 'react-i18next';

import { NATION_CODE_LENGTH } from './constants.ts';
import { optionalText } from './utils.ts';
import type { Team } from '../../../../shared/types';
import { Input } from '@/components/ui/input.tsx';
import { Field } from '@/screens/race';

/**
 * Where somebody or something is from, which a team and a driver say alike.
 */
type Nation = Pick<Team, 'nationality' | 'nationCode'>;

interface NationFieldsProps {
  /**
   * What makes these controls' ids unique on the page.
   */
  idPrefix: string;
  /**
   * Where they are from as it stands.
   */
  nation: Nation;
  /**
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Called with both fields whenever either changes.
   * @param next What to apply
   */
  onChange: (next: Nation) => void;
}

/**
 * The nationality and the three-letter code, which a team and a driver both
 * carry and Assetto Corsa reads off a [CAR_n] either way.
 */
export const NationFields = ({
  idPrefix, nation, locked, onChange,
}: NationFieldsProps) => {
  const { t } = useTranslation();

  return (
    <>
      <Field id={`${idPrefix}-nationality`} label={t('editor.nation.nationality')}>
        <Input
          id={`${idPrefix}-nationality`}
          value={nation.nationality ?? ''}
          disabled={locked}
          onChange={(event) => onChange({
            ...nation,
            nationality: optionalText(event.target.value),
          })}
        />
      </Field>

      <Field id={`${idPrefix}-nation-code`} label={t('editor.nation.nationCode')}>
        <Input
          id={`${idPrefix}-nation-code`}
          value={nation.nationCode ?? ''}
          maxLength={NATION_CODE_LENGTH}
          disabled={locked}
          onChange={(event) => onChange({
            ...nation,
            nationCode: optionalText(event.target.value.toUpperCase()),
          })}
        />
      </Field>
    </>
  );
};

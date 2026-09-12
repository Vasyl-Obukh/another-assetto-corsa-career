import { useTranslation } from 'react-i18next';

import { RegulationsInputs } from './RegulationsInputs.tsx';
import type { Assists } from '../../../../shared/types';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';

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

      <CardContent>
        <RegulationsInputs assists={assists} locked={locked} onChange={onChange} />
      </CardContent>
    </Card>
  );
};

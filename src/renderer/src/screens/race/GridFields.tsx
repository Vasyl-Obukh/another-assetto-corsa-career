import { useTranslation } from 'react-i18next';

import {
  MAX_AI, MAX_GRID, MIN_AI, MIN_GRID,
} from './constants.ts';
import { Field } from './Field.tsx';
import { fromNumber, toNumber } from './utils.ts';
import type { GridDefinition } from '../../../../shared/types';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { Input } from '@/components/ui/input.tsx';

interface GridFieldsProps {
  /**
   * The AI field as the race describes it.
   */
  grid: GridDefinition;
  /**
   * Whether the weekend has started, in which case the field cannot change.
   */
  locked: boolean;
  /**
   * Called with the whole grid whenever any part of it changes.
   * @param grid The grid to apply
   */
  onChange: (grid: GridDefinition) => void;
}

export const GridFields = ({ grid, locked, onChange }: GridFieldsProps) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('race.grid.label')}</CardTitle>
        <CardDescription>{t('race.grid.spread')}</CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Field id="race-grid-size" label={t('race.grid.size')}>
          <Input
            id="race-grid-size"
            type="number"
            min={MIN_GRID}
            max={MAX_GRID}
            value={fromNumber(grid.size)}
            disabled={locked}
            onChange={(event) => onChange({ ...grid, size: toNumber(event.target.value) })}
          />
        </Field>

        <Field id="race-ai-level" label={t('race.grid.aiLevel')}>
          <Input
            id="race-ai-level"
            type="number"
            min={MIN_AI}
            max={MAX_AI}
            value={fromNumber(grid.aiLevel)}
            disabled={locked}
            onChange={(event) => onChange({ ...grid, aiLevel: toNumber(event.target.value) })}
          />
        </Field>

        <Field id="race-ai-level-min" label={t('race.grid.aiLevelMin')}>
          <Input
            id="race-ai-level-min"
            type="number"
            min={MIN_AI}
            max={MAX_AI}
            value={fromNumber(grid.aiLevelMin)}
            disabled={locked}
            onChange={(event) => onChange({ ...grid, aiLevelMin: toNumber(event.target.value) })}
          />
        </Field>

        <Field id="race-ai-aggression" label={t('race.grid.aiAggression')}>
          <Input
            id="race-ai-aggression"
            type="number"
            min={MIN_AI}
            max={MAX_AI}
            value={fromNumber(grid.aiAggression)}
            disabled={locked}
            onChange={(event) => onChange({ ...grid, aiAggression: toNumber(event.target.value) })}
          />
        </Field>
      </CardContent>
    </Card>
  );
};

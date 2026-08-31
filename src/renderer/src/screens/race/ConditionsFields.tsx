import { SettingsIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ConditionsDialog } from './ConditionsDialog.tsx';
import { ConditionsSummaryLine } from './ConditionsSummaryLine.tsx';
import type {
  Conditions, Weather, WeatherController, WeatherSystem,
} from '../../../../shared/types';
import { Button } from '@/components/ui/button.tsx';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';

interface ConditionsFieldsProps {
  /**
   * The weather, time and track state the weekend defaults to.
   */
  conditions: Conditions;
  /**
   * Every installed weather preset.
   */
  weather: Weather[];
  /**
   * Every installed CSP weather controller.
   */
  controllers: WeatherController[];
  /**
   * Which mod renders the weather, which decides whether slots are offered.
   */
  system: WeatherSystem;
  /**
   * Whether RainFX will draw rain.
   */
  rainFx: boolean;
  /**
   * Whether the weekend has started, in which case none of this can change.
   */
  locked: boolean;
  /**
   * Called with the whole set whenever any part of it changes.
   * @param conditions The conditions to apply
   */
  onChange: (conditions: Conditions) => void;
}

export const ConditionsFields = ({
  conditions, weather, controllers, system, rainFx, locked, onChange,
}: ConditionsFieldsProps) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('race.conditions.label')}</CardTitle>
        <CardDescription>{t('race.conditions.defaultsHint')}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-wrap items-center justify-between gap-4">
        <ConditionsSummaryLine conditions={conditions} />

        <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>
          <SettingsIcon />
          {t('race.conditions.edit')}
        </Button>
      </CardContent>

      <ConditionsDialog
        open={editing}
        title={t('race.conditions.dialogWeekend')}
        description={t('race.conditions.dialogWeekendHint')}
        conditions={conditions}
        showTimeOfDay
        weather={weather}
        controllers={controllers}
        system={system}
        rainFx={rainFx}
        allowSlots={false}
        idPrefix="race"
        locked={locked}
        onOpenChange={setEditing}
        onChange={onChange}
      />
    </Card>
  );
};

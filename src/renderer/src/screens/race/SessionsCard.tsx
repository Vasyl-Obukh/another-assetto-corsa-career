import { useTranslation } from 'react-i18next';

import { ConditionsSummaryLine } from './ConditionsSummaryLine.tsx';
import type { Championship, QuickRace } from '../../../../shared/types';
import { playerClassOf } from '../../../../shared/utils/quick-race';
import { useSettings } from '@/app';
import { Card } from '@/components/ui/card.tsx';
import { useWeatherContent } from '@/hooks';
import { classAccent } from '@/lib/accents';
import { ConditionsEditor, SessionsSplit } from '@/screens/championship-editor';

interface SessionsCardProps {
  /**
   * The race weekend.
   */
  race: QuickRace;
  /**
   * The championship it lowers through, for the session page's own needs.
   */
  championship: Championship | null;
  /**
   * Whether the weekend has started, in which case nothing can change.
   */
  locked: boolean;
  /**
   * Called with the race whenever a session or the weekend's conditions
   * change.
   * @param next The race
   */
  onChange: (next: QuickRace) => void;
}

/**
 * A race weekend's sessions, as the championship editor lays out a weekend
 * format: the days down the side, the session picked opened beside them, and
 * the weekend's own conditions at the head of the list, which every session
 * runs in unless it says otherwise.
 */
export const SessionsCard = ({
  race, championship, locked, onChange,
}: SessionsCardProps) => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { weather, controllers } = useWeatherContent();
  const format = { id: 'weekend', name: '', sessions: race.sessions };
  const yours = playerClassOf(race);
  const startClass = yours
    ? { name: yours.name, count: yours.cars, chip: classAccent(race.classes.indexOf(yours)).chip }
    : undefined;

  if (!championship) return null;

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <SessionsSplit
        series={championship}
        format={format}
        weather={weather}
        controllers={controllers}
        system={settings.weatherSystem}
        locked={locked}
        scoring={false}
        behind="weekend"
        flat
        startClass={startClass}
        head={{
          label: t('race.weekend.whole'),
          detail: <ConditionsSummaryLine conditions={race.conditions} className="truncate text-xs" />,
          page: (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-baseline gap-2">
                <h3 className="text-base font-semibold">{t('race.weekend.whole')}</h3>
                <span className="text-xs text-muted-foreground">{t('race.weekend.wholeHint')}</span>
              </div>
              <ConditionsEditor
                idPrefix="weekend"
                conditions={race.conditions}
                behind="default"
                layout="rows"
                scope="weekend"
                weather={weather}
                controllers={controllers}
                system={settings.weatherSystem}
                locked={locked}
                onChange={(conditions) => onChange({ ...race, conditions })}
              />
            </div>
          ),
        }}
        onChange={(next) => onChange({ ...race, sessions: next.sessions })}
      />
    </Card>
  );
};

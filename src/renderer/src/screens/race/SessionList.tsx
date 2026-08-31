import { PlusIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { SessionRow } from './SessionRow.tsx';
import { moveSession, nextSession } from './utils.ts';
import type {
  Conditions, SessionDefinition, Weather, WeatherController, WeatherSystem,
} from '../../../../shared/types';
import { resolveConditions } from '../../../../shared/utils/conditions';
import { Button } from '@/components/ui/button.tsx';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';

interface SessionListProps {
  /**
   * The sessions, in the order they run. Each is a launch of its own.
   */
  sessions: SessionDefinition[];
  /**
   * The weekend's own conditions, which every session inherits from.
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
   * How many launches have been run, which badges each session.
   */
  completed: number;
  /**
   * Whether the weekend has started, in which case the list cannot change.
   */
  locked: boolean;
  /**
   * Called with the whole list whenever any part of it changes.
   * @param sessions The sessions to apply
   */
  onChange: (sessions: SessionDefinition[]) => void;
}

export const SessionList = ({
  sessions, conditions, weather, controllers, system, rainFx, completed, locked, onChange,
}: SessionListProps) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('race.sessions.label')}</CardTitle>
        <CardDescription>{t('race.sessions.clockHint')}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('race.sessions.empty')}</p>
        ) : null}

        {sessions.map((session, index) => (
          <SessionRow
            // Sessions carry no identity of their own and are reordered by
            // index, so their position is the only key there is.
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            session={session}
            index={index}
            count={sessions.length}
            resolved={resolveConditions(conditions, session.conditions)}
            weather={weather}
            controllers={controllers}
            system={system}
            rainFx={rainFx}
            completed={completed}
            locked={locked}
            onChange={(next) => onChange(sessions.map((own, at) => (at === index ? next : own)))}
            onMove={(by) => onChange(moveSession(sessions, index, by))}
            onRemove={() => onChange(sessions.filter((_, at) => at !== index))}
          />
        ))}

        <div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={locked}
            onClick={() => onChange([...sessions, nextSession(sessions)])}
          >
            <PlusIcon />
            {t('race.sessions.add')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

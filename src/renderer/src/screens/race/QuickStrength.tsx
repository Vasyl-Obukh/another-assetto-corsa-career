import { useTranslation } from 'react-i18next';

import { AI_RANGE, DRIVER_STRENGTH_SPREAD } from '../../../../shared/constants';
import type { QuickRaceView } from '../../../../shared/types';
import { aiFigure } from '../../../../shared/utils/ai-figure';
import { useSettings } from '@/app';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { useFormat } from '@/i18n';
import { AiResult } from '@/screens/championship-editor';
import { RacedStrength, StrengthBetween, StrengthClasses } from '@/screens/event';

interface QuickStrengthProps {
  /**
   * The race event, once a session of it has run.
   */
  view: QuickRaceView;
  /**
   * Called with the race's new step.
   * @param step The step, zero for none
   */
  onChange: (step: number) => void;
}

/**
 * A race event's own step on the AI's strength once it is under way - the one
 * thing about it the setup no longer holds still - and once it is over, what
 * each session ran at. Its classes' own strengths stay as they were set.
 */
export const QuickStrength = ({ view, onChange }: QuickStrengthProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const { settings } = useSettings();

  const { race, championship } = view;
  const entry = race.playerClass;
  if (!entry || !championship) return null;

  const yours = settings.opponents.strength;
  const step = race.grid?.strength ?? 0;
  const own = championship.entries.find((one) => one.id === entry)?.grid?.strength ?? 0;

  if (view.phase === 'finished') {
    return <RacedStrength sessions={view.sessions} entry={entry} hint={t('strength.racedHintQuick')} />;
  }

  return (
    <Card className="gap-3 py-3">
      <CardHeader className="px-3">
        <CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t('strength.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-3">
        <AiResult
          id="race-strength"
          label={t('strength.race')}
          hint={t('strength.raceHint')}
          base={yours}
          layers={[{ label: t('race.ai.class'), value: own }]}
          own={t('race.ai.race')}
          value={step === 0 ? undefined : step}
          spread={DRIVER_STRENGTH_SPREAD}
          ends={[formatNumber(AI_RANGE.min), formatNumber(AI_RANGE.max)]}
          // Never held, as a round's is not: a step reaches only later launches.
          locked={false}
          bare
          onChange={(next) => onChange(next ?? 0)}
        />

        {championship.entries.length > 1 ? (
          <StrengthClasses
            mine={entry}
            classes={championship.entries.map((one) => ({
              entry: one.id,
              name: one.name,
              figure: aiFigure(yours, step, one.grid?.strength ?? 0),
            }))}
          />
        ) : null}

        <StrengthBetween sessions={view.sessions} entry={entry} extra={t('strength.quickLocked')} />
      </CardContent>
    </Card>
  );
};

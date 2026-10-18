import { ChevronRightIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { RacedStrength } from './RacedStrength.tsx';
import { StrengthBetween } from './StrengthBetween.tsx';
import { StrengthClasses } from './StrengthClasses.tsx';
import { StrengthNote } from './StrengthNote.tsx';
import { AI_RANGE, DRIVER_STRENGTH_SPREAD } from '../../../../shared/constants';
import type { CareerEventView, EventEntry, EventStrength } from '../../../../shared/types';
import { aiFigure } from '../../../../shared/utils/ai-figure';
import { careerOpponents } from '../../../../shared/utils/career-settings';
import { useSettings, useSlot } from '@/app';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { useFormat } from '@/i18n';
import { AiResult } from '@/screens/championship-editor';

interface RoundStrengthProps {
  /**
   * The round.
   */
  view: CareerEventView;
  /**
   * How the career is entered in it.
   */
  entered: EventEntry;
  /**
   * What the AI's strength in it is made of.
   */
  strength: EventStrength;
  /**
   * Where the championship's page is, for the season's own step - or null for
   * a historic event, which is one event and has no season to step.
   */
  championship: string | null;
  /**
   * Called with the round's new step.
   * @param step The step, zero for none
   */
  onChange: (step: number) => void;
}

/**
 * The AI's strength in one of the career's rounds: the player's own step for
 * it, over everything below, until the round is over - and then what each of
 * its sessions ran at. The season's own step is the championship page's.
 */
export const RoundStrength = ({
  view, entered, strength, championship, onChange,
}: RoundStrengthProps) => {
  const { t } = useTranslation();
  const { formatNumber, formatSigned } = useFormat();
  const { settings } = useSettings();
  const { career } = useSlot();

  // The career's own difficulty where it sets one.
  const yours = careerOpponents(settings, career?.settings ?? null).strength;
  const own = strength.classes.find((one) => one.entry === entered.entry)?.offset ?? 0;
  // Everything every class shares: the championship's, the round's and the season's.
  const under = strength.championship + strength.round + strength.season;

  if (!strength.editable) {
    return (
      <RacedStrength
        sessions={view.sessions}
        entry={entered.entry}
        hint={t(strength.classes.length > 1 ? 'strength.racedHintClass' : 'strength.racedHint')}
      />
    );
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
          id="round-strength"
          label={t('strength.round')}
          hint={view.roundName}
          base={yours}
          layers={[
            {
              label: t(championship === null ? 'historic.strength.event' : 'race.ai.championship'),
              value: strength.championship,
            },
            { label: t('race.ai.class'), value: own },
            // Named in the chain only where the round states one, which few do.
            ...(strength.round === 0 ? [] : [{ label: t('race.ai.round'), value: strength.round }]),
            ...(championship === null ? [] : [{ label: t('race.ai.season'), value: strength.season }]),
          ]}
          own={t('race.ai.thisRound')}
          value={strength.step === 0 ? undefined : strength.step}
          spread={DRIVER_STRENGTH_SPREAD}
          ends={[formatNumber(AI_RANGE.min), formatNumber(AI_RANGE.max)]}
          // Never held: a launch out at the game raced what it set out with, and
          // a step reaches only the launches after it.
          locked={false}
          bare
          onChange={(next) => onChange(next ?? 0)}
        />

        {strength.classes.length > 1 ? (
          <StrengthClasses
            mine={entered.entry}
            classes={strength.classes.map((one) => ({
              entry: one.entry,
              name: one.name,
              figure: aiFigure(yours, under, one.offset, strength.step),
            }))}
          />
        ) : null}

        {championship === null ? null : (
          <StrengthNote>
            {strength.season === 0
              ? t('strength.seasonNoteNone')
              : t('strength.seasonNote', { step: formatSigned(strength.season) })}
            {' '}
            <Link to={championship} className="inline-flex items-center font-medium text-primary hover:underline">
              {t('strength.seasonLink')}
              <ChevronRightIcon className="size-3.5" />
            </Link>
          </StrengthNote>
        )}
        <StrengthBetween sessions={view.sessions} entry={entered.entry} />
      </CardContent>
    </Card>
  );
};

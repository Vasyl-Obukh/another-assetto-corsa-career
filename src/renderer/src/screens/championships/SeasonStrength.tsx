import { RotateCcwIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { AI_RANGE, DRIVER_STRENGTH_SPREAD } from '../../../../shared/constants';
import type { ChampionshipRun, SeasonEntry } from '../../../../shared/types';
import { aiFigure } from '../../../../shared/utils/ai-figure';
import { careerOpponents } from '../../../../shared/utils/career-settings';
import { useSettings, useSlot } from '@/app';
import { Button } from '@/components/ui/button.tsx';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { useFormat } from '@/i18n';
import { path } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';
import { AiResult } from '@/screens/championship-editor';

interface SeasonStrengthProps {
  /**
   * The edition the career is in.
   */
  entry: SeasonEntry;
  /**
   * What the edition is called - its year, or its half or quarter of one - or
   * null where that is not known.
   */
  edition: string | null;
  /**
   * The run a round's link names.
   */
  run: Partial<ChampionshipRun>;
  /**
   * Called with the season's new step.
   * @param step The step, zero for none
   */
  onChange: (step: number) => void;
}

/**
 * The player's own step on the AI's strength for every round of an edition the
 * career is in, and the rounds that carry a step of their own on top of it -
 * each set on its round's page.
 */
export const SeasonStrength = ({
  entry, edition, run, onChange,
}: SeasonStrengthProps) => {
  const { t } = useTranslation();
  const { formatNumber, formatSigned } = useFormat();
  const { settings } = useSettings();
  const { career } = useSlot();

  const { championship } = entry;
  // The career's own difficulty where it sets one.
  const yours = careerOpponents(settings, career?.settings ?? null).strength;
  const champ = championship.grid?.strength ?? 0;
  const own = championship.entries.find((one) => one.id === entry.entry)?.grid?.strength ?? 0;
  const season = entry.strength ?? 0;
  // Only rounds still to come: one already run raced at what it recorded, which
  // today's figures would misstate.
  const adjusted = entry.events.filter((one) => one.status === 'scheduled' && (one.strength ?? 0) !== 0);

  return (
    <Card className="gap-3 py-3">
      <CardHeader className="flex items-center justify-between gap-2 px-3">
        <CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t('strength.title')}
        </CardTitle>
        {season === 0 ? null : (
          <Button type="button" variant="ghost" size="sm" className="-my-1 h-7" onClick={() => onChange(0)}>
            <RotateCcwIcon />
            {t('strength.reset')}
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-3">
        <AiResult
          id="season-strength"
          label={t('strength.season')}
          hint={edition === null
            ? t('strength.seasonHint', { series: championship.name })
            : t('strength.seasonHintEdition', { series: championship.name, edition })}
          base={yours}
          layers={[
            { label: t('race.ai.championship'), value: champ },
            { label: t('race.ai.class'), value: own },
          ]}
          own={t('race.ai.season')}
          value={season === 0 ? undefined : season}
          spread={DRIVER_STRENGTH_SPREAD}
          ends={[formatNumber(AI_RANGE.min), formatNumber(AI_RANGE.max)]}
          locked={false}
          bare
          onChange={(next) => onChange(next ?? 0)}
        />

        {adjusted.length > 0 ? (
          <div className="flex flex-col gap-0.5 border-t pt-2.5">
            <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
              {t('strength.ownRounds')}
            </span>
            {adjusted.map((event) => {
              const round = championship.rounds.find((one) => one.id === event.round);
              const step = event.strength ?? 0;

              return (
                <Link
                  key={event.round}
                  to={path.event({ series: entry.series, round: event.round }, run)}
                  className="-mx-1.5 grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2.5 rounded-md px-1.5 py-1 text-sm hover:bg-accent"
                >
                  <span className="truncate">{round?.name ?? event.round}</span>
                  {/* Signed in colour, as every offset stepper is. */}
                  <span className={cn('font-semibold tabular-nums', step > 0 ? 'text-success' : 'text-destructive')}>
                    {formatSigned(step)}
                  </span>
                  <span className="w-7 text-right font-semibold tabular-nums">
                    {formatNumber(aiFigure(yours, champ, own, round?.grid?.strength ?? 0, season, step))}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

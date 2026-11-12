import { RotateCcwIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import type { ChampionshipRun, SeasonEntry } from '../../../../shared/types';
import { rainAllowed } from '../../../../shared/utils/wet-weather';
import { RainChip } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { path } from '@/lib/routes';
import { SwitchLine } from '@/screens/championship-editor';

interface SeasonRainProps {
  /**
   * The edition the career is in.
   */
  entry: SeasonEntry;
  /**
   * The run a round's link names.
   */
  run: Partial<ChampionshipRun>;
  /**
   * Whether a command is under way.
   */
  busy: boolean;
  /**
   * Called with the season's new say.
   * @param rain Whether rain is allowed, or null to follow the championship
   */
  onChange: (rain: boolean | null) => void;
}

/**
 * Whether every round of an edition the career is in may race in the wet, and
 * the rounds still to come that say otherwise - each set on its round's page.
 */
export const SeasonRain = ({
  entry, run, busy, onChange,
}: SeasonRainProps) => {
  const { t } = useTranslation();
  const { championship } = entry;
  const allowed = rainAllowed(championship, entry);
  // Only rounds still to come, and only where they differ from the season.
  const own = entry.events.filter((one) => (
    one.status === 'scheduled' && one.rain !== undefined && one.rain !== allowed
  ));

  return (
    <Card className="gap-3 py-3">
      <CardHeader className="flex items-center justify-between gap-2 px-3">
        <CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t('rain.title')}
        </CardTitle>
        {entry.rain === undefined ? null : (
          <Button type="button" variant="ghost" size="sm" className="-my-1 h-7" disabled={busy} onClick={() => onChange(null)}>
            <RotateCcwIcon />
            {t('rain.reset')}
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-3">
        <SwitchLine
          id="season-rain"
          label={t('rain.allow')}
          value={allowed}
          disabled={busy}
          onChange={onChange}
        />
        {entry.rain === undefined ? (
          <span className="text-xs text-muted-foreground">{t('rain.followsChampionship')}</span>
        ) : null}

        {own.length > 0 ? (
          <div className="flex flex-col gap-0.5 border-t pt-2.5">
            <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
              {t('rain.ownRounds')}
            </span>
            {own.map((event) => (
              <Link
                key={event.round}
                to={path.event({ series: entry.series, round: event.round }, run)}
                className="-mx-1.5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2.5 rounded-md px-1.5 py-1 text-sm hover:bg-accent"
              >
                <span className="truncate">
                  {championship.rounds.find((one) => one.id === event.round)?.name ?? event.round}
                </span>
                <RainChip allowed={event.rain ?? allowed} />
              </Link>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

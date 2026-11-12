import { ChevronRightIcon, LockIcon, RotateCcwIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { StrengthNote } from './StrengthNote.tsx';
import type { CareerEventView } from '../../../../shared/types';
import { RainChip } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { sessionName } from '@/lib/session-labels';
import { SwitchLine } from '@/screens/championship-editor';

interface RoundRainProps {
  /**
   * The round, entered.
   */
  view: CareerEventView;
  /**
   * Where the championship's page is, for the season's own say - or null for a
   * historic event, which is one event and has no season.
   */
  championship: string | null;
  /**
   * Whether a command is under way.
   */
  busy: boolean;
  /**
   * Called with the round's new say.
   * @param rain Whether rain is allowed, or null to follow the season
   */
  onChange: (rain: boolean | null) => void;
}

/**
 * Whether one of the career's rounds may race in the wet, until its first
 * session runs - and then what it is racing under.
 */
export const RoundRain = ({
  view, championship, busy, onChange,
}: RoundRainProps) => {
  const { t } = useTranslation();
  const { rain } = view;
  // A session simulated with a reserve driver raced no weather of the player's.
  const first = view.sessions.find((one) => one.record !== null && !one.record.skipped);

  const title = (
    <CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
      {t('rain.title')}
    </CardTitle>
  );

  if (!rain.editable) {
    // A round passed by with nothing driven has nothing to say about its weather.
    if (!first) return null;

    return (
      <Card className="gap-3 py-3">
        <CardHeader className="flex items-center justify-between gap-2 px-3">
          {title}
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <LockIcon className="size-3.5" />
            {t('rain.raced')}
          </span>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-2 px-3">
          <RainChip allowed={rain.allowed} />
          <span className="text-xs text-muted-foreground">
            {t('rain.fixed', { session: sessionName(first, t) })}
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gap-3 py-3">
      <CardHeader className="flex items-center justify-between gap-2 px-3">
        {title}
        {rain.own === null ? null : (
          <Button type="button" variant="ghost" size="sm" className="-my-1 h-7" disabled={busy} onClick={() => onChange(null)}>
            <RotateCcwIcon />
            {t('rain.reset')}
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-3">
        <SwitchLine
          id="round-rain"
          label={t('rain.allow')}
          value={rain.allowed}
          disabled={busy}
          onChange={onChange}
        />
        {rain.own === null ? (
          <span className="text-xs text-muted-foreground">
            {t(championship === null ? 'rain.followsChampionship' : 'rain.followsSeason')}
          </span>
        ) : null}
        {championship === null ? null : (
          <StrengthNote>
            {t(rain.season ? 'rain.seasonAllowed' : 'rain.seasonNotAllowed')}
            {' '}
            <Link to={championship} className="inline-flex items-center font-medium text-primary hover:underline">
              {t('rain.change')}
              <ChevronRightIcon className="size-3.5" />
            </Link>
          </StrengthNote>
        )}
      </CardContent>
    </Card>
  );
};

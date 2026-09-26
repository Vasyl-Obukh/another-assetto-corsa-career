import { TrophyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { QuickRaceView } from '../../../../shared/types';
import { DriverName, ResultCell, ResultStrip } from '@/components';
import type { StripFigure } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { classAccent, SESSION_ACCENT } from '@/lib/accents';
import { seatNation } from '@/lib/season-results';
import { SESSION_TYPE_LABEL, sessionName } from '@/lib/session-labels';
import { playerPosition } from '@/screens/event';

interface WeekendResultsProps {
  /**
   * The race weekend, once anything of it has run.
   */
  view: QuickRaceView;
  /**
   * What the player is called.
   */
  playerName: string;
}

/**
 * A race weekend of the player's own once it has run: where the player
 * finished every session, and who won each race in every class - the round
 * page's results, without the points and the standings a single race does not
 * have.
 */
export const WeekendResults = ({ view, playerName }: WeekendResultsProps) => {
  const { t } = useTranslation();
  const ran = view.sessions.filter((one) => one.record !== null);
  const races = view.score?.races ?? [];
  const seat = view.grid[0]?.seat;

  const figures: StripFigure[] = ran.map((one) => {
    const position = one.place?.classPosition ?? playerPosition(one.record);

    return {
      label: sessionName(one, t),
      value: position === null
        ? t('standings.none')
        : <ResultCell position={position} scored={false} quiet={one.type !== 'race'} prefixed size="lg" />,
      detail: t(SESSION_TYPE_LABEL[one.type]),
    };
  });

  return (
    <div className="flex flex-col gap-4">
      {figures.length > 0 ? <ResultStrip figures={figures} /> : null}

      {races.length > 0 ? (
        <section className="flex flex-col gap-3 rounded-xl border p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <TrophyIcon className="size-4 text-podium-gold-foreground" />
            {t('event.summary.winners')}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {races.map((race) => (
              <div key={race.launch} className="flex flex-col gap-2 rounded-lg border p-3">
                <Badge className={`self-start ${SESSION_ACCENT.race}`}>{race.name}</Badge>
                {view.race.classes.map((one, slot) => {
                  const winner = race.places.find((place) => place.entry === one.id && place.classPosition === 1);
                  if (!winner) return null;
                  const you = winner.seat === seat;

                  return (
                    <span key={one.id} className="flex items-center gap-2 text-sm">
                      {view.race.classes.length > 1 ? (
                        <Badge className={classAccent(slot).chip}>{one.name}</Badge>
                      ) : null}
                      <ResultCell size="sm" position={1} scored />
                      <DriverName
                        name={you ? playerName : winner.driver}
                        nation={view.championship ? seatNation(view.championship, winner.seat) : undefined}
                        player={you}
                      />
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};
